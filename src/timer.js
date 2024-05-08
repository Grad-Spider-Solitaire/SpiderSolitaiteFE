export let totalMilliseconds = 0;
let timerInterval = null;

function formatTime(milliseconds) {
    let tens = Math.floor((milliseconds % 1000) / 10);
    let seconds = Math.floor((milliseconds / 1000) % 60);
    let minutes = Math.floor((milliseconds / (1000 * 60)) % 60);

    let formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    let formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    let formattedTens = tens < 10 ? '0' + tens : tens;

    return `️${formattedMinutes}:${formattedSeconds}:${formattedTens}`;
}

function startTimer() {
    // Clear any existing timer before starting a new one
    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }

    const updateTimer = () => {
        totalMilliseconds += 10;  // Increment by 10 every 10 milliseconds

        document.getElementById('timer').textContent = `⏱️${formatTime(totalMilliseconds)}`;
    };

    // Start the timer
    timerInterval = setInterval(updateTimer, 10);
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
        console.log(`Timer stopped at: ${totalMilliseconds}ms`);
    }
}

export { startTimer, stopTimer, formatTime };
