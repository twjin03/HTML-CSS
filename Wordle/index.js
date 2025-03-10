import { dictionary } from "./words.js";

const state = {
    secret: dictionary[Math.floor(Math.random() * dictionary.length)],
    grid: Array(6).fill().map(() => Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
    gameStarted: false
};

function updateGrid() {
    for (let i = 0; i < state.grid.length; i++) {
        for (let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`);
            if (box) {
                box.textContent = state.grid[i][j] || '';
            }
        }
    }
}

function updateKeyboardColors() {
    const guessedLetters = {};
    
    for (let i = 0; i < state.currentRow; i++) {
        for (let j = 0; j < 5; j++) {
            const letter = state.grid[i][j];
            if (!letter) continue;
            
            const key = document.querySelector(`.key[data-key="${letter}"]`);
            if (!key) continue;

            if (state.secret[j] === letter) {
                key.classList.add('right');
                guessedLetters[letter] = 'right';
            } else if (state.secret.includes(letter) && guessedLetters[letter] !== 'right') {
                key.classList.add('wrong');
                guessedLetters[letter] = 'wrong';
            } else if (!state.secret.includes(letter) && !guessedLetters[letter]) {
                key.classList.add('empty');
                guessedLetters[letter] = 'empty';
            }
        }
    }
}

function drawBox(container, row, col, letter = '') {
    const box = document.createElement('div');
    box.className = 'box';
    box.id = `box${row}${col}`;
    box.textContent = letter;
    container.appendChild(box);
    return box;
}

function drawGrid(container) {
    const grid = document.createElement('div');
    grid.className = 'grid';

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            drawBox(grid, i, j);
        }
    }

    container.appendChild(grid);
}

function registerKeyboardEvents() {
    document.body.onkeydown = (e) => {
        if (!state.gameStarted) return;
        
        const key = e.key.toLowerCase();

        if (key === 'enter') {
            if (state.currentCol === 5) {
                const word = getCurrentWord();
                if (isWordValid(word)) {
                    revealWord(word);
                    state.currentRow++;
                    state.currentCol = 0;

                    if (word === state.secret) {
                        setTimeout(() => {
                            alert('Congratulations!');
                            restartGame();
                            // 정답일 경우 재시작
                        }, 1500);
                        return;
                    }

                    if (state.currentRow === 6) {
                        setTimeout(() => {
                            alert(`Try again! The word was ${state.secret}`);
                            restartGame();
                            // 6번 시도 후 실패 시 재시작 
                        }, 1500);
                        return;
                    }
                } else {
                    alert('Invalid Word!');
                }
            }
        } else if (key === 'backspace') {
            if (state.currentCol > 0) {  
                removeLetter();
            }
        } else if (isLetter(key)) {
            addLetter(key);
        }

        updateGrid();
    };
}

function registerVirtualKeyboardEvents() {
    document.querySelectorAll('.key').forEach(button => {
        button.addEventListener('click', () => {
            if (!state.gameStarted) return;
            
            const key = button.getAttribute('data-key');

            if (key === 'enter') {
                if (state.currentCol === 5) {
                    const word = getCurrentWord();
                    if (isWordValid(word)) {
                        revealWord(word);
                        state.currentRow++;
                        state.currentCol = 0;

                        if (word === state.secret) {
                            setTimeout(() => {
                                alert('Congratulations!');
                                restartGame();
                            }, 1500);
                            return;
                        }

                        if (state.currentRow === 6) {
                            setTimeout(() => {
                                alert(`Try again! The word was ${state.secret}`);
                                restartGame();
                            }, 1500);
                            return;
                        }
                    } else {
                        alert('Invalid Word!');
                    }
                }
            } else if (key === 'backspace') {
                if (state.currentCol > 0) {  
                    removeLetter();
                }
            } else if (isLetter(key)) {
                addLetter(key);
            }

            updateGrid();
        });
    });
}


function getCurrentWord() {
    return state.grid[state.currentRow].join('');
}

function isWordValid(word) {
    return dictionary.includes(word);
}

function revealWord(guess) {
    const row = state.currentRow;
    const animation_duration = 500;

    for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`box${row}${i}`);
        const letter = box.textContent;

        setTimeout(() => {
            if (letter === state.secret[i]) {
                box.classList.add('right');
            } else if (state.secret.includes(letter)) {
                box.classList.add('wrong');
            } else {
                box.classList.add('empty');
            }
            updateKeyboardColors();
        }, ((i + 1) * animation_duration) / 2);

        box.classList.add('animated');
        box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
    }
}

function isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter) {
    if (state.currentCol === 5) return;
    state.grid[state.currentRow][state.currentCol] = letter;
    state.currentCol++;
}

function removeLetter() {
    if (state.currentCol === 0) return;
    state.currentCol--;
    state.grid[state.currentRow][state.currentCol] = '';
}

function restartGame() {
    state.secret = dictionary[Math.floor(Math.random() * dictionary.length)];
    state.grid = Array(6).fill().map(() => Array(5).fill(''));
    state.currentRow = 0;
    state.currentCol = 0;
    state.gameStarted = true;

    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('right', 'wrong', 'empty');
    });

    const game = document.getElementById('game');
    game.innerHTML = '';
    drawGrid(game);
    updateGrid();
    registerKeyboardEvents();
    registerVirtualKeyboardEvents();

    console.log(`New Secret Word: ${state.secret}`);
}

function handleStartGame() {
    state.gameStarted = true;
    startup();

    const startButton = document.getElementById('start-btn');
    const restartButton = document.getElementById('restart-btn');

    if (startButton) {
        startButton.disabled = true;
        startButton.style.opacity = "0.5";
        startButton.style.cursor = "not-allowed";
    }

    if (restartButton) {
        restartButton.disabled = false;
        restartButton.style.opacity = "1";
        restartButton.style.cursor = "pointer";
    }
}

function startup() {
    const game = document.getElementById('game');
    game.innerHTML = '';
    drawGrid(game);
    registerKeyboardEvents();
    registerVirtualKeyboardEvents();

    console.log(`Secret Word: ${state.secret}`);
}

document.getElementById('start-btn').addEventListener('click', handleStartGame);
document.getElementById('restart-btn').addEventListener('click', restartGame);
document.getElementById('restart-btn').disabled = true;
document.getElementById('restart-btn').style.opacity = "0.5";
document.getElementById('restart-btn').style.cursor = "not-allowed";
