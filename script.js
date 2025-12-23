const mainCanvas = document.getElementById('analogClock');
const mainCtx = mainCanvas.getContext('2d');
const digitalTimeEl = document.getElementById('digitalTime');
const videoOverlay = document.getElementById('videoOverlay');
const iframe = document.getElementById('easterEggVideo');

let exitAllowed = false;

// --- MULTI-DEVICE VOLLBILD ---
async function toggleFullscreen() {
    if (!document.fullscreenElement) {
        exitAllowed = false;
        const method = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
        if (method) await method.call(document.documentElement);
    } else {
        exitAllowed = true;
        if (document.exitFullscreen) await document.exitFullscreen();
    }
}

// --- ZEICHEN-LOGIK (Hochauflösend) ---
function updateClock() {
    const now = new Date();
    const rect = mainCanvas.getBoundingClientRect();
    
    // Pixel-Ratio für gestochen scharfe Zeiger auf Handys/4K TVs
    const dpr = window.devicePixelRatio || 1;
    if (mainCanvas.width !== rect.width * dpr) {
        mainCanvas.width = rect.width * dpr;
        mainCanvas.height = rect.height * dpr;
    }
    mainCtx.scale(dpr, dpr);

    const size = rect.width;
    const center = size / 2;
    const radius = size * 0.45;

    // Zeitwerte
    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    digitalTimeEl.textContent = now.toLocaleTimeString('de-DE');
    mainCtx.clearRect(0, 0, size, size);

    // Zifferblatt
    mainCtx.fillStyle = '#fff';
    mainCtx.font = `bold ${size * 0.08}px Arial`;
    mainCtx.textAlign = 'center';
    mainCtx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
        const ang = (i - 3) * (Math.PI / 6);
        mainCtx.fillText(i, center + (radius * 0.8) * Math.cos(ang), center + (radius * 0.8) * Math.sin(ang));
    }

    // Zeiger
    drawHand(center, h * (Math.PI / 6) - Math.PI / 2, radius * 0.5, size * 0.02, '#d4af37'); // Stunde
    drawHand(center, m * (Math.PI / 30) - Math.PI / 2, radius * 0.75, size * 0.012, '#f3cf7a'); // Minute
    drawHand(center, s * (Math.PI / 30) - Math.PI / 2, radius * 0.85, size * 0.005, '#ff4757'); // Sekunde

    requestAnimationFrame(updateClock); // Flüssiger als setInterval
}

function drawHand(center, angle, length, width, color) {
    mainCtx.beginPath();
    mainCtx.strokeStyle = color;
    mainCtx.lineWidth = width;
    mainCtx.lineCap = "round";
    mainCtx.moveTo(center, center);
    mainCtx.lineTo(center + length * Math.cos(angle), center + length * Math.sin(angle));
    mainCtx.stroke();
}

// --- STEUERUNG ---
// Handy & TV: Klick/Tap auf Uhr
document.querySelector('.clock-container').addEventListener('click', (e) => {
    // Wenn man 3x schnell tippt (Handy-Trick), startet das Video
    if (e.detail === 3) toggleVideo(); 
    else toggleFullscreen();
});

// PC & Konsole: Tasten
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'b') toggleFullscreen();
    if (key === 's') toggleVideo();
    if (key === 'f') toggleSnow();
});

// --- SCHNEE-SYSTEM ---
let snowInterval = setInterval(createSnow, 100);
function createSnow() {
    const s = document.createElement('div');
    s.className = 'snowflake';
    s.textContent = '❄';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = '-20px';
    const dur = Math.random() * 5 + 7;
    s.style.animation = `fall ${dur}s linear`;
    s.style.fontSize = (Math.random() * 10 + 10) + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), dur * 1000);
}

function toggleVideo() {
    videoOverlay.classList.toggle('visible');
    if (videoOverlay.classList.contains('visible')) {
        iframe.src += "&autoplay=1";
    } else {
        iframe.src = iframe.src.replace("&autoplay=1", "");
    }
}

requestAnimationFrame(updateClock);
