type SoundType =
  | "like"
  | "unlike"
  | "add-to-cart"
  | "tab"
  | "menu-open"
  | "menu-close"
  | "button"
  | "remove"
  | "search";

function ctx(): AudioContext | null {
  try {
    return new AudioContext();
  } catch {
    return null;
  }
}

function play(fn: (ac: AudioContext) => void) {
  const ac = ctx();
  if (!ac) return;
  fn(ac);
}

/** Soft ascending chime — like / wishlist add */
export function playLike() {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ac.currentTime + 0.12);
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ac.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
    osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.35);
    osc.onended = () => ac.close();
  });
}

/** Soft descending tone — unlike / wishlist remove */
export function playUnlike() {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ac.currentTime + 0.15);
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.09, ac.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
    osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.25);
    osc.onended = () => ac.close();
  });
}

/** Warm two-note chord — add to cart */
export function playAddToCart() {
  play((ac) => {
    // Root note
    const osc1 = ac.createOscillator();
    const gain1 = ac.createGain();
    osc1.connect(gain1); gain1.connect(ac.destination);
    osc1.type = "sine";
    osc1.frequency.value = 523.25; // C5
    gain1.gain.setValueAtTime(0, ac.currentTime);
    gain1.gain.linearRampToValueAtTime(0.10, ac.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.40);
    osc1.start(ac.currentTime); osc1.stop(ac.currentTime + 0.40);

    // Fifth
    const osc2 = ac.createOscillator();
    const gain2 = ac.createGain();
    osc2.connect(gain2); gain2.connect(ac.destination);
    osc2.type = "sine";
    osc2.frequency.value = 783.99; // G5
    gain2.gain.setValueAtTime(0, ac.currentTime + 0.04);
    gain2.gain.linearRampToValueAtTime(0.07, ac.currentTime + 0.07);
    gain2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45);
    osc2.start(ac.currentTime + 0.04); osc2.stop(ac.currentTime + 0.45);

    osc2.onended = () => ac.close();
  });
}

/** Subtle soft tap — tab switch / selection */
export function playTab() {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.value = 700;
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.07, ac.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.12);
    osc.onended = () => ac.close();
  });
}

/** Very soft noise sweep — menu open */
export function playMenuOpen() {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, ac.currentTime);
    osc.frequency.linearRampToValueAtTime(520, ac.currentTime + 0.18);
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ac.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);
    osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.22);
    osc.onended = () => ac.close();
  });
}

/** Soft descending — menu close / panel close */
export function playMenuClose() {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ac.currentTime);
    osc.frequency.linearRampToValueAtTime(320, ac.currentTime + 0.14);
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ac.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
    osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.18);
    osc.onended = () => ac.close();
  });
}

/** Minimal click — generic button */
export function playButton() {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ac.currentTime + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.09);
    osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.09);
    osc.onended = () => ac.close();
  });
}

/** Tiny descending click — remove item */
export function playRemove() {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.10);
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.07, ac.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
    osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.15);
    osc.onended = () => ac.close();
  });
}

/** Soft three-note ascending arpeggio — payment / order confirmed */
export function playSuccess() {
  play((ac) => {
    const notes = [523.25, 659.25, 783.99]; // C5 → E5 → G5
    const delays = [0, 0.08, 0.16];
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ac.currentTime + delays[i];
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.start(t); osc.stop(t + 0.38);
      if (i === notes.length - 1) osc.onended = () => ac.close();
    });
  });
}

/** Soft airy tone — search focus */
export function playSearch() {
  play((ac) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ac.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.14);
    osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.14);
    osc.onended = () => ac.close();
  });
}
