# Alias team mode

Implemented 2026-10-19. Existing site design and other games are unchanged.

- Two default teams, localized in all five languages (Ukrainian: Monsters and Penguins).
- At least two teams, at least two players per team; no application limit on team/player counts.
- Teams and rosters are editable before a game. New game retains rosters and resets scores/deck.
- Difficulty: easy, medium, hard or all. Card format: single words (default), phrases and idioms,
  or a mixture of both. The original phrase/action banks are available again without changing
  other games' dictionaries. The extra 220 curated words per language remain available.
  Category and difficulty apply to every format. Cards are unique across a whole game.
- Each team throws two six-sided dice. Highest total starts. Tied leaders reroll; eliminated
  teams do not reroll. Animation respects reduced-motion preferences. Interrupted rolls restore.
  Final dice faces and totals stay visible until Continue to game is pressed. The first team is
  explicitly announced. Older results of eliminated teams are labelled as previous rolls.
- Dice use large pip faces, depth shadows and a reduced-motion-aware throw. The total is visually
  primary; the equation remains available as text. Only one winner announcement is shown. The
  zero-score table stays hidden throughout the draw and returns when entering the first turn.
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
- Remaining-card counters are not displayed in setup or during a round.
- The expandable rules use four numbered sections, short bullet lists and 16px text with
  generous line spacing. They stack on phones and use two columns on wider screens, in all languages.
- Team editor headings show the actual names; a labelled pencil button opens inline editing.
  Save or Enter closes the field. The setup grid uses the full width, without a duplicate zero-score
  table, and settings use two columns on larger screens.
- Round summaries show exact guessed and missed/skipped cards, including the final card and its
  recipient or shared penalty. These lists persist across reloads and reset on the next round.
  Older saves without per-card outcomes retain scores and show an incomplete-history notice;
  missing historical outcomes cannot be reconstructed from aggregate counts.
- Round summaries emphasize the active team's signed net score. Timed correct/skipped counts
  exclude the final card, which is shown separately with its recipient or all-team penalty.
  The next-team action comes before the collapsible complete word lists. These lists include
  the final card as well, labelled with its recipient or all-team penalty. Scoring is unchanged.

State is saved under `nickolasgames-alias-teams-v1-${lang}` and validated on restore. An expired
saved deadline restores directly to the last-word phase. The legacy
`nickolasgames-progress-v1-${lang}-alias` key is not modified or deleted. Existing privacy
export/deletion includes the new key automatically. Local browser storage capacity still applies.
On upgrade, saved scores, used-card history, deadline and the current revealed word are retained.
Future cards are filtered by the chosen format and new matching cards are added without repeats.
Old saves without a format default to single words; a new game retains the selected format.
An exhausted game can continue with newly available words; a finished game stays finished.

Tests: 38 focused Alias cases plus 99 existing cases. Browser checks cover mobile/desktop,
all five languages, long names, team addition/removal, dice ties, swipe and button scoring,
refresh, deadline expiry, last-word stealing, rotation, victory and preservation of legacy data.

Focused visual regression check: build the client, then run `node scripts/check-alias-dice.cjs`
with Playwright available (or set `PLAYWRIGHT_MODULE` to its installed package). Chromium/Edge
and WebKit must be installed. Screenshots go to the system temp directory by default; `QA_OUTPUT`
overrides it. Checks cover all pip faces, totals, winner, scoreboard timing, five languages,
80-character names and 320/390/1440px widths. `QA_ORIGIN` can target the deployed site.
It also checks that the last card appears exactly once in the complete word lists, with the
correct recipient or shared penalty, for own-team guesses, steals and unanswered words after reload.
Rules checks verify translated sections, readable type size/line height, overflow and keyboard folding.
