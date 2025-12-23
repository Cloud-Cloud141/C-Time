// --- INITIALISIERUNG ---
const mainCanvas = document.getElementById('analogClock');
const mainCtx = mainCanvas ? mainCanvas.getContext('2d') : null;
const digitalTimeEl = document.getElementById('digitalTime');
const videoOverlay = document.getElementById('videoOverlay');
const iframe = document.getElementById('easterEggVideo');

let exitAllowed = false;

// --- FUNKTIONEN ---
const isTyping = () => {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
};

async function enterFullscreen() {
    try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); } catch (e) {}
}

async function leaveFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch (e) {}
}

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
    ctx.shadowBlur = 0; // Schatten für andere Elemente zurücksetzen
}

function updateMainClock() {
    if (!mainCanvas || !mainCtx) return;

    const now = new Date();
    const rect = mainCanvas.getBoundingClientRect();
    
    if (rect.width === 0) return;

    if (mainCanvas.width !== rect.width || mainCanvas.height !== rect.height) {
        mainCanvas.width = rect.width;
        mainCanvas.height = rect.height;
    }

    const size = mainCanvas.width;
    const center = size / 2;
    const radius = size * 0.45;

    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    if (digitalTimeEl) digitalTimeEl.textContent = now.toLocaleTimeString('de-DE');

    mainCtx.clearRect(0, 0, size, size);
    
    // Zahlen (Weiß mit Schatten)
    mainCtx.fillStyle = '#ffffff';
    mainCtx.font = `bold ${size * 0.07}px Arial`;
    mainCtx.textAlign = 'center';
    mainCtx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
        const ang = (i - 3) * (Math.PI / 6);
        mainCtx.fillText(i, center + (radius * 0.82) * Math.cos(ang), center + (radius * 0.82) * Math.sin(ang));
    }

    // Zeiger zeichnen
    drawHand(mainCtx, center, h * (Math.PI / 6) - Math.PI / 2, radius * 0.5, size * 0.025, '#d4af37'); // Gold
    drawHand(mainCtx, center, m * (Math.PI / 30) - Math.PI / 2, radius * 0.75, size * 0.015, '#f3cf7a'); // Hellgold
    drawHand(mainCtx, center, s * (Math.PI / 30) - Math.PI / 2, radius * 0.85, size * 0.006, '#ff4757'); // Festliches Rot

    // Knopf in der Mitte
    mainCtx.beginPath();
    mainCtx.arc(center, center, size * 0.02, 0, 2 * Math.PI);
    mainCtx.fillStyle = '#d4af37';
    mainCtx.fill();
}

function toggleVideo() {
    if (!videoOverlay || !iframe) return;
    if (videoOverlay.classList.contains('visible')) {
        const src = iframe.src;
        iframe.src = ""; iframe.src = src.replace("&autoplay=1", "");
        videoOverlay.classList.remove('visible');
    } else {
        videoOverlay.classList.add('visible');
        if (!iframe.src.includes('autoplay=1')) iframe.src += "&autoplay=1";
    }
}

// --- EVENTS ---
setInterval(updateMainClock, 16);

(function(){
    let snowing = true;
    let sInt = setInterval(createSnowflake, 60);

    document.addEventListener('keydown', (ev) => {
        if (isTyping()) return;
        const key = ev.key.toLowerCase();
        if (key === 'b') { 
            if (!document.fullscreenElement) { exitAllowed = false; enterFullscreen(); }
            else { exitAllowed = true; leaveFullscreen(); }
        }
        if (key === 's') toggleVideo();
        if (key === 'f') {
            snowing = !snowing;
            if (snowing) sInt = setInterval(createSnowflake, 60);
            else clearInterval(sInt);
        }
    });

    function createSnowflake() {
        const s = document.createElement('div');
        s.className = 'snowflake';
        s.textContent = '❄';
        s.style.left = Math.random()*100+'%';
        s.style.top = '-50px';
        const d = Math.random()*5+10;
        s.style.animation = `fall ${d}s linear`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), d*1000);
    }
})();
