const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const motionSpeed = 1.55;

export function initAmbientBackground() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  canvas.className = "ambient-background";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    frame: null,
    running: false,
    stars: []
  };

  const resize = () => {
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    state.stars = createStars(state.width, state.height);
    draw(state, context, 0);
  };

  const start = () => {
    if (state.running || reducedMotionQuery.matches) return;
    state.running = true;

    const tick = (time) => {
      draw(state, context, time * 0.001 * motionSpeed);
      state.frame = window.requestAnimationFrame(tick);
    };

    state.frame = window.requestAnimationFrame(tick);
  };

  const stop = () => {
    state.running = false;
    if (state.frame) window.cancelAnimationFrame(state.frame);
    state.frame = null;
  };

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
  reducedMotionQuery.addEventListener("change", () => {
    stop();
    draw(state, context, 0);
    start();
  });

  resize();
  start();
}

function createStars(width, height) {
  const count = Math.max(34, Math.min(88, Math.floor((width * height) / 24000)));

  return Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 1 + Math.random() * 1.35,
    driftX: -3.4 + Math.random() * 6.8,
    driftY: -2.2 + Math.random() * 4.4,
    wanderX: 10 + Math.random() * 28,
    wanderY: 8 + Math.random() * 24,
    wanderSpeed: 0.1 + Math.random() * 0.22,
    phase: Math.random() * Math.PI * 2,
    opacity: 0.18 + Math.random() * 0.24,
    tint: index % 4
  }));
}

function draw(state, context, seconds) {
  const { width, height } = state;
  if (!width || !height) return;

  context.clearRect(0, 0, width, height);
  drawBase(context, width, height);
  drawLongRibbons(context, width, height, seconds);
  drawSoftFields(context, width, height, seconds);
  drawStars(context, state.stars, seconds, width, height);
  drawVignette(context, width, height);
}

function drawBase(context, width, height) {
  const base = context.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#111516");
  base.addColorStop(0.5, "#171b1d");
  base.addColorStop(1, "#0f1213");
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);
}

function drawLongRibbons(context, width, height, seconds) {
  const ribbons = [
    { y: 0.24, color: "rgba(167, 192, 128, 0.014)", width: 180, speed: 0.16, phase: 0 },
    { y: 0.58, color: "rgba(127, 187, 179, 0.016)", width: 220, speed: 0.12, phase: 1.6 },
    { y: 0.84, color: "rgba(230, 152, 117, 0.01)", width: 150, speed: 0.1, phase: 3.1 }
  ];

  context.save();
  context.globalCompositeOperation = "screen";
  context.filter = "blur(42px)";

  ribbons.forEach((ribbon) => {
    const drift = Math.sin(seconds * ribbon.speed + ribbon.phase) * width * 0.1;
    const rise = Math.cos(seconds * ribbon.speed * 0.7 + ribbon.phase) * height * 0.08;

    context.beginPath();
    context.moveTo(-width * 0.25 + drift, height * ribbon.y + rise);
    context.bezierCurveTo(
      width * 0.18 + drift,
      height * (ribbon.y - 0.22) - rise,
      width * 0.72 + drift,
      height * (ribbon.y + 0.2) + rise,
      width * 1.25 + drift,
      height * (ribbon.y - 0.04) - rise
    );
    context.strokeStyle = ribbon.color;
    context.lineWidth = ribbon.width;
    context.lineCap = "round";
    context.stroke();
  });

  context.restore();
}

function drawSoftFields(context, width, height, seconds) {
  const fields = [
    {
      x: 0.18 + Math.sin(seconds * 0.08) * 0.08,
      y: 0.24 + Math.cos(seconds * 0.07) * 0.05,
      radius: 0.52,
      color: "rgba(167, 192, 128, 0.018)"
    },
    {
      x: 0.78 + Math.cos(seconds * 0.06) * 0.07,
      y: 0.38 + Math.sin(seconds * 0.075) * 0.06,
      radius: 0.58,
      color: "rgba(127, 187, 179, 0.022)"
    },
    {
      x: 0.5 + Math.sin(seconds * 0.045) * 0.12,
      y: 0.88 + Math.cos(seconds * 0.05) * 0.04,
      radius: 0.64,
      color: "rgba(211, 198, 170, 0.012)"
    }
  ];

  context.save();
  context.globalCompositeOperation = "screen";

  fields.forEach((field) => {
    const radius = Math.max(width, height) * field.radius;
    const gradient = context.createRadialGradient(
      width * field.x,
      height * field.y,
      0,
      width * field.x,
      height * field.y,
      radius
    );
    gradient.addColorStop(0, field.color);
    gradient.addColorStop(0.58, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  });

  context.restore();
}

function drawStars(context, stars, seconds, width, height) {
  const colors = [
    "167, 192, 128",
    "127, 187, 179",
    "211, 198, 170",
    "230, 152, 117"
  ];

  context.save();
  context.globalCompositeOperation = "screen";

  stars.forEach((star) => {
    const x = wrapCoordinate(
      star.x +
      seconds * star.driftX +
      Math.sin(seconds * star.wanderSpeed + star.phase) * star.wanderX,
      width
    );
    const y = wrapCoordinate(
      star.y +
      seconds * star.driftY +
      Math.cos(seconds * star.wanderSpeed * 0.9 + star.phase) * star.wanderY,
      height
    );

    context.beginPath();
    context.arc(x, y, star.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(${colors[star.tint]}, ${star.opacity})`;
    context.fill();
  });

  context.restore();
}

function wrapCoordinate(value, max) {
  return ((value % max) + max) % max;
}

function drawVignette(context, width, height) {
  const vignette = context.createRadialGradient(
    width * 0.5,
    height * 0.42,
    0,
    width * 0.5,
    height * 0.42,
    Math.max(width, height) * 0.78
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.66, "rgba(0, 0, 0, 0.28)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.68)");

  context.fillStyle = vignette;
  context.fillRect(0, 0, width, height);
}
