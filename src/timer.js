export let totalMilliseconds = 0;
let timerInterval = null;

function startTimer() {
    // Clear any existing timer before starting a new one
    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }

    const updateTimer = () => {
        totalMilliseconds += 10;  // Increment by 10 every 10 milliseconds
        let tens = Math.floor((totalMilliseconds % 1000) / 10);
        let seconds = Math.floor((totalMilliseconds / 1000) % 60);
        let minutes = Math.floor((totalMilliseconds / (1000 * 60)) % 60);

        let formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        let formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
        let formattedTens = tens < 10 ? '0' + tens : tens;

        document.getElementById('timerDisplay').textContent = `⏱️${formattedMinutes}:${formattedSeconds}:${formattedTens}`;
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
export { startTimer, stopTimer };
//document.addEventListener('DOMContentLoaded', startTimer);
document.addEventListener('DOMContentLoaded', () => {
    startTimer();
    // Can add logic here for stopping timer upon game end.
});




