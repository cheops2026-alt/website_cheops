const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const state = {
  paddleWidth: 16,
  paddleHeight: 110,
  playerY: 0,
  aiY: 0,
  playerScore: 0,
  aiScore: 0,
  ball: {
    x: 0,
    y: 0,
    vx: 8,
    vy: 4,
    r: 10
  }
};

function resizeCanvas() {
  const wrap = canvas.parentElement;
  const wrapWidth = Math.max(260, Math.floor(wrap.clientWidth - 4));
  const maxCanvasHeight = Math.max(220, window.innerHeight - 250);
  let width = wrapWidth;
  let height = Math.floor(width * 0.56);

  if (height > maxCanvasHeight) {
    height = maxCanvasHeight;
    width = Math.floor(height / 0.56);
  }

  canvas.width = width;
  canvas.height = height;

  // Scale gameplay to the current viewport size.
  state.paddleWidth = Math.max(10, Math.floor(canvas.width * 0.018));
  state.paddleHeight = Math.max(70, Math.min(130, Math.floor(canvas.height * 0.22)));
  state.ball.r = Math.max(6, Math.floor(canvas.width * 0.01));
  resetPositions();
}

function resetPositions() {
  state.playerY = canvas.height / 2 - state.paddleHeight / 2;
  state.aiY = canvas.height / 2 - state.paddleHeight / 2;
  resetBall();
}

function resetBall(direction = 1) {
  state.ball.x = canvas.width / 2;
  state.ball.y = canvas.height / 2;
  const baseSpeed = 7;
  state.ball.vx = baseSpeed * direction;
  state.ball.vy = (Math.random() * 4 - 2) || 1.5;
}

function clampPaddles() {
  state.playerY = Math.max(0, Math.min(canvas.height - state.paddleHeight, state.playerY));
  state.aiY = Math.max(0, Math.min(canvas.height - state.paddleHeight, state.aiY));
}

function update() {
  const b = state.ball;
  const sidePadding = Math.max(10, Math.floor(canvas.width * 0.025));
  b.x += b.vx;
  b.y += b.vy;

  if (b.y - b.r <= 0 || b.y + b.r >= canvas.height) {
    b.vy *= -1;
  }

  // player collision
  const playerX = sidePadding;
  if (
    b.x - b.r <= playerX + state.paddleWidth &&
    b.y >= state.playerY &&
    b.y <= state.playerY + state.paddleHeight
  ) {
    b.vx = Math.abs(b.vx) + 0.25;
    const hit = (b.y - (state.playerY + state.paddleHeight / 2)) / (state.paddleHeight / 2);
    b.vy += hit * 2.2;
  }

  // ai collision
  const aiX = canvas.width - sidePadding - state.paddleWidth;
  if (
    b.x + b.r >= aiX &&
    b.y >= state.aiY &&
    b.y <= state.aiY + state.paddleHeight
  ) {
    b.vx = -Math.abs(b.vx) - 0.25;
    const hit = (b.y - (state.aiY + state.paddleHeight / 2)) / (state.paddleHeight / 2);
    b.vy += hit * 2.2;
  }

  if (b.x < -30) {
    state.aiScore += 1;
    resetBall(1);
  }

  if (b.x > canvas.width + 30) {
    state.playerScore += 1;
    resetBall(-1);
  }

  // simple AI
  const aiCenter = state.aiY + state.paddleHeight / 2;
  state.aiY += (b.y - aiCenter) * 0.11;
  clampPaddles();
}

function drawNet() {
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  const x = canvas.width / 2 - 1;
  for (let y = 8; y < canvas.height; y += 26) {
    ctx.fillRect(x, y, 2, 14);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawNet();

  // scores
  ctx.fillStyle = '#fdb931';
  const scoreFontSize = Math.max(20, Math.floor(canvas.width * 0.035));
  ctx.font = `700 ${scoreFontSize}px Poppins`;
  ctx.textAlign = 'center';
  ctx.fillText(String(state.playerScore), canvas.width * 0.25, 50);
  ctx.fillText(String(state.aiScore), canvas.width * 0.75, 50);

  // paddles
  ctx.fillStyle = '#ffd700';
  const sidePadding = Math.max(10, Math.floor(canvas.width * 0.025));
  ctx.fillRect(sidePadding, state.playerY, state.paddleWidth, state.paddleHeight);
  ctx.fillRect(canvas.width - sidePadding - state.paddleWidth, state.aiY, state.paddleWidth, state.paddleHeight);

  // ball
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, state.ball.r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function setPlayerFromClientY(clientY) {
  const rect = canvas.getBoundingClientRect();
  const y = clientY - rect.top;
  state.playerY = y - state.paddleHeight / 2;
  clampPaddles();
}

canvas.addEventListener('mousemove', (e) => setPlayerFromClientY(e.clientY));
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  setPlayerFromClientY(e.touches[0].clientY);
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  setPlayerFromClientY(e.touches[0].clientY);
}, { passive: false });

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
resizeCanvas();
loop();

