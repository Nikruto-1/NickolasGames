import { useEffect, useReducer, useState } from "react";

// All games persist the same versioned envelope. The game-specific validator
// owns its payload schema; older raw saves are read by each game's initializer.
export const GAME_SESSION_VERSION = 1;
export const gameSessionKey = (game, lang = "shared") =>
  `nickolasgames-session-v${GAME_SESSION_VERSION}-${game}-${lang}`;

export function restoreGameSession(storage, game, lang, validate) {
  try {
    const raw = storage.getItem(gameSessionKey(game, lang));
    if (!raw) return null;
    const envelope = JSON.parse(raw);
    if (!envelope || envelope.schemaVersion !== GAME_SESSION_VERSION ||
        envelope.game !== game || envelope.lang !== lang) return null;
    return validate(envelope.state);
  } catch { return null; }
}

export function persistGameSession(storage, game, lang, state) {
  try {
    storage.setItem(gameSessionKey(game, lang),
      JSON.stringify({ schemaVersion: GAME_SESSION_VERSION, game, lang, state }));
    return true;
  } catch { return false; }
}

export function useVersionedReducer({ game, lang, reducer, validate, initialize }) {
  const [state, dispatch] = useReducer(reducer, null,
    () => restoreGameSession(localStorage, game, lang, validate) ?? initialize());
  const [storageOk, setStorageOk] = useState(true);
  useEffect(() => {
    setStorageOk(persistGameSession(localStorage, game, lang, state));
  }, [game, lang, state]);
  return [state, dispatch, storageOk];
}

export function useVersionedState({ game, lang = "shared", restore, initialize }) {
  const [state, setState] = useState(() =>
    restoreGameSession(localStorage, game, lang, restore) ?? initialize());
  const [storageOk, setStorageOk] = useState(true);
  useEffect(() => {
    setStorageOk(persistGameSession(localStorage, game, lang, state));
  }, [game, lang, state]);
  return [state, setState, storageOk];
}
