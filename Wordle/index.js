import { dictionary } from "./words.js"; // 5자리 단어 import

const state = {
    secret: "",
    grid: [],
    currentRow: 0,
    currentCol: 0,
    gameStarted: false
};

function initState() {
    state.secret = dictionary[Math.floor(Math.random() * dictionary.length)];
    state.grid = Array.from({ length: 6 }, () => Array(5).fill(''));
    state.currentRow = 0;
    state.currentCol = 0;
    state.gameStarted = true;
}

function drawGrid() {
    const container = document.getElementById("game");
    container.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "grid";
    container.appendChild(grid);

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const box = document.createElement("div");
            box.className = "box";
            box.id = `box${i}${j}`;
            grid.appendChild(box);
        }
    }
}

function updateGrid() {
    state.grid.forEach((row, i) => {
        row.forEach((letter, j) => {
            document.getElementById(`box${i}${j}`).textContent = letter;
        });
    });
}

function updateKeyboardColors() {
    document.querySelectorAll(".key").forEach(key => key.classList.remove("right", "wrong", "empty"));
    const guessedLetters = {};

    for (let i = 0; i < state.currentRow; i++) {
        state.grid[i].forEach((letter, j) => {
            const key = document.querySelector(`.key[data-key="${letter}"]`);
            if (!key) return;

            if (state.secret[j] === letter) {
                key.classList.add("right");
                guessedLetters[letter] = "right";
            } else if (state.secret.includes(letter) && guessedLetters[letter] !== "right") {
                key.classList.add("wrong");
                guessedLetters[letter] = "wrong";
            } else {
                key.classList.add("empty");
            }
        });
    }
}

function showFloatingDialog(message, dialog_duration) {
    const container = document.getElementById("floating-dialog-container");
    const dialog = document.createElement("div");
    dialog.className = "floating-dialog";
    dialog.innerHTML = message;
    container.appendChild(dialog);

    dialog.style.animation = `fadeOut ${dialog_duration / 1000}s ease-in-out forwards`;

    setTimeout(() => {
        dialog.remove();
    }, dialog_duration);
}

function handleInput(key) {
    if (!state.gameStarted) return;

    if (key === "enter") {
        if (state.currentCol === 5) checkWord();
        else showFloatingDialog("Not enough letters", 2000);
    } else if (key === "backspace") {
        removeLetter();
    } else if (isLetter(key)) {
        addLetter(key);
    }
    updateGrid();
}

function checkWord() {
    const word = state.grid[state.currentRow].join("");
    if (!dictionary.includes(word)) return showFloatingDialog("Invalid Word!", 2000);

    revealWord();
    state.currentRow++;
    state.currentCol = 0;

    if (word === state.secret) return setTimeout(() => showFloatingDialog("Congratulations!🎉", 3000), 1500);
    if (state.currentRow === 6) {
        setTimeout(() => startGame(), 1500);
        return setTimeout(() => showFloatingDialog(`Try again!<br>The word was 👉${state.secret.toUpperCase()}👈`, 3000), 1500);
    }

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

        box.classList.add('flip');
        box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
    }
}

function isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter) {
    if (state.currentCol === 5) return;
    state.grid[state.currentRow][state.currentCol] = letter;
    const box = document.getElementById(`box${state.currentRow}${state.currentCol}`);
    box.textContent = letter;
    box.classList.add("pop");

    setTimeout(() => {
        box.classList.remove("pop");
    }, 200);

    state.currentCol++;
}

function removeLetter() {
    if (state.currentCol === 0) return;
    state.currentCol--;
    state.grid[state.currentRow][state.currentCol] = '';
}

function registerEvents() {
    document.body.onkeydown = (e) => handleInput(e.key.toLowerCase());
    document.querySelectorAll(".key").forEach(button => {
        button.addEventListener("mousedown", () => handleInput(button.dataset.key));
    });
    document.getElementById("start-btn").addEventListener("mousedown", startGame);
}

function resetKeyboard() {
    document.querySelectorAll(".key").forEach(key => key.classList.remove("right", "wrong", "empty"));
}

function startGame() {
    initState();
    drawGrid();
    resetKeyboard();

    const startButton = document.getElementById("start-btn");
    startButton.textContent = "Restart Game";
    startButton.style.backgroundColor = "#b59f3b";
    startButton.style.transition = "background 0.3s";

    startButton.onmouseover = () => startButton.style.backgroundColor = "#87762c";
    startButton.onmouseout = () => startButton.style.backgroundColor = "#b59f3b";

    console.log(`Secret Word: ${state.secret}`);
}

registerEvents();