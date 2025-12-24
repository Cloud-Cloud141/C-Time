const canvas = document.getElementById('analogClock');
const ctx = canvas.getContext('2d');
const digitalTimeEl = document.getElementById('digitalTime');
const mainContainer = document.getElementById('mainContainer');
const helpHint = document.getElementById('helpHint');

let isProtecting = false;
let clickTimer; 
let isLongPress = false;
const LONG_PRESS_DURATION = 3000; // 3 Sekunden für das Video

// --- VIDEO STEUERUNG ---
function toggleVideo() {
    const overlay = document.getElementById('videoOverlay');
    const iframe = document.getElementById('easterEggVideo');
    if (!overlay) return;

    const isVisible = overlay.classList.toggle('visible');
    
    // Video stoppen, wenn Overlay geschlossen wird
    if (!isVisible && iframe) {
        const src = iframe.src; 
        iframe.src = ""; 
        iframe.src = src;
    }
}

// --- ZENTRALE STEUERUNG ---
function handlePressStart() {
    isLongPress = false;
    clickTimer = setTimeout(() => {
        isLongPress = true;
        toggleVideo(); // Das öffnet ODER schließt das Video
    }, LONG_PRESS_DURATION);
}

function handlePressEnd() {
    clearTimeout(clickTimer);
    if (!isLongPress) {
        // Nur Vollbild toggeln, wenn das Video gerade NICHT offen ist
        const overlay = document.getElementById('videoOverlay');
        if (!overlay.classList.contains('visible')) {
            toggleFullscreen();
        }
    }
}

// Event Listener für die Uhr (mainContainer)
mainContainer.addEventListener('mousedown', handlePressStart);
mainContainer.addEventListener('mouseup', handlePressEnd);
mainContainer.addEventListener('touchstart', handlePressStart, {passive: true});
mainContainer.addEventListener('touchend', handlePressEnd);

// NEU: Event Listener für das Video-Overlay (damit man auch dort rauskommt!)
const videoOverlay = document.getElementById('videoOverlay');
videoOverlay.addEventListener('mousedown', handlePressStart);
videoOverlay.addEventListener('mouseup', handlePressEnd);
videoOverlay.addEventListener('touchstart', handlePressStart, {passive: true});
videoOverlay.addEventListener('touchend', handlePressEnd);

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        if (helpHint) helpHint.classList.add('hidden');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    }
}

// Event Listener für Maus und Touch
mainContainer.addEventListener('mousedown', handlePressStart);
mainContainer.addEventListener('mouseup', handlePressEnd);
mainContainer.addEventListener('touchstart', (e) => {
    // Verhindert bei manchen TVs das Kontextmenü
    handlePressStart();
}, {passive: true});
mainContainer.addEventListener('touchend', handlePressEnd);

// Tastatur-Support ("S") bleibt für PC-Nutzer erhalten
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 's') {
        toggleVideo();
    }
});

// --- ANALOGE UHR LOGIK ---
function updateClock() {
    if (isProtecting) {
        requestAnimationFrame(updateClock);
        return;
    }

    const dpr = window.devicePixelRatio || 2;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    const size = rect.width;
    const center = size / 2;
    const radius = size * 0.46;
    const now = new Date();

    ctx.clearRect(0, 0, size, size);

    // Zifferblatt Indizes
    for (let i = 0; i < 60; i++) {
        const angle = (i * Math.PI) / 30;
        const isHour = i % 5 === 0;
        ctx.beginPath();
        ctx.strokeStyle = isHour ? '#f3cf7a' : 'rgba(243, 207, 122, 0.2)';
        ctx.lineWidth = isHour ? 2 : 1;
        ctx.moveTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle));
        ctx.lineTo(center + (radius - (isHour ? 15 : 6)) * Math.cos(angle), center + (radius - (isHour ? 15 : 6)) * Math.sin(angle));
        ctx.stroke();
    }

    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    const drawHand = (angle, length, width, color) => {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.moveTo(center, center);
        ctx.lineTo(center + length * Math.cos(angle), center + length * Math.sin(angle));
        ctx.stroke();
    };

    drawHand((h * Math.PI / 6) - Math.PI / 2, radius * 0.5, 4, '#f3cf7a');
    drawHand((m * Math.PI / 30) - Math.PI / 2, radius * 0.8, 2, '#f3cf7a');
    drawHand((s * Math.PI / 30) - Math.PI / 2, radius * 0.85, 1, '#ff4757');

    ctx.beginPath(); ctx.arc(center, center, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f3cf7a'; ctx.fill();

    ctx.restore();
    digitalTimeEl.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    // OLED Schutz Check (Jede volle Stunde)
    if (now.getMinutes() === 0 && now.getSeconds() === 0 && !isProtecting) {
        runOledProtection();
    }

    requestAnimationFrame(updateClock);
}

// --- OLED SCHUTZ ---
function runOledProtection() {
    isProtecting = true;
    const overlay = document.getElementById('oledProtection');
    const fill = document.getElementById('progressFill');
    const count = document.getElementById('countdown');
    
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
    }
    
    let timeLeft = 60;
    const interval = setInterval(() => {
        timeLeft--;
        if (count) count.textContent = timeLeft + "s";
        if (fill) fill.style.width = ((60 - timeLeft) / 60 * 100) + "%";
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            if (overlay) overlay.style.display = 'none';
            isProtecting = false;
        }
    }, 1000);
}

// --- SCHNEE EFFEKT ---
setInterval(() => {
    if (isProtecting) return;
    const s = document.createElement('div');
    s.className = 'snowflake';
    s.innerHTML = '•';
    s.style.left = Math.random() * 100 + 'vw';
    const dur = Math.random() * 3 + 6;
    s.style.animation = `fall ${dur}s linear forwards`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), dur * 1000);
}, 150);

// --- START ---
window.addEventListener('load', () => {
    setTimeout(() => {
        const ls = document.getElementById('loadingScreen');
        if (ls) {
            ls.style.opacity = '0';
            setTimeout(() => ls.style.display = 'none', 1000);
        }
    }, 1500);
    updateClock();
});
