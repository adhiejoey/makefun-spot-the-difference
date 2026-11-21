// Twin Spots — scene art. Three original scenes, each drawn twice (left / right)
// with exactly seven differences. All art is procedural canvas drawing: no image
// files, no network, no copied art. Every panel is 480x480 in local coordinates.
// A difference may give one centre (same spot on both sides) or a per-side centre
// (lx,ly on the left panel, rx,ry on the right) for things that moved.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
function ellipse(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill();
}
function star(ctx, x, y, r, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill();
}
function cloud(ctx, x, y, s) {
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, x, y, 34 * s, 20 * s); ellipse(ctx, x - 26 * s, y + 6 * s, 24 * s, 15 * s);
  ellipse(ctx, x + 28 * s, y + 6 * s, 26 * s, 16 * s);
}
function bird(ctx, x, y, s, color = '#334155') {
  ctx.strokeStyle = color; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 12 * s, y); ctx.quadraticCurveTo(x - 5 * s, y - 9 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 9 * s, x + 12 * s, y); ctx.stroke();
}

// ---------------------------------------------------------------- scene 1
function drawCove(ctx, side) {
  const R = side === 'right';
  const rng = mulberry32(11);
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#7ec8f7'); sky.addColorStop(1, '#ffe9a8');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 480, 300);
  // sun with rays (diff 1: sunglasses on the left only)
  ctx.fillStyle = '#ffd93b';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.save(); ctx.translate(72, 72); ctx.rotate(a);
    ctx.fillRect(-3, -58, 6, 18); ctx.restore();
  }
  circle(ctx, 72, 72, 34);
  if (!R) {
    ctx.fillStyle = '#1f2937';
    rr(ctx, 48, 62, 20, 13, 6); rr(ctx, 76, 62, 20, 13, 6);
    ctx.fillRect(66, 67, 12, 3);
  }
  // clouds (diff 2: middle cloud missing on the right)
  cloud(ctx, 180, 62, 1); cloud(ctx, 330, 44, 0.85);
  if (!R) cloud(ctx, 255, 96, 0.7);
  // birds (diff 4: three on the left, two on the right)
  bird(ctx, 150, 128, 1); bird(ctx, 205, 108, 0.85);
  if (!R) bird(ctx, 255, 138, 0.9);
  // sea
  ctx.fillStyle = '#2f9be8'; ctx.fillRect(0, 300, 480, 120);
  ctx.fillStyle = '#57b6f2';
  for (let i = 0; i < 5; i++) {
    const y = 318 + i * 20;
    ctx.beginPath();
    for (let x = 0; x <= 480; x += 12) ctx.lineTo(x, y + Math.sin((x + i * 60) / 40) * 4);
    ctx.lineTo(480, y + 10); ctx.lineTo(0, y + 10); ctx.closePath(); ctx.fill();
  }
  // boat with flag (diff 3: red flag left, blue flag right)
  ctx.fillStyle = '#8b5a2b';
  ctx.beginPath(); ctx.moveTo(300, 356); ctx.lineTo(372, 356); ctx.lineTo(356, 378); ctx.lineTo(316, 378); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6b4423'; ctx.fillRect(332, 300, 6, 56);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(338, 306); ctx.lineTo(338, 352); ctx.lineTo(372, 352); ctx.closePath(); ctx.fill();
  ctx.fillStyle = R ? '#2563eb' : '#ef4444';
  ctx.beginPath(); ctx.moveTo(338, 300); ctx.lineTo(366, 308); ctx.lineTo(338, 316); ctx.closePath(); ctx.fill();
  // beach
  ctx.fillStyle = '#f7dc9a'; ctx.fillRect(0, 420, 480, 60);
  ctx.fillStyle = '#eec97e';
  for (let i = 0; i < 14; i++) { circle(ctx, rng() * 480, 432 + rng() * 40, 2 + rng() * 2.5); }
  // starfish (diff 6: present left, gone right)
  if (!R) { ctx.fillStyle = '#ff8c42'; star(ctx, 118, 448, 20); circle(ctx, 118, 448, 5); }
  // crab (diff 7: crab left, spiral shell right)
  if (!R) {
    ctx.fillStyle = '#ef4444'; ellipse(ctx, 362, 452, 22, 15);
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(344, 446); ctx.lineTo(330, 434); ctx.moveTo(380, 446); ctx.lineTo(394, 434); ctx.stroke();
    ctx.fillStyle = '#1f2937'; circle(ctx, 354, 446, 3); circle(ctx, 370, 446, 3);
  } else {
    ctx.fillStyle = '#f4a7c3';
    ctx.beginPath(); ctx.arc(362, 452, 18, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e07ba0'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(362, 452, 11, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(362, 452, 5, Math.PI, 0); ctx.stroke();
  }
  // lighthouse (diff 5: beam on left, off right)
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(408, 190, 44, 230);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(408, 220, 44, 34); ctx.fillRect(408, 290, 44, 34); ctx.fillRect(408, 360, 44, 34);
  ctx.fillStyle = '#334155'; ctx.fillRect(404, 168, 52, 22);
  ctx.fillStyle = '#fde047'; ctx.fillRect(416, 176, 28, 12);
  if (!R) {
    ctx.fillStyle = 'rgba(253, 224, 71, 0.35)';
    ctx.beginPath(); ctx.moveTo(412, 182); ctx.lineTo(330, 140); ctx.lineTo(330, 224); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#334155'; ctx.fillRect(400, 420, 60, 8);
}

const COVE_DIFFS = [
  { x: 72, y: 72, r: 34, name: "the sun's sunglasses" },
  { x: 255, y: 96, r: 30, name: 'the middle cloud' },
  { x: 352, y: 308, r: 22, name: 'the boat flag colour' },
  { x: 255, y: 138, r: 20, name: 'the third bird' },
  { x: 396, y: 182, r: 30, name: 'the lighthouse beam' },
  { x: 118, y: 448, r: 24, name: 'the starfish' },
  { x: 362, y: 452, r: 26, name: 'the crab (a shell on the other side)' },
];

// ---------------------------------------------------------------- scene 2
function drawGarden(ctx, side) {
  const R = side === 'right';
  const rng = mulberry32(23);
  // sky + sun
  const sky = ctx.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, '#bfe8ff'); sky.addColorStop(0.55, '#e8f7d9'); sky.addColorStop(1, '#cdeeb0');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 480, 480);
  ctx.fillStyle = '#ffd93b'; circle(ctx, 412, 62, 30);
  // fence
  ctx.fillStyle = '#ffffff';
  for (let x = 0; x < 480; x += 40) ctx.fillRect(x + 6, 210, 10, 90);
  ctx.fillRect(0, 232, 480, 10); ctx.fillRect(0, 268, 480, 10);
  // tree with apples (diff 3: four apples left, three right)
  ctx.fillStyle = '#8b5a2b'; ctx.fillRect(96, 150, 22, 150);
  ctx.fillStyle = '#4ade80'; circle(ctx, 107, 110, 72); circle(ctx, 62, 140, 44); circle(ctx, 152, 140, 44);
  ctx.fillStyle = '#ef4444';
  circle(ctx, 70, 110, 9); circle(ctx, 140, 96, 9); circle(ctx, 118, 148, 9);
  if (!R) circle(ctx, 92, 78, 9);
  // birdhouse (diff 7: bird peeking left, empty right)
  ctx.fillStyle = '#a16207'; ctx.fillRect(372, 168, 12, 60);
  ctx.fillStyle = '#d97706'; ctx.beginPath(); ctx.moveTo(352, 172); ctx.lineTo(414, 172); ctx.lineTo(383, 140); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#92400e'; circle(ctx, 383, 192, 12);
  if (!R) { ctx.fillStyle = '#38bdf8'; circle(ctx, 383, 188, 10); ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(391, 188); ctx.lineTo(399, 191); ctx.lineTo(391, 194); ctx.closePath(); ctx.fill(); }
  // flower bed
  ctx.fillStyle = '#86c06c'; ctx.fillRect(0, 330, 480, 150);
  const flowers = [
    { x: 70, c: '#f472b6' }, { x: 150, c: '#facc15' }, { x: 235, c: '#ef4444' },
    { x: 320, c: '#fb923c' }, { x: 405, c: '#a78bfa' },
  ];
  for (const f of flowers) {
    ctx.strokeStyle = '#166534'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(f.x, 420); ctx.lineTo(f.x, 372); ctx.stroke();
    // diff 4: the middle flower is red on the left, purple on the right
    ctx.fillStyle = (f.x === 235 && R) ? '#a855f7' : f.c;
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5 - Math.PI / 2;
      circle(ctx, f.x + Math.cos(a) * 14, 366 + Math.sin(a) * 14, 10);
    }
    ctx.fillStyle = '#fde047'; circle(ctx, f.x, 366, 9);
  }
  // butterfly (diff 2: on a flower left, up by the tree right)
  const bx = R ? 176 : 150, by = R ? 168 : 352;
  ctx.fillStyle = '#c084fc';
  ellipse(ctx, bx - 10, by, 12, 8); ellipse(ctx, bx + 10, by, 12, 8);
  ctx.fillStyle = '#7c3aed'; ellipse(ctx, bx - 10, by + 6, 8, 5); ellipse(ctx, bx + 10, by + 6, 8, 5);
  // cat (diff 1: red bow left, none right)
  ctx.fillStyle = '#f5c98a';
  ellipse(ctx, 245, 400, 46, 34);
  circle(ctx, 245, 330, 34);
  ctx.beginPath(); ctx.moveTo(218, 308); ctx.lineTo(212, 272); ctx.lineTo(236, 296); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(272, 308); ctx.lineTo(278, 272); ctx.lineTo(254, 296); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f8b4c4';
  ctx.beginPath(); ctx.moveTo(221, 302); ctx.lineTo(217, 280); ctx.lineTo(231, 296); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(269, 302); ctx.lineTo(273, 280); ctx.lineTo(259, 296); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1f2937'; circle(ctx, 232, 326, 4); circle(ctx, 258, 326, 4);
  ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.moveTo(241, 338); ctx.lineTo(249, 338); ctx.lineTo(245, 344); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(245, 344); ctx.quadraticCurveTo(245, 352, 238, 354); ctx.moveTo(245, 344); ctx.quadraticCurveTo(245, 352, 252, 354); ctx.stroke();
  ctx.strokeStyle = '#d9a05b'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(288, 412); ctx.quadraticCurveTo(322, 400, 312, 366); ctx.stroke();
  if (!R) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.moveTo(245, 362); ctx.lineTo(226, 350); ctx.lineTo(226, 374); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(245, 362); ctx.lineTo(264, 350); ctx.lineTo(264, 374); ctx.closePath(); ctx.fill();
    circle(ctx, 245, 362, 6);
  }
  // watering can (diff 5: present left, gone right)
  if (!R) {
    ctx.fillStyle = '#64748b'; rr(ctx, 392, 392, 52, 34, 8);
    ctx.fillRect(440, 400, 26, 8);
    ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(392, 400); ctx.lineTo(372, 384); ctx.lineTo(372, 392); ctx.lineTo(390, 406); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#38bdf8';
    for (let i = 0; i < 3; i++) circle(ctx, 360 - i * 6, 396 + i * 8, 3);
  }
  // bee (diff 6: present left, gone right)
  if (!R) {
    ctx.fillStyle = '#facc15'; ellipse(ctx, 196, 356, 12, 9);
    ctx.fillStyle = '#1f2937'; ctx.fillRect(192, 348, 4, 16); ctx.fillRect(200, 348, 4, 16);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(192, 344, 7, 5, -0.5, 0, Math.PI * 2); ctx.stroke();
  }
}

const GARDEN_DIFFS = [
  { x: 245, y: 362, r: 26, name: "the cat's red bow" },
  { lx: 150, ly: 352, rx: 176, ry: 168, r: 24, name: 'the butterfly (it moved!)' },
  { x: 92, y: 78, r: 22, name: 'the fourth apple' },
  { x: 235, y: 366, r: 26, name: 'the middle flower colour' },
  { x: 418, y: 409, r: 30, name: 'the watering can' },
  { x: 196, y: 356, r: 22, name: 'the bee' },
  { x: 383, y: 188, r: 20, name: 'the bird in the birdhouse' },
];

// ---------------------------------------------------------------- scene 3
function drawMoon(ctx, side) {
  const R = side === 'right';
  const rng = mulberry32(37);
  // space sky + stars (diff 7: five-star cluster left, four right)
  ctx.fillStyle = '#0b1026'; ctx.fillRect(0, 0, 480, 300);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 40; i++) { circle(ctx, rng() * 480, rng() * 260, 1 + rng() * 1.8); }
  const cluster = [[238, 52], [262, 44], [282, 60], [252, 74], [272, 84]];
  for (let i = 0; i < (R ? 4 : 5); i++) { star(ctx, cluster[i][0], cluster[i][1], 7); }
  // planet (diff 1: Earth left, ringed planet right)
  if (!R) {
    ctx.fillStyle = '#3b82f6'; circle(ctx, 82, 82, 36);
    ctx.fillStyle = '#22c55e';
    ellipse(ctx, 70, 72, 14, 9); ellipse(ctx, 96, 94, 11, 7); ellipse(ctx, 88, 66, 8, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ellipse(ctx, 66, 60, 16, 7);
  } else {
    ctx.fillStyle = '#f59e0b'; circle(ctx, 82, 82, 32);
    ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.ellipse(82, 82, 52, 14, -0.35, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#b45309'; ellipse(ctx, 70, 74, 12, 6); ellipse(ctx, 94, 92, 9, 5);
  }
  // satellite (diff 6: present left, gone right)
  if (!R) {
    ctx.fillStyle = '#94a3b8'; ctx.fillRect(392, 76, 34, 16);
    ctx.fillStyle = '#2563eb'; ctx.fillRect(362, 80, 28, 8); ctx.fillRect(428, 80, 28, 8);
    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(409, 76); ctx.lineTo(409, 60); ctx.stroke();
    ctx.fillStyle = '#ef4444'; circle(ctx, 409, 58, 3);
  }
  // moon surface
  ctx.fillStyle = '#cbd5e1'; ctx.fillRect(0, 300, 480, 180);
  ctx.fillStyle = '#b6c2cf';
  ellipse(ctx, 60, 330, 70, 12); ellipse(ctx, 300, 318, 90, 10); ellipse(ctx, 430, 340, 60, 10);
  // craters (diff 5: one crater present left, gone right)
  ctx.fillStyle = '#9aa7b5';
  circle(ctx, 200, 380, 18); circle(ctx, 320, 430, 24); circle(ctx, 420, 400, 14);
  if (!R) circle(ctx, 118, 428, 16);
  ctx.fillStyle = '#8b98a8';
  circle(ctx, 196, 376, 8); circle(ctx, 314, 425, 10);
  // rocket
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath(); ctx.moveTo(356, 210); ctx.quadraticCurveTo(388, 250, 388, 310); ctx.lineTo(356, 310); ctx.quadraticCurveTo(356, 250, 356, 210); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.moveTo(356, 210); ctx.quadraticCurveTo(372, 190, 388, 210); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#38bdf8'; circle(ctx, 372, 268, 12);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.moveTo(356, 300); ctx.lineTo(336, 330); ctx.lineTo(356, 322); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(388, 300); ctx.lineTo(408, 330); ctx.lineTo(388, 322); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f97316';
  ctx.beginPath(); ctx.moveTo(362, 330); ctx.lineTo(372, 360); ctx.lineTo(382, 330); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fde047';
  ctx.beginPath(); ctx.moveTo(366, 330); ctx.lineTo(372, 352); ctx.lineTo(378, 330); ctx.closePath(); ctx.fill();
  // flag (diff 2: red left, blue right)
  ctx.fillStyle = '#64748b'; ctx.fillRect(96, 330, 5, 90);
  ctx.fillStyle = R ? '#2563eb' : '#ef4444';
  ctx.beginPath(); ctx.moveTo(101, 330); ctx.lineTo(141, 340); ctx.lineTo(101, 350); ctx.closePath(); ctx.fill();
  // astronaut (diff 3: helmet lamp on left, off right)
  ctx.fillStyle = '#f8fafc';
  ellipse(ctx, 210, 400, 30, 38);
  circle(ctx, 210, 330, 26);
  ctx.fillStyle = '#bae6fd'; circle(ctx, 210, 330, 18);
  ctx.fillStyle = '#1f2937'; circle(ctx, 204, 328, 3); circle(ctx, 216, 328, 3);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(176, 384, 14, 34); ctx.fillRect(230, 384, 14, 34);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(196, 392, 28, 14);
  if (!R) {
    ctx.fillStyle = 'rgba(253, 224, 71, 0.55)';
    ctx.beginPath(); ctx.arc(210, 330, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fde047'; circle(ctx, 210, 306, 6);
  }
  // rover (diff 4: antenna present left, gone right)
  ctx.fillStyle = '#94a3b8'; rr(ctx, 300, 408, 92, 30, 8);
  ctx.fillStyle = '#475569'; circle(ctx, 322, 442, 12); circle(ctx, 372, 442, 12);
  ctx.fillStyle = '#e2e8f0'; circle(ctx, 322, 442, 5); circle(ctx, 372, 442, 5);
  ctx.fillStyle = '#38bdf8'; rr(ctx, 336, 388, 26, 20, 4);
  if (!R) {
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(392, 388); ctx.lineTo(392, 362); ctx.stroke();
    ctx.fillStyle = '#ef4444'; circle(ctx, 392, 358, 5);
  }
}

const MOON_DIFFS = [
  { x: 82, y: 82, r: 36, name: 'the planet in the sky' },
  { x: 121, y: 340, r: 24, name: 'the flag colour' },
  { x: 210, y: 330, r: 30, name: "the astronaut's helmet lamp" },
  { x: 392, y: 362, r: 22, name: "the rover's antenna" },
  { x: 118, y: 428, r: 22, name: 'the extra crater' },
  { x: 409, y: 84, r: 30, name: 'the satellite' },
  { x: 272, y: 84, r: 20, name: 'the fifth star' },
];

export const SCENES = [
  { id: 'cove', name: 'Lighthouse Cove', draw: drawCove, diffs: COVE_DIFFS },
  { id: 'garden', name: 'Cat Garden', draw: drawGarden, diffs: GARDEN_DIFFS },
  { id: 'moon', name: 'Moon Base', draw: drawMoon, diffs: MOON_DIFFS },
];
