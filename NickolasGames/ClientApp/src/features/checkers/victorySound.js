// Short original victory fanfare synthesized in the browser.
// Called synchronously from the user's winning move to respect autoplay policy.
export function playCheckersVictory() {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  let context;
  try {
    context = new AudioContextClass();
    if (context.state === "suspended") void context.resume().catch(() => {});
    const start = context.currentTime + 0.015;
    const notes = [
      { hz: 523.25, at: 0, dur: 0.14 },
      { hz: 659.25, at: 0.13, dur: 0.15 },
      { hz: 783.99, at: 0.27, dur: 0.16 },
      { hz: 1046.50, at: 0.42, dur: 0.45 },
      { hz: 783.99, at: 0.42, dur: 0.42 }
    ];
    for (const { hz, at, dur } of notes) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(hz, start + at);
      gain.gain.setValueAtTime(0.0001, start + at);
      gain.gain.exponentialRampToValueAtTime(0.12, start + at + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + at + dur);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start + at);
      oscillator.stop(start + at + dur + 0.01);
    }
    window.setTimeout(() => { void context.close().catch(() => {}); }, 1800);
  } catch {
    if (context) void context.close().catch(() => {});
  }
}
