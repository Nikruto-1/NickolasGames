const dicePips = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];

export function AliasDie({ value }) {
  return <span className="alias-die" data-value={value}>{dicePips[value].map(position => <i className="alias-die-pip" key={position} style={{ gridRow: Math.floor(position / 3) + 1, gridColumn: position % 3 + 1 }} />)}</span>;
}

import { useAliasGame } from "./useAliasGame.js";
