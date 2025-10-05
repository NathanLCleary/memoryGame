const $ = (id) => document.getElementById(id);

let gameState = {
    place: 0,
    answerArray: [],
    correct: 0,
    sets: 0,
    isGameActive: false,
    difficulty: 'medium',
    userAnswers: [],
    wrongAnswer: null
};

const DIFFICULTY_SETTINGS = {
    easy: { baseLength: 3, displayTime: 4000, inputTime: null },
    medium: { baseLength: 3, displayTime: 3000, inputTime: null },
    hard: { baseLength: 3, displayTime: 2500, inputTime: 20000 }
};

let displayTimer = null;
let inputTimer = null;

const COLORS = ['red', 'blue', 'yellow', 'green', 'orange', 'pink', 'purple', 'cyan', 'gray', 'black'];

function getRandomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function generateSequence() {
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    let length = settings.baseLength;
    
    if (gameState.difficulty === 'medium') {
        length = Math.min(3 + Math.floor(gameState.sets / 2), 6);
    } else if (gameState.difficulty === 'hard') {
        length = Math.min(3 + Math.floor(gameState.sets / 2), 7);
    }
    
    const sequence = [];
    for (let i = 0; i < length; i++) {
        sequence.push(getRandomColor());
    }
    return sequence;
}

function getDisplayTime() {
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    let time = settings.displayTime;
    
    if (gameState.difficulty === 'medium') {
        time = Math.max(3000 - (gameState.sets * 200), 1500);
    } else if (gameState.difficulty === 'hard') {
        time = Math.max(2500 - (gameState.sets * 100), 1200);
    }
    
    return time;
}

function getInputTime() {
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    if (!settings.inputTime) return null;
    
    if (gameState.difficulty === 'hard') {
        return Math.max(20000 - (gameState.sets * 1000), 8000);
    }
    return settings.inputTime;
}

function setDifficulty(level) {
    gameState.difficulty = level;
    localStorage.setItem('memoryGameDifficulty', level);
    updateDifficultyButtons();
}

function loadDifficulty() {
    const saved = localStorage.getItem('memoryGameDifficulty');
    if (saved && DIFFICULTY_SETTINGS[saved]) {
        gameState.difficulty = saved;
    }
    updateDifficultyButtons();
}

function updateDifficultyButtons() {
    ['easy', 'medium', 'hard'].forEach(level => {
        const btn = $(level + '-btn');
        if (btn) {
            btn.className = gameState.difficulty === level ? 'difficulty-btn active' : 'difficulty-btn';
        }
    });
}

function initializeAnswerButtons() {
    const buttons = ['answer1', 'answer2', 'answer3', 'answer4', 'answer5', 'answer6', 'answer7', 'answer8', 'answer9', 'answer10'];
    const colors = ['red', 'blue', 'yellow', 'green', 'orange', 'pink', 'purple', 'cyan', 'gray', 'black'];
    
    buttons.forEach((id, index) => {
        const button = $(id);
        if (button) {
            button.setAttribute('aria-label', `${colors[index]} color`);
        }
    });
}

function submit(userColor) {
    if (!gameState.isGameActive) return;
    
    gameState.userAnswers.push(userColor);
    
    if (userColor === gameState.answerArray[gameState.place]) {
        gameState.correct++;
        gameState.place++;
        updateUI();
        
        if (gameState.place === gameState.answerArray.length) {
            if (inputTimer) {
                clearInterval(inputTimer);
                const timerEl = $("input-timer");
                if (timerEl) timerEl.style.display = 'none';
            }
            gameState.place = 0;
            gameState.sets++;
            gameState.userAnswers = [];
            updateUI();
            setTimeout(() => startNewRound(), 1000);
        }
    } else {
        gameState.wrongAnswer = {
            position: gameState.place,
            expected: gameState.answerArray[gameState.place],
            selected: userColor
        };
        endGame();
    }
}

function updateUI() {
    const correctEl = $("correct");
    const setsEl = $("sets");
    if (correctEl) correctEl.textContent = gameState.correct;
    if (setsEl) setsEl.textContent = gameState.sets;
}
function endGame() {
    gameState.isGameActive = false;
    stopTimer();
    
    const now = new Date();
    const gameResult = {
        sets: gameState.sets,
        correct: gameState.correct,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        pattern: [...gameState.answerArray],
        wrongAnswer: gameState.wrongAnswer,
        userAnswers: [...gameState.userAnswers]
    };
    
    saveGameResult(gameResult);
    showGameOverModal(gameResult);
    setTimeout(() => resetGame(), 100);
}

function resetGame() {
    gameState.place = 0;
    gameState.answerArray = [];
    gameState.correct = 0;
    gameState.sets = 0;
    gameState.userAnswers = [];
    gameState.wrongAnswer = null;
    
    if (displayTimer) clearInterval(displayTimer);
    if (inputTimer) clearInterval(inputTimer);
    
    const displayTimerEl = $("display-timer");
    const inputTimerEl = $("input-timer");
    if (displayTimerEl) displayTimerEl.style.display = 'none';
    if (inputTimerEl) inputTimerEl.style.display = 'none';
    
    resetTimer();
    updateUI();
    clearGameBoard();
    toggleAnswerButtons(false);
}

function saveGameResult(result) {
    try {
        const key = `memoryGameScores_${gameState.difficulty}`;
        let scores = JSON.parse(localStorage.getItem(key) || '[]');
        scores.push({...result, difficulty: gameState.difficulty});
        scores.sort((a, b) => b.correct - a.correct);
        scores = scores.slice(0, 5);
        localStorage.setItem(key, JSON.stringify(scores));
    } catch (error) {
        console.warn('Error saving game result:', error);
    }
}

function showGameOverModal(result) {
    setTimeout(() => {
        createGameOverPopup(result);
    }, 500);
}

function createGameOverPopup(result) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'game-over-popup';
    
    let patternHtml = '';
    if (result.pattern && result.pattern.length > 0) {
        patternHtml = `
            <div class="pattern-display">
                <h3>The Pattern Was:</h3>
                <div class="pattern-row">
                    ${result.pattern.map((color, index) => {
                        let className = 'pattern-color';
                        if (result.wrongAnswer && index === result.wrongAnswer.position) {
                            className += ' wrong-position';
                        }
                        return `<div class="${className}" style="background-color: ${color};"></div>`;
                    }).join('')}
                </div>
                <h3>Your Input Was:</h3>
                <div class="pattern-row">
                    ${result.pattern.map((color, index) => {
                        let userColor = '#ddd';
                        if (result.userAnswers && index < result.userAnswers.length) {
                            userColor = result.userAnswers[index];
                        }
                        let className = 'pattern-color';
                        if (result.wrongAnswer && index === result.wrongAnswer.position) {
                            className += ' user-wrong';
                        }
                        return `<div class="${className}" style="background-color: ${userColor};"></div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    popup.innerHTML = `
        <h2>🎮 Game Over!</h2>
        <p>🎯 Sets Completed: <strong>${result.sets}</strong></p>
        <p>✅ Correct Answers: <strong>${result.correct}</strong></p>
        ${patternHtml}
        <div class="buttons">
            <button class="primary-btn" onclick="closePopupAndShowScoreboard()">View Scoreboard</button>
            <button class="secondary-btn" onclick="closePopup()">Close</button>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    window.currentPopup = overlay;
}

function closePopup() {
    if (window.currentPopup) {
        document.body.removeChild(window.currentPopup);
        window.currentPopup = null;
    }
}

function closePopupAndShowScoreboard() {
    closePopup();
    btn();
}

function startNewRound() {
    gameState.answerArray = generateSequence();
    updateCellVisibility();
    displaySequence();
    startDisplayTimer();
}

function startDisplayTimer() {
    const displayTime = getDisplayTime();
    let timeLeft = Math.ceil(displayTime / 1000);
    
    const timerEl = $("display-timer");
    if (timerEl) {
        timerEl.textContent = timeLeft;
        timerEl.style.display = 'block';
    }
    
    displayTimer = setInterval(() => {
        timeLeft--;
        if (timerEl) timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(displayTimer);
            if (timerEl) timerEl.style.display = 'none';
            clearGameBoard();
            toggleAnswerButtons(true);
            startInputTimer();
        }
    }, 1000);
}

function startInputTimer() {
    const inputTime = getInputTime();
    if (!inputTime) return;
    
    let timeLeft = Math.ceil(inputTime / 1000);
    const timerEl = $("input-timer");
    if (timerEl) {
        timerEl.textContent = timeLeft;
        timerEl.style.display = 'block';
    }
    
    inputTimer = setInterval(() => {
        timeLeft--;
        if (timerEl) timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(inputTimer);
            if (timerEl) timerEl.style.display = 'none';
            endGame();
        }
    }, 1000);
}

function updateCellVisibility() {
    for (let i = 0; i < 8; i++) {
        const cell = $("cell" + i);
        if (cell) {
            cell.style.display = i < gameState.answerArray.length ? 'flex' : 'none';
        }
    }
}

function displaySequence() {
    toggleAnswerButtons(false);
    for (let i = 0; i < gameState.answerArray.length; i++) {
        const cell = $("cell" + i);
        if (cell) {
            cell.style.backgroundColor = gameState.answerArray[i];
            cell.classList.add('showing');
        }
    }
}

function clearGameBoard() {
    for (let i = 0; i < 8; i++) {
        const cell = $("cell" + i);
        if (cell) {
            cell.style.backgroundColor = '#f0f0f0';
            cell.classList.remove('showing');
        }
    }
}

function toggleAnswerButtons(enabled) {
    for (let i = 1; i <= 10; i++) {
        const button = $("answer" + i);
        if (button) {
            button.disabled = !enabled;
            button.style.opacity = enabled ? '1' : '0.5';
        }
    }
}

function gameStart() {
    const modal = $("modal");
    if (modal) modal.style.visibility = "hidden";
    
    resetGame();
    gameState.isGameActive = true;
    initializeAnswerButtons();
    startTimer();
    startNewRound();
}

function btn() {
    const modal = $("modal");
    if (modal) {
        modal.style.visibility = "visible";
        loadScoreboard();
        loadDifficulty();
    }
    if (gameState.isGameActive) {
        endGame();
    }
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    
    const difficulty = tabName.toLowerCase();
    loadScoreboardForDifficulty(difficulty);
}

function loadScoreboardForDifficulty(difficulty) {
    try {
        const key = `memoryGameScores_${difficulty}`;
        const scores = JSON.parse(localStorage.getItem(key) || '[]');
        
        for (let i = 1; i <= 5; i++) {
            const score = scores[i - 1];
            const setsEl = $(difficulty + '-sets' + i);
            const correctEl = $(difficulty + '-correct' + i);
            const timeEl = $(difficulty + '-time' + i);
            
            if (score) {
                if (setsEl) setsEl.textContent = score.sets;
                if (correctEl) correctEl.textContent = score.correct;
                if (timeEl) timeEl.textContent = `${score.date} ${score.time}`;
            } else {
                if (setsEl) setsEl.textContent = '-';
                if (correctEl) correctEl.textContent = '-';
                if (timeEl) timeEl.textContent = '-';
            }
        }
    } catch (error) {
        console.warn('Error loading scoreboard:', error);
    }
}

function loadScoreboard() {
    loadScoreboardForDifficulty('easy');
    loadScoreboardForDifficulty('medium');
    loadScoreboardForDifficulty('hard');
}