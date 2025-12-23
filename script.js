const mainCanvas = document.getElementById('analogClock');
const mainCtx = mainCanvas.getContext('2d');
const digitalTimeEl = document.getElementById('digitalTime');
const videoOverlay = document.getElementById('videoOverlay');
const iframe = document.getElementById('easterEggVideo');

let exitAllowed = false;
let snowing = true;

function drawHand(ctx, center, angle, length, width, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.moveTo(center, center);
    ctx.lineTo(center + length * Math.cos(angle), center + length * Math.sin(angle));
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function updateClock() {
    const rect = mainCanvas.getBoundingClientRect();
    if (mainCanvas.width !== rect.width || mainCanvas.height !== rect.height) {
        mainCanvas.width = rect.width;
        mainCanvas.height = rect.height;
    }

    const size = mainCanvas.width;
    const center = size / 2;
    const radius = size * 0.45;
    const now = new Date();

    if (digitalTimeEl) digitalTimeEl.textContent = now.toLocaleTimeString('de-DE');

    mainCtx.clearRect(0, 0, size, size);

    // Ziffern zeichnen
    mainCtx.fillStyle = "white";
    mainCtx.font = `bold ${size * 0.08}px Arial`;
    mainCtx.textAlign = "center";
    mainCtx.textBaseline = "middle";
    for (let i = 1; i <= 12; i++) {
        const ang = (i - 3) * (Math.PI / 6);
        mainCtx.fillText(i, center + (radius * 0.82) * Math.cos(ang), center + (radius * 0.82) * Math.sin(ang));
    }

    // Zeit für Zeiger
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    drawHand(mainCtx, center, h * (Math.PI / 6) - Math.PI / 2, radius * 0.5, size * 0.025, '#d4af37'); // Stunde
    drawHand(mainCtx, center, m * (Math.PI / 30) - Math.PI / 2, radius * 0.75, size * 0.015, '#f3cf7a'); // Minute
    drawHand(mainCtx, center, s * (Math.PI / 30) - Math.PI / 2, radius * 0.85, size * 0.006, '#ff4757'); // Sekunde

    // Mittelpunkt
    mainCtx.beginPath();
    mainCtx.arc(center, center, size * 0.02, 0, Math.PI * 2);
    mainCtx.fillStyle = "#d4af37";
    mainCtx.fill();

    requestAnimationFrame(updateClock);
}

function createSnowflake() {
    if (!snowing) return;
    const s = document.createElement('div');
    s.className = 'snowflake';
    s.textContent = '❄';
    s.style.left = Math.random() * 100 + '%';
    const duration = Math.random() * 5 + 8;
    s.style.animationDuration = duration + 's';
    s.style.fontSize = Math.random() * 10 + 15 + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), duration * 1000);
}

// Fullscreen für TV/Handy bei Klick
document.querySelector('.clock-container').addEventListener('click', async () => {
    if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(e => {});
    }
});

// Tastensteuerung (PC/Konsole)
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'f') snowing = !snowing;
    if (key === 's') {
        videoOverlay.classList.toggle('visible');
        if (!videoOverlay.classList.contains('visible')) {
            const src = iframe.src; iframe.src = ""; iframe.src = src; // Stop Video
        }
    }
});

setInterval(createSnowflake, 150);
updateClock();
