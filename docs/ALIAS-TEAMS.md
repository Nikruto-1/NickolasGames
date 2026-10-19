# Alias team mode

Implemented 2026-10-19. Existing site design and other games are unchanged.

- Two default teams, localized in all five languages (Ukrainian: Monsters and Penguins).
- At least two teams, at least two players per team; no application limit on team/player counts.
- Teams and rosters are editable before a game. New game retains rosters and resets scores/deck.
- Difficulty: easy, medium, hard or all. The pool combines single-word entries from the original
  banks with 220 curated words per language. Sentences and multiword actions are excluded from
  Alias only, without modifying other games' dictionaries. Words are unique across a whole game.
- Each team throws two six-sided dice. Highest total starts. Tied leaders reroll; eliminated
  teams do not reroll. Animation respects reduced-motion preferences. Interrupted rolls restore.
- Each team has a separate Start button before its turn. Starting reveals one word and begins
  an absolute 60-second deadline. No per-round word-count limit. Right/correct gives +1;
  left/skip gives -1. Negative team scores are allowed. Buttons supplement pointer swipes.
- At the deadline the current word stays visible. Select any team to award its +1, including
  a different team. If nobody guesses, every team loses 1 point, once. Ordinary timed skips still
  deduct only from the active team. Last-word credit is single-use.
- After that word the round ends. If the highest score meets the target, the highest-scoring
  team wins (joint winners if tied); otherwise the next team plays. Explainers rotate within teams.
- Default victory target is 60, configurable as a positive safe whole number before starting.
- Exhausted word pools display an explicit message instead of silently repeating words.

State is saved under `nickolasgames-alias-teams-v1-${lang}` and validated on restore. An expired
saved deadline restores directly to the last-word phase. The legacy
`nickolasgames-progress-v1-${lang}-alias` key is not modified or deleted. Existing privacy
export/deletion includes the new key automatically. Local browser storage capacity still applies.
On upgrade, saved scores, used-card history, deadline and the current revealed word are retained.
Future sentence cards are removed and new single words are added without repeating used words.
An exhausted game can continue with newly available words; a finished game stays finished.

Tests: 25 focused Alias cases plus 99 existing cases. Browser checks cover mobile/desktop,
all five languages, long names, team addition/removal, dice ties, swipe and button scoring,
refresh, deadline expiry, last-word stealing, rotation, victory and preservation of legacy data.
