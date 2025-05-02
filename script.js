
// Elements
const sudokuContainer = document.getElementById("sudoku-container");
const cover = document.getElementById("cover");
const sudokuPage = document.getElementById("sudoku-page");
const timerDisplay = document.getElementById("timer");
const bestTimeDisplay = document.getElementById("best-time");
const clickSound = document.getElementById("click-sound");

// Globals
let solution = [];
let currentBoard = [];
let timerInterval;
let seconds = 0;
let minutes = 0;
let currentDifficulty = 30;
let difficultyLevel = "easy";

// Sound
document.querySelectorAll("button").forEach(btn =>
    btn.addEventListener("click", () => clickSound.play())
);

// Start game
function startGame(difficulty) {
    cover.classList.add("fade-out");
    setTimeout(() => {
        cover.style.display = "none";
        sudokuPage.style.display = "block";
        cover.classList.remove("fade-out");
    }, 500);

    if (difficulty === 'easy') {
        currentDifficulty = 30;
        difficultyLevel = 'easy';
        document.body.style.background = "linear-gradient(135deg, #A8FF78, #78FFD6)";
    }
    if (difficulty === 'medium') {
        currentDifficulty = 40;
        difficultyLevel = 'medium';
        document.body.style.background = "linear-gradient(135deg, #FBD786, #f7797d)";
    }
    if (difficulty === 'hard') {
        currentDifficulty = 55;
        difficultyLevel = 'hard';
        document.body.style.background = "linear-gradient(135deg, #e96443, #904e95)";
    }

    generateSudoku();
    startTimer();
    loadBestTime();
}

// Generate full valid grid using backtracking
function generateFullGrid() {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

    function isValid(row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num || grid[x][col] === num)
                return false;
        }
        const startRow = row - row % 3, startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num)
                    return false;
            }
        }
        return true;
    }

    function fillGrid(pos = 0) {
        if (pos >= 81) return true;
        const row = Math.floor(pos / 9);
        const col = pos % 9;

        const numbers = [...Array(9).keys()].map(n => n + 1).sort(() => Math.random() - 0.5);
        for (const num of numbers) {
            if (isValid(row, col, num)) {
                grid[row][col] = num;
                if (fillGrid(pos + 1)) return true;
                grid[row][col] = 0;
            }
        }
        return false;
    }

    fillGrid();
    return grid;
}

// Remove numbers to create puzzle
function generateSudoku() {
    solution = generateFullGrid();
    currentBoard = solution.map(row => row.slice());

    let attempts = currentDifficulty;
    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (currentBoard[row][col] !== 0) {
            currentBoard[row][col] = 0;
            attempts--;
        }
    }
    renderBoard();
}

// Render board
function renderBoard() {
    sudokuContainer.innerHTML = "";
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.classList.add("cell");
            if (currentBoard[row][col] !== 0) {
                input.value = currentBoard[row][col];
                input.disabled = true;
                input.classList.add("prefilled");
            } else {
                input.addEventListener("input", () => {
                    input.value = input.value.replace(/[^1-9]/g, '');
                });
            }
            sudokuContainer.appendChild(input);
        }
    }
}

// Check if solution is correct
function checkSolution() {
    const inputs = document.querySelectorAll(".cell");
    let correct = true;
    for (let i = 0; i < inputs.length; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        if (!inputs[i].disabled) {
            if (parseInt(inputs[i].value) !== solution[row][col]) {
                correct = false;
                inputs[i].style.backgroundColor = "#ffcccc";
            } else {
                inputs[i].style.backgroundColor = "";
            }
        }
    }

    if (correct) {
        alert('Bravo ! Sudoku terminé sans faute !');
        saveBestTime();
        clearInterval(timerInterval);
        launchConfetti();
    }
}

// Reset board
function resetBoard() {
    generateSudoku();
    startTimer();
}

// Timer logic
function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    minutes = 0;
    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            minutes++;
            seconds = 0;
        }
        timerDisplay.textContent = 
            (minutes < 10 ? '0' + minutes : minutes) + ':' + 
            (seconds < 10 ? '0' + seconds : seconds);

        updateProgressBar();
    }, 1000);
}

function updateProgressBar() {
    let elapsed = minutes * 60 + seconds;
    let progress = Math.min(elapsed / 600, 1);
    document.getElementById('progress-bar').style.width = (progress * 100) + "%";
}

// Best time storage
function saveBestTime() {
    const total = minutes * 60 + seconds;
    const key = `sudoku_best_${difficultyLevel}`;
    const best = localStorage.getItem(key);
    if (!best || total < parseInt(best)) {
        localStorage.setItem(key, total);
        bestTimeDisplay.textContent = "Meilleur temps : " + formatTime(total);
    }
}

function loadBestTime() {
    const best = localStorage.getItem(`sudoku_best_${difficultyLevel}`);
    bestTimeDisplay.textContent = best ? "Meilleur temps : " + formatTime(best) : "Meilleur temps : --";
}

function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
}

function returnToMenu() {
    clearInterval(timerInterval);
    sudokuPage.style.display = 'none';
    cover.style.display = 'flex';
    cover.classList.remove('fade-out');
    document.body.style.background = "linear-gradient(135deg, #74ebd5, #ACB6E5)";
}

// Confetti effect
function launchConfetti() {
    const confetti = document.getElementById('confetti');
    confetti.innerHTML = '';
    for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.classList.add('confetti-piece');
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        confetti.appendChild(particle);
    }
}
