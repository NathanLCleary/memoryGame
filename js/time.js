let totalSeconds = 0;
let timerInterval = null;

function startTimer() {
    stopTimer();
    timerInterval = setInterval(setTime, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    totalSeconds = 0;
    updateDisplay();
}

function setTime() {
    ++totalSeconds;
    updateDisplay();
}

function updateDisplay() {
    const secondsElement = document.getElementById("seconds");
    const minutesElement = document.getElementById("minutes");
    if (secondsElement) secondsElement.textContent = pad(totalSeconds % 60);
    if (minutesElement) minutesElement.textContent = pad(Math.floor(totalSeconds / 60)) + ":";
}

function pad(val) {
    return val.toString().padStart(2, '0');
}