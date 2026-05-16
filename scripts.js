const canvas = document.getElementById('dpCanvas');
const ctx = canvas.getContext('2d');

const imageLoader = document.getElementById('imageLoader');
const frameTarget = document.getElementById('frame-click-target');

const zoomS = document.getElementById('zoomSlider');
const xS = document.getElementById('xSlider');
const yS = document.getElementById('ySlider');

const SIZE = 2048;

canvas.width = SIZE;
canvas.height = SIZE;

let userImg = null;

let frameImg = new Image();

let state = {
    z: 1,
    x: 0,
    y: 0
};

// ==========================
// DRAG & TOUCH STATE
// ==========================

let isDragging = false;
let lastX = 0;
let lastY = 0;

let lastDistance = 0;

// ==========================
// FRAME IMAGE
// ==========================

frameImg.crossOrigin = "anonymous";
frameImg.src = 'assets/we-want-justice.png';

// ==========================
// DRAW FUNCTION
// ==========================

function draw() {

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Draw uploaded image
    if (userImg) {

        const w = userImg.width * state.z;
        const h = userImg.height * state.z;

        const cx = (SIZE / 2) - (w / 2) + state.x;
        const cy = (SIZE / 2) - (h / 2) + state.y;

        ctx.drawImage(userImg, cx, cy, w, h);
    }

    // Draw frame on top
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
}

// ==========================
// OPEN FILE PICKER
// ==========================

let moved = false;

canvas.addEventListener('mousedown', () => {
    moved = false;
});

canvas.addEventListener('mousemove', () => {
    if (isDragging) {
        moved = true;
    }
});

canvas.addEventListener('mouseup', () => {

    // Only open file picker if user didn't drag
    if (!moved) {
        imageLoader.click();
    }
});

canvas.addEventListener('touchstart', () => {
    moved = false;
});

canvas.addEventListener('touchmove', () => {
    moved = true;
});

canvas.addEventListener('touchend', () => {

    // Tap only (not drag)
    if (!moved) {
        imageLoader.click();
    }
});

// ==========================
// IMAGE UPLOAD
// ==========================

imageLoader.onchange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {

        const img = new Image();

        img.onload = () => {

            userImg = img;

            // Fit smallest side to canvas
            const scale = SIZE / Math.min(img.width, img.height);

            state.z = scale;
            state.x = 0;
            state.y = 0;

            // Sync sliders
            zoomS.value = scale;
            xS.value = 0;
            yS.value = 0;

            // Hide upload hint
            const hint = document.getElementById('upload-hint');

            hint.style.opacity = '0';

            setTimeout(() => {
                hint.style.display = 'none';
            }, 300);

            draw();
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
};

// ==========================
// SLIDER UPDATE
// ==========================

function updateState() {

    state.z = parseFloat(zoomS.value);
    state.x = parseInt(xS.value);
    state.y = parseInt(yS.value);

    draw();
}

zoomS.oninput = updateState;
xS.oninput = updateState;
yS.oninput = updateState;

// ==========================
// BUTTON CONTROLS
// ==========================

function adjust(type, amt) {

    if (type === 'zoom') {
        zoomS.value = parseFloat(zoomS.value) + amt;
    }

    if (type === 'x') {
        xS.value = parseInt(xS.value) + amt;
    }

    if (type === 'y') {
        yS.value = parseInt(yS.value) + amt;
    }

    updateState();
}

// ==========================
// MOUSE DRAG
// ==========================

canvas.addEventListener('mousedown', (e) => {

    isDragging = true;

    lastX = e.clientX;
    lastY = e.clientY;
});

window.addEventListener('mouseup', () => {

    isDragging = false;
});

window.addEventListener('mousemove', (e) => {

    if (!isDragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    state.x += dx;
    state.y += dy;

    xS.value = state.x;
    yS.value = state.y;

    lastX = e.clientX;
    lastY = e.clientY;

    draw();
});

// ==========================
// TOUCH EVENTS
// ==========================

canvas.addEventListener('touchstart', (e) => {

    // Single finger drag
    if (e.touches.length === 1) {

        isDragging = true;

        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
    }

    // Pinch zoom start
    if (e.touches.length === 2) {

        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;

        lastDistance = Math.sqrt(dx * dx + dy * dy);
    }

}, { passive: false });

canvas.addEventListener('touchmove', (e) => {

    e.preventDefault();

    // Single finger drag
    if (e.touches.length === 1 && isDragging) {

        const dx = e.touches[0].clientX - lastX;
        const dy = e.touches[0].clientY - lastY;

        state.x += dx;
        state.y += dy;

        xS.value = state.x;
        yS.value = state.y;

        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;

        draw();
    }

    // Pinch zoom
    if (e.touches.length === 2) {

        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        const zoomChange = (distance - lastDistance) * 0.005;

        state.z += zoomChange;

        // Limit zoom
        state.z = Math.max(0.1, Math.min(10, state.z));

        zoomS.value = state.z;

        lastDistance = distance;

        draw();
    }

}, { passive: false });

canvas.addEventListener('touchend', () => {

    isDragging = false;
});

// ==========================
// MOUSE WHEEL ZOOM
// ==========================

canvas.addEventListener('wheel', (e) => {

    e.preventDefault();

    const zoomAmount = -e.deltaY * 0.001;

    state.z += zoomAmount;

    // Limit zoom
    state.z = Math.max(0.1, Math.min(10, state.z));

    zoomS.value = state.z;

    draw();

}, { passive: false });

// ==========================
// DOWNLOAD
// ==========================

document.getElementById('downloadBtn').onclick = () => {

    if (!userImg) {
        return alert("Please upload a photo first!");
    }

    const link = document.createElement('a');

    link.download = 'justice-dp.png';

    link.href = canvas.toDataURL('image/png', 1.0);

    link.click();
};

// ==========================
// INIT
// ==========================

window.onload = () => {

    const ua = navigator.userAgent || navigator.vendor;

    if (/FBAN|FBAV|Instagram/.test(ua)) {

        document.getElementById('browser-warning').style.display = 'flex';
    }

    frameImg.onload = draw;

    draw();
};