# JS IPUZ Player

Simple player for [.ipuz](http://www.ipuz.org/) files in JS with python HTML generator.

The HTML page can be viewed without JavaScript.
When JavaScript is enabled the player shows a cursor and two selections:
a primary selection (yellow clue) and a secondary selection (white clue).
Entering letters fills the crossword, selected clues can be switched by
clicking or with the keyboard (see Keys below).

## Usage

Generate HTML file from an IPUZ file called *crossword.ipuz*.
```
python3 generate-html.py crossword.ipuz > crossword.html
```
Optionally you can install the `ipuz` library to validate the puzzle.
```
python3 -m pip install ipuz
```

## Keys

Key | Function
--- | --------
down | select next clue
up | select previous clue
left / right | switch primary selection
A-Z | enter letter
insert | solve primary selection
delete | clear primary selection

## Missing features

IPUZ is a complex format that supports a variety of puzzles and styles and
this is a very basic implementation for american crosswords so there's a ton
of stuff missing.
Here's a list of features that's not supported:

* StyleSpecs beyond circles
* Verifying the solution
* Enumerations
* Answer(s)
* Clueplacement
* Hints
* Saved status
* Zones
