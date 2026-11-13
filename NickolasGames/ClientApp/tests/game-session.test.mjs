import test from "node:test";
import assert from "node:assert/strict";
import {
  GAME_SESSION_VERSION, gameSessionKey, restoreGameSession, persistGameSession
} from "../src/utils/gameSession.js";
import { newAliasState, validAliasState } from "../src/features/alias/gameLogic.js";
import { newCharadesState, validCharadesState } from "../src/features/charades/gameLogic.js";
import { initialWhoami, validWhoami } from "../src/features/whoami/gameLogic.js";
import { createTruthDareSession, restoreTruthDareSession } from "../src/features/truth-or-dare/session.js";

const memoryStorage = () => {
  const map = new Map();
  return {
    getItem: key => map.get(key) ?? null,
    setItem: (key,value) => map.set(key, value),
    removeItem: key => map.delete(key)
  };
};

test("all four game states survive identical versioned persistence format", () => {
  const items = [
    ["alias", newAliasState(["Team 1","Team 2"]), value => validAliasState(value) ? value : null],
    ["charades", newCharadesState({animals:{easy:["cat"],medium:["fox"],hard:["tiger"]}}), value => validCharadesState(value) ? value : null],
    ["whoami", initialWhoami(), value => validWhoami(value) ? value : null],
    ["truth-or-dare", createTruthDareSession(), restoreTruthDareSession]
  ];
  const storage=memoryStorage();
  for(const [game,state,validate] of items) {
    const lang = game === "truth-or-dare" ? "shared" : "uk";
    assert.equal(persistGameSession(storage,game,lang,state),true,game);
    const raw=JSON.parse(storage.getItem(gameSessionKey(game,lang)));
    assert.equal(raw.schemaVersion,GAME_SESSION_VERSION);
    assert.equal(raw.game,game);
    assert.equal(raw.lang,lang);
    assert.deepEqual(restoreGameSession(storage,game,lang,validate),state,game);
  }
});

test("language-specific sessions do not overwrite other languages", () => {
  const db=memoryStorage();
  const uk=newAliasState(["Україна","Друзі"]);
  const sv=newAliasState(["Sverige","Vänner"]);
  persistGameSession(db,"alias","uk",uk);
  persistGameSession(db,"alias","sv",sv);
  assert.deepEqual(restoreGameSession(db,"alias","uk",v=>v),uk);
  assert.deepEqual(restoreGameSession(db,"alias","sv",v=>v),sv);
  assert.equal(restoreGameSession(db,"alias","de",v=>v),null);
});

test("missing, unsupported, malformed and foreign sessions fail safely", () => {
  const db=memoryStorage(),game="whoami",lang="uk",key=gameSessionKey(game,lang);
  assert.equal(restoreGameSession(db,game,lang,v=>v),null);
  for(const invalid of ["not-json","null","{}",JSON.stringify({schemaVersion:99,game,lang,state:{}}),
    JSON.stringify({schemaVersion:1,game:"alias",lang,state:{}}),
    JSON.stringify({schemaVersion:1,game,lang:"sv",state:{}})]) {
    db.setItem(key,invalid);
    assert.equal(restoreGameSession(db,game,lang,v=>v),null);
  }
  db.setItem(key,JSON.stringify({schemaVersion:1,game,lang,state:{not:"valid"}}));
  assert.equal(restoreGameSession(db,game,lang,v=>validWhoami(v)?v:null),null);
  const denied={getItem(){throw Error("blocked")},setItem(){throw Error("quota")}};
  assert.equal(restoreGameSession(denied,game,lang,v=>v),null);
  assert.equal(persistGameSession(denied,game,lang,{}),false);
});

test("explicit schema migration upgrades older version before validation", () => {
  const db=memoryStorage(),game="alias",lang="en";
  const state=newAliasState(["Blue","Red"]);
  db.setItem(gameSessionKey(game,lang), JSON.stringify({
    schemaVersion:0,game,lang,state:{legacyState:state}
  }));
  assert.equal(restoreGameSession(db,game,lang,v=>validAliasState(v)?v:null),null);
  const restored=restoreGameSession(db,game,lang,v=>validAliasState(v)?v:null,
    {0:old=>old.legacyState});
  assert.deepEqual(restored,state);
});
