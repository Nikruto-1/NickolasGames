// Presentation-only timer. The game hook owns all countdown state and effects.
export function WhoAmITimer({ remaining, duration, running, copy, t, onToggle, onReset }) {
  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, '0');
  const progress = duration > 0 ? Math.max(0, Math.min(1, remaining / duration)) : 0;

  return (
    <div className="timer whoami-timer" role="group" aria-label={copy.timer}>
      <b className="whoami-time-readout" role="timer" aria-live="off">{minutes}:{seconds}</b>
      <div className="tbar" role="progressbar" aria-label={copy.timer}
        aria-valuemin={0} aria-valuemax={duration} aria-valuenow={remaining}>
        <i style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className="whoami-timer-actions">
        <button type="button" className="btn sm" disabled={remaining === 0} onClick={onToggle}>
          {running ? copy.pause : t.startTimer}
        </button>
        <button type="button" className="btn sm" onClick={onReset}>{t.reset}</button>
      </div>
    </div>
  );
}
