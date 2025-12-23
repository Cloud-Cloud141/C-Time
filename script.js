
 /* WEIHNACHTS-UHR OPTIMIERUNG*/

// --- INITIALISIERUNG ---
const mainCanvas = document.getElementById('analogClock');
const mainCtx = mainCanvas ? mainCanvas.getContext('2d') : null;
const digitalTimeEl = document.getElementById('digitalTime');
const videoOverlay = document.getElementById('videoOverlay');
const iframe = document.getElementById('easterEggVideo');
const clockContainer = document.querySelector('.clock-container');

let exitAllowed = false;

// --- UTILS ---
const isTyping = () => {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
};

// --- VOLLBILD LOGIK (Optimiert für TV & PC) ---
async function toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            exitAllowed = false;
            await document.documentElement.requestFullscreen();
        } else {
            exitAllowed = true;
            await document.exitFullscreen();
        }
    } catch (e) {
        console.warn("Fullscreen-Fehler:", e);
    }
}

// --- GRAFIK FUNKTIONEN ---
function drawHand(ctx, center, angle, length, width, color, hasGlow = true) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    
    if (hasGlow) {
        ctx.shadowBlur = width * 2;
        ctx.shadowColor = color;
    }

    ctx.moveTo(center, center);
    ctx.lineTo(center + length * Math.cos(angle), center + length * Math.sin(angle));
    ctx.stroke();
    ctx.restore();
}

function updateMainClock() {
    if (!mainCanvas || !mainCtx) return;

    const now = new Date();
    const rect = mainCanvas.getBoundingClientRect();
    
    if (rect.width === 0) return;

    // Auflösung anpassen (verhindert Unschärfe auf 4K TVs)
    if (mainCanvas.width !== rect.width || mainCanvas.height !== rect.height) {
        mainCanvas.width = rect.width;
        mainCanvas.height = rect.height;
    }

    const size = mainCanvas.width;
    const center = size / 2;
    const radius = size * 0.44;

    // Zeitberechnung
    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    if (digitalTimeEl) digitalTimeEl.textContent = now.toLocaleTimeString('de-DE');

    mainCtx.clearRect(0, 0, size, size);
    
    // 1. ZIFFERN (Optimiertes Font-Rendering)
    mainCtx.fillStyle = '#ffffff';
    mainCtx.shadowBlur = 5;
    mainCtx.shadowColor = "rgba(255,255,255,0.5)";
    mainCtx.font = `bold ${size * 0.075}px 'Poppins', Arial`;
    mainCtx.textAlign = 'center';
    mainCtx.textBaseline = 'middle';
    
    for (let i = 1; i <= 12; i++) {
        const ang = (i - 3) * (Math.PI / 6);
        const x = center + (radius * 0.82) * Math.cos(ang);
        const y = center + (radius * 0.82) * Math.sin(ang);
        mainCtx.fillText(i, x, y);
    }
    mainCtx.shadowBlur = 0;

    // 2. MINUTEN-PUNKTE (macht die Uhr edler)
    for (let i = 0; i < 60; i++) {
        if (i % 5 === 0) continue;
        const ang = i * (Math.PI / 30);
        mainCtx.beginPath();
        mainCtx.arc(center + radius * Math.cos(ang), center + radius * Math.sin(ang), size * 0.003, 0, Math.PI * 2);
        mainCtx.fillStyle = "rgba(255,255,255,0.3)";
        mainCtx.fill();
    }

    // 3. ZEIGER
    drawHand(mainCtx, center, h * (Math.PI / 6) - Math.PI / 2, radius * 0.5, size * 0.025, '#d4af37'); // Gold
    drawHand(mainCtx, center, m * (Math.PI / 30) - Math.PI / 2, radius * 0.78, size * 0.015, '#f3cf7a'); // Hellgold
    drawHand(mainCtx, center, s * (Math.PI / 30) - Math.PI / 2, radius * 0.88, size * 0.006, '#ff4757'); // Rubinrot

    // 4. MITTELPUNKT
    mainCtx.beginPath();
    mainCtx.arc(center, center, size * 0.02, 0, 2 * Math.PI);
    mainCtx.fillStyle = '#d4af37';
    mainCtx.fill();
}

function toggleVideo() {
    if (!videoOverlay || !iframe) return;
    const isVisible = videoOverlay.classList.contains('visible');
    
    if (isVisible) {
        const src = iframe.src;
        iframe.src = ""; 
        iframe.src = src.replace("&autoplay=1", "");
        videoOverlay.classList.remove('visible');
    } else {
        videoOverlay.classList.add('visible');
        if (!iframe.src.includes('autoplay=1')) iframe.src += "&autoplay=1";
    }
}

// --- INITIALISIERUNG DER EVENTS ---
setInterval(updateMainClock, 16);

// Klick auf Uhr = Vollbild (Wichtig für LG TV!)
if (clockContainer) {
    clockContainer.addEventListener('click', toggleFullscreen);
}

(function initSnowAndKeys(){
    let snowing = true;
    let sInt = setInterval(createSnowflake, 100); // Etwas weniger CPU-Last für TVs

    document.addEventListener('keydown', (ev) => {
        if (isTyping()) return;
        const key = ev.key.toLowerCase();
        
        if (key === 'b') toggleFullscreen();
        if (key === 's') toggleVideo();
        if (key === 'f') {
            snowing = !snowing;
            if (snowing) sInt = setInterval(createSnowflake, 100);
            else clearInterval(sInt);
        }
    });

    function createSnowflake() {
        const s = document.createElement('div');
        s.className = 'snowflake';
        s.textContent = '❄';
        s.style.left = Math.random() * 100 + '%';
        s.style.opacity = Math.random() * 0.8 + 0.2;
        const size = Math.random() * 1 + 0.5;
        s.style.fontSize = size + 'rem';
        
        const duration = Math.random() * 5 + 10;
        s.style.animation = `fall ${duration}s linear`;
        
        document.body.appendChild(s);
        setTimeout(() => s.remove(), duration * 1000);
    }
})();

// Anti-Exit-Guard
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !exitAllowed) {
        setTimeout(toggleFullscreen, 100);
    }
});
