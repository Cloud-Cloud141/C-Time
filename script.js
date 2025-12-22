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

// Tasten-Events
document.addEventListener('keydown', (ev) => {
    const key = ev.key.toLowerCase();
    
    if (key === 'b' && !isTyping()) {
        if (!document.fullscreenElement) {
            exitAllowed = false;
            enterFullscreen();
        } else {
            exitAllowed = true;
            leaveFullscreen();
        }
    }

    if (ev.key === 'Escape' && !exitAllowed) {
        ev.preventDefault();
        setTimeout(enterFullscreen, 50);
    }
}, true);

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !exitAllowed) {
        enterFullscreen();
    }
});

// --- ZEICHEN-FUNKTIONEN ---
function drawHand(ctx, angle, length, width, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(200, 200);
    ctx.lineTo(200 + length * Math.cos(angle), 200 + length * Math.sin(angle));
    ctx.stroke();
}

// --- HAUPTUHR ---
const mainCanvas = document.getElementById('analogClock');
const mainCtx = mainCanvas.getContext('2d');
const digitalTimeEl = document.getElementById('digitalTime');

function updateMainClock() {
    const now = new Date();
    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    digitalTimeEl.textContent = now.toLocaleTimeString('de-DE');

    mainCtx.clearRect(0, 0, 400, 400);
    
    // Zifferblatt Rand
    mainCtx.beginPath();
    mainCtx.arc(200, 200, 190, 0, 2 * Math.PI);
    mainCtx.strokeStyle = 'rgba(255,255,255,0.8)';
    mainCtx.lineWidth = 3;
    mainCtx.stroke();

    // Zahlen
    mainCtx.fillStyle = 'rgba(255,255,255,0.8)';
    mainCtx.font = 'bold 20px Arial';
    mainCtx.textAlign = 'center';
    mainCtx.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) {
        const ang = (i - 3) * (Math.PI / 6);
        mainCtx.fillText(i, 200 + 160 * Math.cos(ang), 200 + 160 * Math.sin(ang));
    }

    drawHand(mainCtx, h * (Math.PI / 6) - Math.PI / 2, 80, 8, 'rgba(255,255,255,0.9)');
    drawHand(mainCtx, m * (Math.PI / 30) - Math.PI / 2, 120, 5, 'rgba(255,255,255,0.8)');
    drawHand(mainCtx, s * (Math.PI / 30) - Math.PI / 2, 130, 2, 'rgba(220,20,60,0.9)');

    mainCtx.beginPath();
    mainCtx.arc(200, 200, 8, 0, 2 * Math.PI);
    mainCtx.fillStyle = 'white';
    mainCtx.fill();
}
setInterval(updateMainClock, 16);

// --- OVERLAYS & SCHNEE ---
(function(){
    // Overlays dynamisch erstellen
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

    document.addEventListener('keydown', (e) => {
        if(isTyping()) return;
        const k = e.key.toLowerCase();
        
        if(k === 'z'){
            if(aT) { clearInterval(aT); aT=null; aOverlay.classList.remove('visible'); }
            else { aOverlay.classList.add('visible'); aT=setInterval(() => {
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
            }, 16); }
        }
        if(k === 'q'){
            if(qT) { clearInterval(qT); qT=null; qOverlay.classList.remove('visible'); }
            else { qOverlay.classList.add('visible'); qT=setInterval(() => {
                document.getElementById('dOnlyEl').textContent = new Date().toLocaleTimeString();
            }, 100); }
        }
        if(k === 'f') {
            snowing = !snowing;
            if(snowing) sInt = setInterval(createSnowflake, 40);
            else clearInterval(sInt);
        }
    });

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
