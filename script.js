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

function updateMainClock() {
    const now = new Date();
    
    // Automatische Anpassung der internen Auflösung an die CSS-Größe
    const rect = mainCanvas.getBoundingClientRect();
    if (mainCanvas.width !== rect.width || mainCanvas.height !== rect.height) {
        mainCanvas.width = rect.width;
        mainCanvas.height = rect.height;
    }

    const size = mainCanvas.width;
    const center = size / 2;
    const radius = size * 0.475; // Skaliert den Radius mit der Größe

    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    digitalTimeEl.textContent = now.toLocaleTimeString('de-DE');

    mainCtx.clearRect(0, 0, size, size);
    
    // Zifferblatt Rand (benutzt jetzt 'center' und 'radius')
    mainCtx.beginPath();
    mainCtx.arc(center, center, radius, 0, 2 * Math.PI);
    mainCtx.strokeStyle = 'rgba(255,255,255,0.8)';
    mainCtx.lineWidth = size * 0.01; // Linienstärke skaliert mit
    mainCtx.stroke();

    // Zahlen skaliert zeichnen
    mainCtx.fillStyle = 'rgba(255,255,255,0.8)';
    mainCtx.font = `bold ${size * 0.06}px Arial`; // Schriftgröße skaliert mit
    mainCtx.textAlign = 'center';
    mainCtx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
        const ang = (i - 3) * (Math.PI / 6);
        mainCtx.fillText(i, center + (radius * 0.85) * Math.cos(ang), center + (radius * 0.85) * Math.sin(ang));
    }

    // Zeiger (Längen basieren jetzt auf 'radius')
    drawHand(mainCtx, center, h * (Math.PI / 6) - Math.PI / 2, radius * 0.5, size * 0.02, 'rgba(255,255,255,0.9)');
    drawHand(mainCtx, center, m * (Math.PI / 30) - Math.PI / 2, radius * 0.8, size * 0.012, 'rgba(255,255,255,0.8)');
    drawHand(mainCtx, center, s * (Math.PI / 30) - Math.PI / 2, radius * 0.9, size * 0.005, 'rgba(220,20,60,0.9)');

    // Mittelpunkt
    mainCtx.beginPath();
    mainCtx.arc(center, center, size * 0.02, 0, 2 * Math.PI);
    mainCtx.fillStyle = 'white';
    mainCtx.fill();
}

// Hilfsfunktion anpassen, um 'center' zu akzeptieren
function drawHand(ctx, center, angle, length, width, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(center, center);
    ctx.lineTo(center + length * Math.cos(angle), center + length * Math.sin(angle));
    ctx.stroke();
}
setInterval(updateMainClock, 16);

// --- VIDEO EASTER EGG LOGIK ---
const videoOverlay = document.getElementById('videoOverlay');
const videoElement = document.getElementById('easterEggVideo');

function toggleVideo() {
    if (!videoOverlay || !videoElement) return;
    if (videoOverlay.classList.contains('visible')) {
        videoElement.pause();
        videoElement.currentTime = 0;
        videoOverlay.classList.remove('visible');
    } else {
        videoOverlay.classList.add('visible');
        videoElement.play().catch(e => console.log("Klick nötig für Ton/Video."));
        videoElement.onended = () => toggleVideo();
    }
}

// --- OVERLAYS & SCHNEE & TASTEN (Zentraler Listener) ---
(function(){
    const aOverlay = document.createElement('div');
    aOverlay.className = 'clockOverlay';
    aOverlay.innerHTML = `<div class="clockContainer"><canvas id="aCanvasO" width="400" height="400" class="analogCanvas"></canvas></div>`;
    document.body.appendChild(aOverlay);

    const qOverlay = document.createElement('div');
    qOverlay.className = 'clockOverlay';
    qOverlay.innerHTML = `<div class="clockContainer"><div id="dOnlyEl" class="digitalOnly">00:00:00</div></div>`;
    document.body.appendChild(qOverlay);

    const aCtxO = document.getElementById('aCanvasO').getContext('2d');
    let aT = null, qT = null, snowing = false, sInt = null;

    // ALLE Tasten werden hier verarbeitet
    document.addEventListener('keydown', (ev) => {
        if (isTyping()) return;
        const key = ev.key.toLowerCase();

        // 1. Fullscreen / Beenden (B)
        if (key === 'b') {
            if (!document.fullscreenElement) {
                exitAllowed = false;
                enterFullscreen();
            } else {
                exitAllowed = true;
                leaveFullscreen();
            }
        }

        // 2. Escape-Schutz
        if (ev.key === 'Escape' && !exitAllowed) {
            ev.preventDefault();
            setTimeout(enterFullscreen, 50);
        }

        // 3. Video Egg (S)
        if (key === 's') {
            toggleVideo();
        }

        // 4. Analog Overlay (Z)
        if (key === 'z') {
            if (aT) { clearInterval(aT); aT = null; aOverlay.classList.remove('visible'); }
            else { 
                aOverlay.classList.add('visible'); 
                aT = setInterval(() => {
                    const n = new Date();
                    const s = n.getSeconds() + n.getMilliseconds()/1000;
                    const m = n.getMinutes() + s/60;
                    const h = (n.getHours()%12) + m/60;
                    aCtxO.clearRect(0,0,400,400);
                    aCtxO.strokeStyle='white'; aCtxO.lineWidth=2;
                    aCtxO.beginPath(); aCtxO.arc(200,200,190,0,7); aCtxO.stroke();
                    drawHand(aCtxO, h*Math.PI/6 - 1.57, 100, 6, 'white');
                    drawHand(aCtxO, m*Math.PI/30 - 1.57, 140, 4, 'white');
                    drawHand(aCtxO, s*Math.PI/30 - 1.57, 160, 2, '#ff6b6b');
                }, 16); 
            }
        }

        // 5. Digital Overlay (Q)
        if (key === 'q') {
            if (qT) { clearInterval(qT); qT = null; qOverlay.classList.remove('visible'); }
            else { 
                qOverlay.classList.add('visible'); 
                qT = setInterval(() => {
                    document.getElementById('dOnlyEl').textContent = new Date().toLocaleTimeString();
                }, 100); 
            }
        }

        // 6. Schnee (F)
        if (key === 'f') {
            snowing = !snowing;
            if (snowing) sInt = setInterval(createSnowflake, 40);
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
    if (!document.fullscreenElement && !exitAllowed) {
        enterFullscreen();
    }
});
