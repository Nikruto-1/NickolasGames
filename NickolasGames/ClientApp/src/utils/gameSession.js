import { useEffect, useReducer, useState } from "react";

// All games persist the same versioned envelope. The game-specific validator
// owns its payload schema; older raw saves are read by each game's initializer.
export const GAME_SESSION_VERSION = 1;
export const gameSessionKey = (game, lang = "shared") =>
  `nickolasgames-session-${game}-${lang}`;

export function restoreGameSession(storage, game, lang, validate, migrations = {}) {
  try {
    const raw = storage.getItem(gameSessionKey(game, lang));
    if (!raw) return null;
    const envelope = JSON.parse(raw);
    if (!envelope || envelope.game !== game || envelope.lang !== lang ||
        !Number.isInteger(envelope.schemaVersion) || envelope.schemaVersion < 0 ||
        envelope.schemaVersion > GAME_SESSION_VERSION) return null;
    let version = envelope.schemaVersion;
    let state = envelope.state;
    while (version < GAME_SESSION_VERSION) {
      const migrate = migrations[version];
      if (typeof migrate !== "function") return null;
      state = migrate(state);
      version += 1;
    }
    return validate(state);
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
