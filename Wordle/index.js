const dictionary = ['earth', 'plane', 'crane', 'audio', 'house'];

const state = {
    secret: dictionary[Math.floor(Math.random() * dictionary.length)],
    grid: Array(6)
        .fill()
        .map(() => Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
};

function updateGrid() {
    for (let i = 0; i < state.grid.length; i++) {
        for (let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`);
            if (box) {
                box.textContent = state.grid[i][j];
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
            removeLetter();
        } else if (isLetter(key)) {
            addLetter(key);
        }

        updateGrid();
    };
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

    const game = document.getElementById('game');
    game.innerHTML = '';
    drawGrid(game);
    updateGrid();

    console.log(`New Secret Word: ${state.secret}`);
}

// "Start Game" 버튼을 누르면 "Restart Game" 버튼 활성화, "Start Game" 버튼은 비활성화
function handleStartGame() {
    startup();

    const startButton = document.getElementById('start-btn');
    const restartButton = document.getElementById('restart-btn');

    if (startButton) {
        startButton.disabled = true; // Start 버튼 비활성화
        startButton.style.opacity = "0.5";
        startButton.style.cursor = "not-allowed";
    }

    if (restartButton) {
        restartButton.disabled = false; // Restart 버튼 활성화
        restartButton.style.opacity = "1";
        restartButton.style.cursor = "pointer";
    }
}

function startup() {
    const game = document.getElementById('game');

    game.innerHTML = '';
    drawGrid(game);
    registerKeyboardEvents();

    console.log(`Secret Word: ${state.secret}`);
}


document.getElementById('start-btn').addEventListener('click', handleStartGame);
document.getElementById('restart-btn').addEventListener('click', restartGame);

// "Restart Game" 버튼을 초기 비활성화 상태로 설정
document.getElementById('restart-btn').disabled = true;
document.getElementById('restart-btn').style.opacity = "0.5";
document.getElementById('restart-btn').style.cursor = "not-allowed";
