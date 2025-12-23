// --- GLOBALE VARIABLEN & FULLSCREEN LOGIK ---
let exitAllowed = false;

const isTyping = () => {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
};

async function enterFullscreen() {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        }
    } catch (e) {}
}

async function leaveFullscreen() {
    try {
        if (document.fullscreenElement) await document.exitFullscreen();
    } catch (e) {}
}

// --- ZEICHEN-FUNKTION FÜR ZEIGER ---
function drawHand(ctx, center, angle, length, width, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(center, center);
    ctx.lineTo(center + length * Math.cos(angle), center + length * Math.sin(angle));
    ctx.stroke();
}

// --- HAUPTUHR ---
const mainCanvas = document.getElementById('analogClock');
const mainCtx = mainCanvas.getContext('2d');
const digitalTimeEl = document.getElementById('digitalTime');

function updateMainClock() {
    const now = new Date();
    
    // Passt die interne Zeichnungs-Größe an die CSS-Größe an (WICHTIG!)
    const rect = mainCanvas.getBoundingClientRect();
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

    digitalTimeEl.textContent = now.toLocaleTimeString('de-DE');

    mainCtx.clearRect(0, 0, size, size);
    
    // Zahlen zeichnen
    mainCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    mainCtx.font = `bold ${size * 0.07}px Poppins, Arial`;
    mainCtx.textAlign = 'center';
    mainCtx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
        const ang = (i - 3) * (Math.PI / 6);
        const x = center + (radius * 0.82) * Math.cos(ang);
        const y = center + (radius * 0.82) * Math.sin(ang);
        mainCtx.fillText(i, x, y);
    }

    // ZEIGER ZEICHNEN (In festlichem Gold und Weiß)
    // Stundenzeiger (Gold)
    drawHand(mainCtx, center, h * (Math.PI / 6) - Math.PI / 2, radius * 0.5, size * 0.025, '#d4af37');
    // Minutenzeiger (Gold-hell)
    drawHand(mainCtx, center, m * (Math.PI / 30) - Math.PI / 2, radius * 0.75, size * 0.015, '#f3cf7a');
    // Sekundenzeiger (Weißes Glühen)
    drawHand(mainCtx, center, s * (Math.PI / 30) - Math.PI / 2, radius * 0.85, size * 0.006, '#ffffff');

    // Mittelpunkt (kleiner goldener Knopf)
    mainCtx.beginPath();
    mainCtx.arc(center, center, size * 0.02, 0, 2 * Math.PI);
    mainCtx.fillStyle = '#d4af37';
    mainCtx.fill();
}
setInterval(updateMainClock, 16);

// --- VIDEO EASTER EGG LOGIK ---
const videoOverlay = document.getElementById('videoOverlay');
const iframe = document.getElementById('easterEggVideo');

function toggleVideo() {
    if (!videoOverlay || !iframe) return;
    if (videoOverlay.classList.contains('visible')) {
        const currentSrc = iframe.src;
        iframe.src = ""; 
        iframe.src = currentSrc.replace("&autoplay=1", ""); 
        videoOverlay.classList.remove('visible');
    } else {
        videoOverlay.classList.add('visible');
        if (!iframe.src.includes('autoplay=1')) {
            iframe.src += "&autoplay=1";
        }
    }
}

// --- OVERLAYS & SCHNEE & TASTEN ---
(function(){
    // Schnee-Autostart für Heiligabend
    let snowing = true; 
    let sInt = setInterval(createSnowflake, 50);

    document.addEventListener('keydown', (ev) => {
        if (isTyping()) return;
        const key = ev.key.toLowerCase();

        if (key === 'b') {
            if (!document.fullscreenElement) { exitAllowed = false; enterFullscreen(); }
            else { exitAllowed = true; leaveFullscreen(); }
        }

        if (ev.key === 'Escape' && !exitAllowed) {
            ev.preventDefault();
            setTimeout(enterFullscreen, 50);
        }

        if (key === 's') toggleVideo();

        if (key === 'f') {
            snowing = !snowing;
            if (snowing) sInt = setInterval(createSnowflake, 50);
            else clearInterval(sInt);
        }
    }, true);

    function createSnowflake() {
        const s = document.createElement('div');
        s.className = 'snowflake';
        s.textContent = '❄';
        s.style.left = Math.random()*100+'%';
        s.style.top = '-30px';
        const d = Math.random()*5+8;
        s.style.animation = `fall ${d}s linear`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), d*1000);
    }
})();

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !exitAllowed) enterFullscreen();
});
