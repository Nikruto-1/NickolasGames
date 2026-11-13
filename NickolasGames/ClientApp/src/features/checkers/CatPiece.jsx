export function CatPiece({side,king}) {
  return <span className={"ck-piece ck-"+side+(king?" ck-king":"")} aria-hidden="true">
    <svg viewBox="0 0 80 80" focusable="false" className="ck-cat-svg">
      <path className="ck-ear" d="M15 31 L17 9 Q19 6 24 12 L33 22 Q40 19 47 22 L57 10 Q63 5 64 13 L66 33" />
      <ellipse className="ck-face" cx="40" cy="42" rx="28" ry="25"/>
      <path className="ck-cheek" d="M22 50 Q40 68 58 50"/>
      <path className="ck-eye" d="M24 37 Q31 31 36 37 M44 37 Q50 31 57 37"/>
      <path className="ck-nose" d="M36 46 L44 46 L40 51 Z"/>
      <path className="ck-mouth" d="M40 51 Q35 58 32 53 M40 51 Q45 58 48 53"/>
      <path className="ck-whisker" d="M10 47 L28 49 M12 55 L27 53 M52 49 L71 47 M53 53 L70 55"/>
      {king && <g className="ck-crown"><path d="M24 24 L20 8 L32 15 L40 4 L49 15 L61 8 L56 24 Z"/><path d="M24 27 H56"/></g>}
    </svg>
  </span>;
}

