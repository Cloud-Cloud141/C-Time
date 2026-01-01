const canvas = document.getElementById('analogClock');
const ctx = canvas.getContext('2d');
const digitalTimeEl = document.getElementById('digitalTime');
const mainContainer = document.getElementById('mainContainer');
const helpHint = document.getElementById('helpHint');

let isProtecting = false;
let clickTimer; 
let isLongPress = false;
const LONG_PRESS_DURATION = 3000; 

// --- VIDEO STEUERUNG ---
function toggleVideo() {
    const overlay = document.getElementById('videoOverlay');
    const iframe = document.getElementById('easterEggVideo');
    if (!overlay) return;

    const isVisible = overlay.classList.toggle('visible');
    
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
        toggleVideo(); 
    }, LONG_PRESS_DURATION);
}

function handlePressEnd() {
    clearTimeout(clickTimer);
    if (!isLongPress) {
        const overlay = document.getElementById('videoOverlay');
        if (!overlay || !overlay.classList.contains('visible')) {
            toggleFullscreen();
        }
    }
}

// Event Listener
mainContainer.addEventListener('mousedown', handlePressStart);
mainContainer.addEventListener('mouseup', handlePressEnd);
mainContainer.addEventListener('touchstart', handlePressStart, {passive: true});
mainContainer.addEventListener('touchend', handlePressEnd);

const videoOverlay = document.getElementById('videoOverlay');
if (videoOverlay) {
    videoOverlay.addEventListener('mousedown', handlePressStart);
    videoOverlay.addEventListener('mouseup', handlePressEnd);
    videoOverlay.addEventListener('touchstart', handlePressStart, {passive: true});
    videoOverlay.addEventListener('touchend', handlePressEnd);
}

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

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 's') {
        toggleVideo();
    }
});

// --- ANALOGE UHR LOGIK (FARBENFROH) ---
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

    // Zifferblatt (Bunte Indizes)
    for (let i = 0; i < 60; i++) {
        const angle = (i * Math.PI) / 30;
        const isHour = i % 5 === 0;
        ctx.beginPath();
        // Wechselnde Farben für die Stunden-Markierungen
        ctx.strokeStyle = isHour ? `hsl(${i * 6}, 70%, 60%)` : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = isHour ? 3 : 1;
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
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.moveTo(center, center);
        ctx.lineTo(center + length * Math.cos(angle), center + length * Math.sin(angle));
        ctx.stroke();
        ctx.shadowBlur = 0; // Schatten zurücksetzen
    };

    // Bunte Neon-Zeiger
    drawHand((h * Math.PI / 6) - Math.PI / 2, radius * 0.5, 6, '#ffa502'); // Gold-Orange
    drawHand((m * Math.PI / 30) - Math.PI / 2, radius * 0.8, 4, '#00d2ff'); // Cyan
    drawHand((s * Math.PI / 30) - Math.PI / 2, radius * 0.85, 2, '#ff007f'); // Neon-Pink

    // Mittelpunkt
    ctx.beginPath(); ctx.arc(center, center, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill();

    ctx.restore();
    
    // Digitalzeit mit Sekunden (wichtig für Mitternacht!)
    digitalTimeEl.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

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

// --- FEUERWERK EFFEKT (Silvester-Style) ---
function launchFirework() {
    if (isProtecting || document.hidden) return;

    const colors = ['#FF004D', '#00FFF5', '#00FF9C', '#FFEB3B', '#FF5722'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 100;
    const y = Math.random() * 60; // Nur obere 60% des Bildschirms

    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle'; // Achte darauf, dass .particle im CSS existiert
        p.style.backgroundColor = color;
        p.style.left = x + 'vw';
        p.style.top = y + 'vh';
        p.style.position = 'fixed';
        p.style.width = '4px';
        p.style.height = '4px';
        p.style.borderRadius = '50%';
        p.style.boxShadow = `0 0 10px ${color}`;
        p.style.pointerEvents = 'none';
        p.style.zIndex = '5';

        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 100 + 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        document.body.appendChild(p);

        p.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000 + Math.random() * 500,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => p.remove();
    }
}
function launchFirework() {
    if (isProtecting || document.hidden) return;

    // Start- und Zielposition berechnen
    const startX = Math.random() * 100; // Startpunkt unten (0-100vw)
    const targetY = Math.random() * 40 + 10; // Zielhöhe oben (10-50vh)
    const drift = (Math.random() - 0.5) * 10; // Leichter Seitwärtsdrift für Realismus
    
    const colors = ['#FF004D', '#00FFF5', '#00FF9C', '#FFEB3B', '#FF5722', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Raketen-Element erstellen
    const rocket = document.createElement('div');
    rocket.className = 'rocket';
    rocket.style.left = startX + 'vw';
    rocket.style.bottom = '0vh'; 
    document.body.appendChild(rocket);

    // Aufstieg-Animation
    const flight = rocket.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(-${100 - targetY}vh) translateX(${drift}vw) rotate(${drift * 2}deg)`, opacity: 0.5 }
    ], {
        duration: 1000 + Math.random() * 500,
        easing: 'ease-out' // Wird oben langsamer
    });

    // Wenn die Rakete den Zielpunkt erreicht
    flight.onfinish = () => {
        rocket.remove();
        createExplosion(startX + drift, targetY, color);
    };
}

function createExplosion(x, y, color) {
    const particles = 30;
    for (let i = 0; i < particles; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.backgroundColor = color;
        p.style.color = color; // Für den Box-Shadow
        p.style.left = x + 'vw';
        p.style.top = y + 'vh';

        // Explosion in alle Richtungen
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 150 + 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        document.body.appendChild(p);

        p.animate([
            { transform: 'translate(0, 0) scale(1.5)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1200 + Math.random() * 800,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => p.remove();
    }
}

// Alle 1,5 bis 3 Sekunden eine Rakete starten
const fireworkLoop = () => {
    launchFirework();
    setTimeout(fireworkLoop, Math.random() * 1500 + 1500);
};
fireworkLoop();
// Alle 2 Sekunden ein Feuerwerk zünden
setInterval(launchFirework, 2000);

// --- START ---
window.addEventListener('load', () => {
    // Hilfe-Hinweis nach 6 Sekunden automatisch ausblenden
    setTimeout(() => {
        if (helpHint) helpHint.classList.add('hidden');
    }, 6000);

    setTimeout(() => {
        const ls = document.getElementById('loadingScreen');
        if (ls) {
            ls.style.opacity = '0';
            setTimeout(() => ls.style.display = 'none', 1000);
        }
    }, 1500);
    updateClock();
});
