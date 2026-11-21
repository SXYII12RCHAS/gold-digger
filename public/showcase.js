const showcase = document.querySelector('.showcase');
const ingot = document.querySelector('.showcase__ingot');

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Spring config from the shared set: mass 1, stiffness 100, damping 10.
const MASS = 1;
const STIFFNESS = 100;
const DAMPING = 10;
const MAX_TILT = 12;

let targetX = 0;
let targetY = 0;
let angleX = 0;
let angleY = 0;
let velocityX = 0;
let velocityY = 0;
let frame = null;
let lastTime = 0;
let active = false;

const clamp = (value) => Math.max(-1, Math.min(1, value));

function render() {
  ingot.style.transform = `rotateX(${angleX.toFixed(2)}deg) rotateY(${angleY.toFixed(2)}deg)`;
}

function tick(now) {
  const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60;
  lastTime = now;

  velocityX += (((targetX - angleX) * STIFFNESS - velocityX * DAMPING) / MASS) * dt;
  velocityY += (((targetY - angleY) * STIFFNESS - velocityY * DAMPING) / MASS) * dt;
  angleX += velocityX * dt;
  angleY += velocityY * dt;
  render();

  const settled = Math.abs(targetX - angleX) < 0.01 && Math.abs(targetY - angleY) < 0.01
    && Math.abs(velocityX) < 0.01 && Math.abs(velocityY) < 0.01;

  if (settled) {
    angleX = targetX;
    angleY = targetY;
    velocityX = 0;
    velocityY = 0;
    frame = null;
    lastTime = 0;
    render();
    return;
  }

  frame = requestAnimationFrame(tick);
}

function start() {
  if (frame === null) {
    lastTime = 0;
    frame = requestAnimationFrame(tick);
  }
}

function stop() {
  if (frame !== null) {
    cancelAnimationFrame(frame);
    frame = null;
  }
  lastTime = 0;
  angleX = targetX = 0;
  angleY = targetY = 0;
  velocityX = 0;
  velocityY = 0;
  render();
}

function onPointerMove(event) {
  const rect = showcase.getBoundingClientRect();
  const offsetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1);
  const offsetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1);

  targetX = offsetY * MAX_TILT;
  targetY = -offsetX * MAX_TILT;
  start();
}

function onPointerLeave() {
  targetX = 0;
  targetY = 0;
  start();
}

function sync() {
  const shouldRun = finePointer.matches && !reducedMotion.matches;
  if (shouldRun === active) return;

  active = shouldRun;
  if (active) {
    showcase.addEventListener('pointermove', onPointerMove);
    showcase.addEventListener('pointerleave', onPointerLeave);
    showcase.addEventListener('pointercancel', onPointerLeave);
  } else {
    showcase.removeEventListener('pointermove', onPointerMove);
    showcase.removeEventListener('pointerleave', onPointerLeave);
    showcase.removeEventListener('pointercancel', onPointerLeave);
    stop();
  }
}

sync();
finePointer.addEventListener('change', sync);
reducedMotion.addEventListener('change', sync);
