let totalMilliseconds = 0;

function startTimer() {
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

    setInterval(updateTimer, 10);
}

document.addEventListener('DOMContentLoaded', startTimer);


