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
let state = { z: 1, x: 0, y: 0 };

// --- THE FRAME ---
frameImg.crossOrigin = "anonymous";
frameImg.src = 'assets/we-want-justice.png';

function draw() {
    // Clear entire canvas to transparent
    ctx.clearRect(0, 0, SIZE, SIZE);

    // 1. Draw User Image (Bottom Layer)
    if (userImg) {
const w = userImg.width * state.z;
const h = userImg.height * state.z;
const cx = (SIZE / 2) - (w / 2) + state.x;
const cy = (SIZE / 2) - (h / 2) + state.y;
ctx.drawImage(userImg, cx, cy, w, h);
    }

    // 2. Draw Frame (Top Layer)
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE);
}

// Trigger file input when clicking the canvas
frameTarget.onclick = () => imageLoader.click();

// Handle Image Upload
imageLoader.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
const img = new Image();
img.onload = () => {
    userImg = img;
    
    // Fit smallest side to frame size (2048)
    const scale = SIZE / Math.min(img.width, img.height);
    state.z = scale;
    state.x = 0;
    state.y = 0;

    // Sync sliders
    zoomS.value = scale;
    xS.value = 0;
    yS.value = 0;

    // Hide the click to upload hint
    document.getElementById('upload-hint').style.opacity = '0';
    setTimeout(() => {
document.getElementById('upload-hint').style.display = 'none';
    }, 300);

    draw();
};
img.src = event.target.result;
    };
    reader.readAsDataURL(file);
};

// Slider logic
function updateState() {
    state.z = parseFloat(zoomS.value);
    state.x = parseInt(xS.value);
    state.y = parseInt(yS.value);
    draw();
}

zoomS.oninput = updateState;
xS.oninput = updateState;
yS.oninput = updateState;

function adjust(type, amt) {
    if (type === 'zoom') zoomS.value = parseFloat(zoomS.value) + amt;
    if (type === 'x') xS.value = parseInt(xS.value) + amt;
    if (type === 'y') yS.value = parseInt(yS.value) + amt;
    updateState();
}

// Download
document.getElementById('downloadBtn').onclick = () => {
    if (!userImg) return alert("Please upload a photo first!");
    const link = document.createElement('a');
    link.download = 'justice-dp.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
};

// Initialize
window.onload = () => {
    const ua = navigator.userAgent || navigator.vendor;
    if (/FBAN|FBAV|Instagram/.test(ua)) {
document.getElementById('browser-warning').style.display = 'flex';
    }
    frameImg.onload = draw;
    draw();
};