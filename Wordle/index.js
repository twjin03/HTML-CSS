import { dictionary } from "./words.js"; // 5자리 정답 단어 목록 import

const state = {
    secret: "", // 정답 단어
    grid: [], // 5x6 격자(word grid)
    currentRow: 0, // 현재 입력 중인 row index
    currentCol: 0, // 현재 입력 중인 col index
    gameStarted: false // 게임 시작 여부를 나타냄
};

// 게임 초기 상태를 설정
function initState() {
    state.secret = dictionary[Math.floor(Math.random() * dictionary.length)]; // 무작위 선택
    state.grid = Array.from({ length: 6 }, () => Array(5).fill(''));
    state.currentRow = 0;
    state.currentCol = 0;
    state.gameStarted = true;
}

// 게임 화면에 5x6 격자 생성
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

// 각 box의 내용을 업데이트
function updateGrid() {
    state.grid.forEach((row, i) => {
        row.forEach((letter, j) => {
            document.getElementById(`box${i}${j}`).textContent = letter;
        });
    });
}

// 키보드 색상 업데이트 
function updateKeyboardColors() {
    document.querySelectorAll(".key").forEach(key => key.classList.remove("right", "wrong", "empty"));
    const guessedLetters = {};

    for (let i = 0; i < state.currentRow; i++) {
        state.grid[i].forEach((letter, j) => {
            const key = document.querySelector(`.key[data-key="${letter}"]`);
            if (!key) return;

            if (state.secret[j] === letter) {
                key.classList.add("right"); // 💚
                guessedLetters[letter] = "right";
            } else if (state.secret.includes(letter) && guessedLetters[letter] !== "right") {
                key.classList.add("wrong"); // 💛
                guessedLetters[letter] = "wrong";
            } else {
                key.classList.add("empty"); // 🩶
            }
        });
    }
}

// dialog popup 표시 
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

// 키보드 입력 처리 
function handleInput(key) {
    if (!state.gameStarted) return;

    if (event && (event.ctrlKey || event.altKey || event.metaKey)) return; // 단축키 사용 시 입력 무시 

    if (key === "enter") {
        if (state.currentCol === 5) checkWord();
        else setTimeout(() => {
            showFloatingDialog("Not enough letters.", 2000);
            triggerRowShake(state.currentRow);
        }, 100);
    } else if (key === "backspace") {
        removeLetter();
    } else if (isLetter(key)) {
        addLetter(key);
    }
    updateGrid();
}

// shake 애니메이션 사용
function triggerRowShake(rowIndex) {
    const rowTiles = document.querySelectorAll(`[id^="box${rowIndex}"]`); 

    if (!rowTiles.length) return;

    rowTiles.forEach(tile => {
        tile.classList.add("shake");
    });

    setTimeout(() => {
        rowTiles.forEach(tile => tile.classList.remove("shake"));
    }, 300); 
}

// jump 애니메이션 사용
function triggerRowJump(rowIndex) {
    const delay = 40;

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const box = document.getElementById(`box${rowIndex}${i}`);
            box.classList.add("jump");
            box.style.animationDelay = `${i * delay}ms`;

        }, i * delay);
    }
}

// 단어 유효성 검사 및 정답 여부 확인
function checkWord() {
    const word = state.grid[state.currentRow].join("");
    if (!dictionary.includes(word)) {
        setTimeout(() => {
            showFloatingDialog("Invalid Word!", 2000);
            triggerRowShake(state.currentRow);
        }, 100);
        return;
    }

    revealWord();
    state.currentRow++;
    state.currentCol = 0;

    if (word === state.secret) {
        setTimeout(() => {
            showFloatingDialog("Congratulations!🎉", 3000);
            triggerRowJump(state.currentRow - 1);
        }, 1500);
        state.gameStarted = false;
        return;
    }
    if (state.currentRow === 6) {
        setTimeout(() => showFloatingDialog(`Try again!😥<br>The answer was 👉${state.secret.toUpperCase()}👈`, 5000), 1500);
        setTimeout(() => startGame(), 2000);
        return;
    }

}

// 입력 결과 표시 + flip 애니메이션 
function revealWord() {
    const row = state.currentRow;
    const animation_duration = 500;

    for (let i = 0; i < 5; i++) {
        const box = document.getElementById(`box${row}${i}`);
        const letter = box.textContent;

        setTimeout(() => {
            if (letter === state.secret[i]) {
                box.classList.add('right'); // 💚
            } else if (state.secret.includes(letter)) {
                box.classList.add('wrong'); // 💛
            } else {
                box.classList.add('empty'); // 🩶
            }
            updateKeyboardColors();
        }, ((i + 1) * animation_duration) / 2);

        box.classList.add('flip');
        box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
    }
}

// 입력된 키 유효성 검사 
function isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
}

// box에 입력 키 표시 + pop 애니메이션 
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

// 입력한 글자를 지움
function removeLetter() {
    if (state.currentCol === 0) return;
    state.currentCol--;
    state.grid[state.currentRow][state.currentCol] = '';
}

// 키보드 이벤트 등록
function registerEvents() {
    document.body.onkeydown = (e) => {
        // 단축키 사용 시 입력 무시
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        handleInput(e.key.toLowerCase(), e);
    };
    document.querySelectorAll(".key").forEach(button => {
        button.addEventListener("mousedown", () => handleInput(button.dataset.key));
    });
    document.getElementById("start-btn").addEventListener("mousedown", startGame);
}

// 키보드 색상 초기화 
function resetKeyboard() {
    document.querySelectorAll(".key").forEach(key => key.classList.remove("right", "wrong", "empty"));
}

// 게임 시작 시 호출 
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