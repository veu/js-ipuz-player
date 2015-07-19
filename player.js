(function () {
    'use strict';

    function Selection(clue, x, y, across, primary) {
        var cells = [], isPrimary = !primary;

        this.x = x;
        this.y = y;
        this.offset = primary ? across ? primary.x - x : primary.y - y : 0;
        this.across = across;
        this.class = across ? 'across' : 'down';
        this.clue = clue;

        if (clue) {
            clue.classList.add(isPrimary ? 'selected' : 'active');
        }

        while (document.querySelector('td[data-index="' + [x, y] + '"] .letter')) {
            cells.push(document.querySelector('td[data-index="' + [x, y] + '"]'));
            across ? x++ : y++;
        }

        cells.forEach(function (cell) {
            cell.classList.add(this.class);
        }, this);

        function updateDone() {
            var done = cells.every(function (cell) {
                return cell.querySelector('.letter').textContent;
            });
            if (done) {
                clue.classList.add('done');
            } else {
                clue.classList.remove('done');
            }
        }

        this.remove = function () {
            if (clue) clue.classList.remove(isPrimary ? 'selected' : 'active');
            cells.forEach(function (cell) {
                cell.classList.remove(this.class);
            }, this);
        };

        this.clear = function () {
            cells.forEach(function (cell) {
                cell.querySelector('.letter').textContent = '';
            });
            updateDone();
        };

        this.enterLetter = function (letter) {
            cells[this.offset].querySelector('.letter').textContent = letter;
            updateDone();
            this.offset = (this.offset + 1) % cells.length;
        };

        this.togglePrimary = function () {
            isPrimary = !isPrimary;
            clue.classList.remove(isPrimary ? 'active' : 'selected');
            clue.classList.add(isPrimary ? 'selected' : 'active');
        };

        this.solve = function (solution) {
            var x = this.x, y = this.y;
            cells.forEach(function (cell) {
                cell.querySelector('.letter').textContent = solution[y][x];
                across ? x++ : y++;
            });
            updateDone();
        };
    }

    window.IpuzPlayer = function (solution) {
        var keys = {LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, INSERT: 45, DELETE: 46, A: 65, Z: 90},
            selectedClue,
            selections = [];

        function selectClue(clue) {
            var index = clue.dataset['index'].split(','),
                across = clue.classList.contains('across');

            selections.forEach(function (selection) {
                selection.remove();
            });

            selectedClue = clue;
            selections = [createSelection(+index[0], +index[1], across)];
            updateSecondarySelection(selections[0]);
        }

        function createSelection(x, y, across, primary) {
            if (primary) {
                if (across) {
                    y += primary.offset;
                    while (document.querySelector('td[data-index="' + [x-1, y] + '"] .letter')) {
                        x--;
                    }
                } else {
                    x += primary.offset;
                    while (document.querySelector('td[data-index="' + [x, y-1] + '"] .letter')) {
                        y--;
                    }
                }
            }
            var selector = '.clue.' + (across ? 'across' : 'down') + '[data-index="' + [x, y] + '"]';
            return new Selection(document.querySelector(selector), x, y, across, primary);
        }

        function updateSecondarySelection(primary) {
            if (selections[1]) {
                selections[1].remove();
            }
            selections[1] = createSelection(primary.x, primary.y, !primary.across, primary);
        }

        function clearSelection() {
            selections[0].clear();
            updateSecondarySelection(selections[0]);
        }

        function solveSelection() {
            selections[0].solve(solution);
        }

        function swapPrimary() {
            if (selections[1].clue) {
                selectedClue = selections[1].clue;
                selections.forEach(function (selection) { selection.togglePrimary(); });
                selections.push(selections.shift());
            }
        }

        function selectPrevious() {
            var clue = selectedClue.previousSibling;
            if (!clue) {
                clue = document.querySelector('.clue.' + selections[0].class + ':last-of-type');
            }
            selectClue(clue);
        }

        function selectNext() {
            var clue = selectedClue.nextSibling;
            if (!clue) {
                clue = document.querySelector('.clue.' + selections[0].class + ':first-of-type');
            }
            selectClue(clue);
        }

        function enterLetter(letter) {
            selections[0].enterLetter(letter);
            updateSecondarySelection(selections[0]);
        }

        selectClue(document.querySelector('.clue.down:first-of-type'));

        document.onclick = function (event) {
            if (event.target.classList.contains('clue')) {
                selectClue(event.target);
            }
        };

        document.onkeydown = function (event) {
            if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
                return;
            }

            if (event.keyCode == keys.LEFT || event.keyCode == keys.RIGHT) {
                swapPrimary();
            }
            if (event.keyCode == keys.UP) {
                selectPrevious();
            }
            if (event.keyCode == keys.DOWN) {
                selectNext();
            }
            if (event.keyCode >= keys.A && event.keyCode <= keys.Z) {
                enterLetter(String.fromCharCode(event.keyCode));
            }
            if (event.keyCode == keys.INSERT) {
                solveSelection();
            }
            if (event.keyCode == keys.DELETE) {
                clearSelection();
            }
        };
    };
})();
