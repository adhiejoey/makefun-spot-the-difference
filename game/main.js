// Twin Spots — a spot-the-difference game.
// Two near-identical pictures side by side, seven differences per level, three
// levels. Click a difference on either picture to mark it on both. The counter,
// timer and score live in the HUD above the canvas; title / level-complete /
// win screens are DOM overlays. Fully offline: all art is procedural canvas
// drawing (see scenes.js), all sound is synthesised (see audio.js).
//
// Screenshot staging: ?shot=start shows the title screen, ?shot=play opens
// level 1 with three differences already found, ?shot=play2 opens level 2 with
// two found, and ?shot=end shows the win screen. (?seed is accepted, ignored:
// every scene is deterministic.)

import { SCENES } from './scenes.js';
import { sfx, setMuted, isMuted } from './audio.js';

const PANEL = 480;
const GAP = 20;
const PAD = 10;
const W = PAD * 2 + PANEL * 2 + GAP; // 1000
const H = PAD * 2 + PANEL;           // 500
const DIFFS_PER_LEVEL = 7;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W; canvas.height = H;

const el = (id) => document.getElementById(id);
const hudLevel = el('hud-level'), hudFound = el('hud-found'), hudTime = el('hud-time');
const hudScore = el('hud-score'), hudHints = el('hud-hints'), toast = el('toast');
const btnHint = el('btn-hint'), btnRestart = el('btn-restart'), btnSound = el('btn-sound');

const state = {
  screen: 'title', // title | playing | levelDone | win
  level: 0,
  found: new Set(),
  score: 0,
  seconds: 0,
  hintsLeft: 3,
  misses: [],       // {x, y, until}
  hintPulse: null,  // {idx, until}
  totalScore: 0,
  totalSeconds: 0,
  lastTick: 0,
};

// Pre-rendered panels for the current level (static art, drawn once per level).
let panelLeft = null, panelRight = null;

function renderPanels() {
  const scene = SCENES[state.level];
  panelLeft = document.createElement('canvas');
  panelRight = document.createElement('canvas');
  panelLeft.width = panelRight.width = PANEL;
  panelLeft.height = panelRight.height = PANEL;
  scene.draw(panelLeft.getContext('2d'), 'left');
  scene.draw(panelRight.getContext('2d'), 'right');
}

function panelOrigin(side) {
  return { x: side === 'left' ? PAD : PAD + PANEL + GAP, y: PAD };
}

function diffCentre(diff, side) {
  if (side === 'left') return { x: diff.lx ?? diff.x, y: diff.ly ?? diff.y };
  return { x: diff.rx ?? diff.x, y: diff.ry ?? diff.y };
}

function fmtTime(s) {
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
}

function updateHud() {
  const scene = SCENES[state.level];
  hudLevel.textContent = `Level ${state.level + 1} · ${scene.name}`;
  hudFound.textContent = `${state.found.size} / ${DIFFS_PER_LEVEL} found · ${DIFFS_PER_LEVEL - state.found.size} left`;
  hudTime.textContent = fmtTime(state.seconds);
  hudScore.textContent = `Score ${state.score}`;
  hudHints.textContent = `Hints ${state.hintsLeft}`;
  btnHint.disabled = state.screen !== 'playing' || state.hintsLeft <= 0;
}

let toastTimer = null;
function showToast(msg, ms = 2200) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), ms);
}

function showScreen(name) {
  for (const id of ['screen-title', 'screen-level', 'screen-win']) {
    el(id).classList.toggle('hidden', id !== 'screen-' + name);
  }
}

function startLevel(i, keepScore = false) {
  state.level = i;
  state.found = new Set();
  state.seconds = 0;
  state.hintsLeft = 3;
  state.misses = [];
  state.hintPulse = null;
  if (!keepScore) state.score = 0;
  state.screen = 'playing';
  state.lastTick = performance.now();
  renderPanels();
  showScreen('none');
  updateHud();
}

function startGame(fromLevel = 0) {
  state.totalScore = 0; state.totalSeconds = 0;
  startLevel(fromLevel);
  showToast('Find all 7 differences! Click a difference on either picture.');
}

function levelComplete() {
  state.screen = 'levelDone';
  state.totalScore += state.score;
  state.totalSeconds += state.seconds;
  sfx.level();
  el('level-title').textContent = `Level ${state.level + 1} complete!`;
  el('level-detail').textContent =
    `${SCENES[state.level].name} · ${fmtTime(state.seconds)} · ${state.score} points`;
  el('btn-next').textContent = state.level === SCENES.length - 1 ? 'See results' : 'Next level';
  showScreen('level');
  updateHud();
}

function showWin() {
  state.screen = 'win';
  sfx.win();
  el('win-score').textContent = `${state.totalScore} points`;
  el('win-time').textContent = fmtTime(state.totalSeconds);
  showScreen('win');
  updateHud();
}

function useHint() {
  if (state.screen !== 'playing' || state.hintsLeft <= 0) return;
  const scene = SCENES[state.level];
  const idx = scene.diffs.findIndex((_, i) => !state.found.has(i));
  if (idx === -1) return;
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - 50);
  state.hintPulse = { idx, until: performance.now() + 2600 };
  sfx.hint();
  showToast('Hint used (−50 points): watch the pulsing circle!');
  updateHud();
}

function onCanvasClick(ev) {
  if (state.screen !== 'playing') return;
  const rect = canvas.getBoundingClientRect();
  const x = (ev.clientX - rect.left) * (W / rect.width);
  const y = (ev.clientY - rect.top) * (H / rect.height);
  const side = x < PAD + PANEL + GAP / 2 ? 'left' : 'right';
  const ox = side === 'left' ? PAD : PAD + PANEL + GAP;
  const lx = x - ox, ly = y - PAD;
  if (lx < 0 || lx > PANEL || ly < 0 || ly > PANEL) return;
  const scene = SCENES[state.level];
  for (let i = 0; i < scene.diffs.length; i++) {
    if (state.found.has(i)) continue;
    const c = diffCentre(scene.diffs[i], side);
    const d = Math.hypot(lx - c.x, ly - c.y);
    if (d <= (scene.diffs[i].r + 8)) {
      state.found.add(i);
      state.score += 100;
      sfx.correct();
      showToast(`Found: ${scene.diffs[i].name}! +100`);
      updateHud();
      if (state.found.size === DIFFS_PER_LEVEL) {
        setTimeout(() => { if (state.screen === 'playing') levelComplete(); }, 650);
      }
      return;
    }
  }
  state.misses.push({ x, y, until: performance.now() + 650 });
  state.score = Math.max(0, state.score - 10);
  sfx.wrong();
  showToast('Not a difference — try again (−10)');
  updateHud();
}

function drawMarker(o, c, color, width, dashed) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width;
  if (dashed) ctx.setLineDash([8, 6]);
  ctx.beginPath(); ctx.arc(o.x + c.x, o.y + c.y, (c.r ?? 24) + 4, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function draw() {
  const now = performance.now();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, W, H);
  if (!panelLeft) return;
  const lo = panelOrigin('left'), ro = panelOrigin('right');
  ctx.drawImage(panelLeft, lo.x, lo.y);
  ctx.drawImage(panelRight, ro.x, ro.y);
  // centre divider + panel tags
  ctx.fillStyle = '#1e293b'; ctx.fillRect(PAD + PANEL, PAD, GAP, PANEL);
  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('A', PAD + 18, PAD + 22);
  ctx.fillText('B', PAD + PANEL + GAP + 18, PAD + 22);
  // found markers on both panels
  const scene = SCENES[state.level];
  for (const i of state.found) {
    drawMarker(lo, diffCentre(scene.diffs[i], 'left'), '#ef4444', 5, false);
    drawMarker(ro, diffCentre(scene.diffs[i], 'right'), '#ef4444', 5, false);
    // small tick in the middle of each marker
    for (const o of [lo, ro]) {
      const c = diffCentre(scene.diffs[i], o === lo ? 'left' : 'right');
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(o.x + c.x - 8, o.y + c.y); ctx.lineTo(o.x + c.x - 2, o.y + c.y + 7); ctx.lineTo(o.x + c.x + 9, o.y + c.y - 7);
      ctx.stroke();
    }
  }
  // hint pulse
  if (state.hintPulse && now < state.hintPulse.until) {
    const d = scene.diffs[state.hintPulse.idx];
    const pulse = 6 + Math.sin(now / 130) * 3;
    drawMarker(lo, diffCentre(d, 'left'), '#facc15', pulse, true);
    drawMarker(ro, diffCentre(d, 'right'), '#facc15', pulse, true);
  } else if (state.hintPulse) state.hintPulse = null;
  // miss X marks
  state.misses = state.misses.filter((m) => now < m.until);
  for (const m of state.misses) {
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(m.x - 10, m.y - 10); ctx.lineTo(m.x + 10, m.y + 10);
    ctx.moveTo(m.x + 10, m.y - 10); ctx.lineTo(m.x - 10, m.y + 10);
    ctx.stroke();
  }
  // timer
  if (state.screen === 'playing') {
    state.seconds += (now - state.lastTick) / 1000;
    hudTime.textContent = fmtTime(state.seconds);
  }
  state.lastTick = now;
  requestAnimationFrame(draw);
}

canvas.addEventListener('click', onCanvasClick);
btnHint.addEventListener('click', () => { sfx.click(); useHint(); });
btnRestart.addEventListener('click', () => { sfx.click(); startLevel(state.level, false); });
btnSound.addEventListener('click', () => {
  setMuted(!isMuted());
  btnSound.textContent = isMuted() ? '🔇 Sound off' : '🔊 Sound on';
});
el('btn-start').addEventListener('click', () => { sfx.click(); startGame(0); });
el('btn-next').addEventListener('click', () => {
  sfx.click();
  if (state.level === SCENES.length - 1) showWin();
  else startLevel(state.level + 1, true);
});
el('btn-again').addEventListener('click', () => { sfx.click(); startGame(0); });
for (const b of document.querySelectorAll('.lvl-btn')) {
  b.addEventListener('click', () => { sfx.click(); startGame(Number(b.dataset.level)); });
}
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'h' || ev.key === 'H') useHint();
  if (ev.key === 'r' || ev.key === 'R') startLevel(state.level, false);
  if (ev.key === 'Enter' && state.screen === 'title') startGame(0);
  if ((ev.key === 'n' || ev.key === 'N') && state.screen === 'levelDone') el('btn-next').click();
});

// ---- screenshot staging (?shot=) ----
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
renderPanels();
if (shot === 'play') {
  startLevel(0, false);
  state.found = new Set([0, 1, 2]);
  state.seconds = 83; state.score = 300;
  updateHud();
} else if (shot === 'play2') {
  startLevel(1, true);
  state.found = new Set([0, 1]);
  state.seconds = 41; state.score = 200;
  updateHud();
} else if (shot === 'end') {
  startLevel(2, true);
  state.found = new Set([0, 1, 2, 3, 4, 5, 6]);
  state.seconds = 277; state.score = 2140;
  state.totalScore = 2140; state.totalSeconds = 277;
  state.screen = 'win';
  el('win-score').textContent = '2140 points';
  el('win-time').textContent = '04:37';
  showScreen('win');
  updateHud();
} else {
  showScreen('title');
  updateHud();
}
requestAnimationFrame(draw);
