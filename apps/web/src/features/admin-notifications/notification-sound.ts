"use client";

// Two-note "ting-ting" chime, synthesized with the Web Audio API — no audio
// file to ship or license. Wrapped in try/catch throughout: browsers that
// block autoplay before any user gesture on the page (rare here, since an
// admin has to click to log in first) just skip the sound silently, never
// throw.

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number): void {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playNewOrderSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    const now = ctx.currentTime;
    playTone(ctx, 1046.5, now, 0.18); // C6
    playTone(ctx, 1318.5, now + 0.15, 0.22); // E6
  } catch {
    // Web Audio unsupported/blocked — never crash the notification flow over a sound effect.
  }
}
