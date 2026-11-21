// Twin Spots — tiny WebAudio bleeps. No audio files, everything is synthesised,
// so the game stays fully offline. All calls are safe before any user gesture.

let ctx = null;
let muted = false;

export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }

function ac() {
  if (muted) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, at, dur, type = 'sine', vol = 0.16) {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, c.currentTime + at);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + at + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + at); o.stop(c.currentTime + at + dur + 0.05);
}

export const sfx = {
  click() { tone(520, 0, 0.06, 'triangle', 0.08); },
  correct() { tone(660, 0, 0.12); tone(880, 0.09, 0.18); },
  wrong() { tone(160, 0, 0.18, 'sawtooth', 0.1); },
  hint() { tone(440, 0, 0.1, 'sine', 0.1); tone(554, 0.08, 0.12, 'sine', 0.1); },
  level() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.16)); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.22)); },
};
