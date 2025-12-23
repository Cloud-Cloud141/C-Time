const mainCanvas = document.getElementById('analogClock');
const mainCtx = mainCanvas.getContext('2d');
const digitalTimeEl = document.getElementById('digitalTime');
const videoOverlay = document.getElementById('videoOverlay');
const iframe = document.getElementById('easterEggVideo');

let snowing = true;

function updateClock() {
    const rect = mainCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Passt das Canvas an die Handy-Auflösung an (verhindert Unschärfe)
    if (mainCanvas.width !== rect.width * dpr) {
        mainCanvas.width = rect.width * dpr;
        mainCanvas.height = rect.height * dpr;
    }

    // Alles im Kontext skalieren
    mainCtx.save();
    mainCtx.scale(dpr, dpr);
    
    const size = rect.width;
    const center = size / 2;
    const radius = size * 0.44;
    const now = new Date();

    if (digitalTimeEl) digitalTimeEl.textContent = now.toLocaleTimeString('de-DE');

    mainCtx.clearRect(0, 0, size, size);

    // Zahlen zeichnen
    mainCtx.fillStyle = "white";
    mainCtx.font = `bold ${size * 0.08}px Arial`;
    mainCtx.textAlign = "center";
    mainCtx.textBaseline = "middle";
    for (let i = 1; i <= 12; i++) {
        const ang = (i - 3) * (Math.PI / 6);
        mainCtx.fillText(i, center + (radius * 0.82) * Math.cos(ang), center + (radius * 0.82) * Math.sin(ang));
    }

    // Zeiger
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    const drawHand = (angle, length, width, color) => {
        mainCtx.beginPath();
        mainCtx.strokeStyle = color;
        mainCtx.lineWidth = width;
        mainCtx.lineCap = "round";
        mainCtx.moveTo(center, center);
        mainCtx.lineTo(center + length * Math.cos(angle), center + length * Math.sin(angle));
        mainCtx.stroke();
    };

    drawHand(h * (Math.PI / 6) - Math.PI / 2, radius * 0.5, size * 0.025, '#d4af37'); // Stunde
    drawHand(m * (Math.PI / 30) - Math.PI / 2, radius * 0.75, size * 0.015, '#f3cf7a'); // Minute
    drawHand(s * (Math.PI / 30) - Math.PI / 2, radius * 0.85, size * 0.006, '#ff4757'); // Sekunde

    mainCtx.restore();
    requestAnimationFrame(updateClock);
}

// Schneefall
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

// Interaktion
document.querySelector('.clock-container').addEventListener('click', async () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
});

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'f') snowing = !snowing;
    if (key === 's') {
        videoOverlay.classList.toggle('visible');
        if (!videoOverlay.classList.contains('visible')) {
            const src = iframe.src; iframe.src = ""; iframe.src = src;
        }
    }
});

setInterval(createSnowflake, 150);
updateClock();
