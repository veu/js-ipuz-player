#!/usr/bin/python3

import sys, json

USAGE = 'Usage: {} <file>'.format(sys.argv[0])

def html(tag, content, attributes = {}):
    attr = ''.join(' {}="{}"'.format(i, a) for i, a in attributes.items())
    if hasattr(content, '__iter__'):
        content = ''.join(content)
    return '<{0}{1}>{2}</{0}>'.format(tag, attr, content)

def wrap(tag, attributes = {}):
    def iwrap(f):
        def wrapped(*args, **kwargs):
            return html(tag, f(*args, **kwargs), attributes)
        return wrapped
    return iwrap

class HtmlGenerator:
    template = """<html><head><meta charset="utf-8">
<link rel="stylesheet" href="//code.cdn.mozilla.net/fonts/fira.css">
<link rel="stylesheet" href="style.css">
</head><body>
<div><h1>{title}</h1>{puzzle}{description}</div>
{down}
{across}
<script src="player.js"></script>
<script>new IpuzPlayer({solution})</script></body></html>
"""

    displayedFields = [
        'copyright', 'publisher', 'publication', 'url', 'uniqueid', 'intro',
        'author', 'editor', 'date', 'notes', 'difficulty', 'origin'
    ]

    def __init__(self, puzzle):
        self.puzzle = puzzle
        self.block = self.puzzle.get('block', '#')
        self.empty = self.puzzle.get('empty', 0)

    @wrap('dl')
    def genDescription(self):
        for name in self.displayedFields:
            if name in self.puzzle:
                yield html('dt', name) + html('dd', self.puzzle[name])

    @wrap('ol')
    def genClues(self, section):
        for clue in self.puzzle['clues'][section]:
            if type(clue) is list:
                nr, text = clue
            elif type(clue) is dict:
                nr, text = clue['number'], clue['clue']

            yield html('li', text, {'value': nr, 'data-index': self.getIndex(nr), 'class': 'clue ' + section.lower()})

    @wrap('div', {'class': 'clues'})
    def genClueBlock(self, section):
        return html('h2', section) + self.genClues(section)

    def getIndex(self, nr):
        for y, row in enumerate(self.puzzle['puzzle']):
            for x, cell in enumerate(row):
                if type(cell) is dict:
                    cell = cell['cell']
                if str(cell) == str(nr):
                    return '{},{}'.format(x,y)

    @wrap('table', {'class': 'puzzle'})
    def genPuzzle(self):
        for y, row in enumerate(self.puzzle['puzzle']):
            yield self.genPuzzleRow(y, row)

    def genPuzzleCell(self, x, y, cell):
        classes = []
        if type(cell) is dict:
            if cell.get('style', {}).get('shapebg') == 'circle':
                classes.append('circle')
            cell = cell['cell']

        letter = ''
        if cell is None:
            classes.append('empty')
        elif cell == self.block:
            classes.append('block')
        else:
            letter = html('span', '', {'class': 'letter'})

        attributes = {'data-index': '{},{}'.format(x, y)}

        nr = ''
        if str(cell) not in map(str, [self.block, self.empty]):
            nr = html('span', cell, {'class': 'nr'})
            attributes['data-nr'] = cell

        if len(classes):
            attributes['class'] = ' '.join(classes)
        return html('td', nr + letter, attributes)

    @wrap('tr')
    def genPuzzleRow(self, y, row):
        for x, cell in enumerate(row):
            yield self.genPuzzleCell(x, y, cell)

    def genSolution(self):
         solution = self.puzzle['solution']
         return [[self.mapSolutionCell(cell) for cell in row] for row in solution]

    def mapSolutionCell(self, value):
        if value is None or str(value) == str(self.block):
            return '#'
        return value

    def genHtml(self):
        return self.template.format(
            title=self.puzzle['title'],
            puzzle=self.genPuzzle(),
            description=self.genDescription(),
            down=self.genClueBlock('Down'),
            across=self.genClueBlock('Across'),
            solution=self.genSolution()
        )

if len(sys.argv) < 2:
    sys.stderr.write('Error: Missing crossword file\n{}\n'.format(USAGE))
    exit(1)

with open(sys.argv[1]) as file:
    try:
        import ipuz
        puzzle = ipuz.core.read(file.read())
    except:
        puzzle = json.load(file)

sys.stdout.write(HtmlGenerator(puzzle).genHtml())
