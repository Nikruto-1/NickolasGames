import { CROCODILE_EN } from "../data/crocodile.en";
import { WHOAMI_EN } from "../data/whoami.en";

export const UI_COPY = {
  "heroTitle": "Games for real moments.",
  "heroText": "Simple web games for friends, teams and parties.",
  "start": "Start playing",
  "explore": "Explore games",
  "flight": "Step into the game world.",
  "gamesTitle": "Pick your game.",
  "gamesText": "Five ways to get a room talking, laughing and moving.",
  "play": "Play",
  "previewTitle": "Try it right here.",
  "previewText": "Reveal a card, act it out, then draw the next one.",
  "gameLabel": "Game",
  "categoryLabel": "Category",
  "allCategories": "All categories",
  "difficultyLabel": "Difficulty",
  "difficulty": {
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard"
  },
  "random": "Random",
  "any": "Any",
  "players": "players",
  "min": "min",
  "reset": "Reset",
  "startTimer": "Start timer",
  "timerDuration": "Round time",
  "sec": "s",
  "tap": "Tap to reveal",
  "noWords": "No words are available for this choice. Change the category, difficulty, or add custom words.",
  "reveal": "Reveal",
  "next": "Next",
  "skip": "Skip",
  "guessed": "Guessed",
  "skipped": "Skipped",
  "howTitle": "How it works",
  "testimonialsTitle": "Played around the world.",
  "played": "Played",
  "finalTitle": "Ready to play?",
  "finalText": "Pick a game, gather your people and start in seconds.",
  "footer": "© 2026 NickolasGames. Games for real moments.",
  "language": "Language",
  "steps": [
    [
      "Choose a game",
      "Pick one of five games, or let the system choose for you."
    ],
    [
      "Set players and time",
      "Decide how many people are playing and how long each round lasts."
    ],
    [
      "Play from one phone or screen",
      "Pass the device around or cast it to a TV. Nobody needs to install anything."
    ]
  ],
  "games": {
    "whoami": {
      "n": "Who Am I?",
      "d": "Guess the person, character or object on your card.",
      "p": "2-10 players",
      "t": "10 min",
      "c": WHOAMI_EN
    },
    "crocodile": {
      "n": "Crocodile",
      "d": "Use only gestures, facial expressions and body movements — no speaking or props.",
      "p": "3-12 players",
      "t": "15 min",
      "c": CROCODILE_EN
    },
    "alias": {
      "n": "Alias",
      "d": "Explain words fast and score points with your team.",
      "p": "4-12 players",
      "t": "20 min",
      "c": {
        "Everyday": {
          "easy": [
            "Breakfast",
            "Umbrella",
            "Weekend"
          ],
          "medium": [
            "Traffic",
            "Passport"
          ],
          "hard": []
        },
        "Travel": {
          "easy": [
            "Airport",
            "Luggage",
            "Ticket"
          ],
          "medium": [
            "Border"
          ],
          "hard": [
            "Harbour"
          ]
        },
        "Work": {
          "easy": [
            "Meeting"
          ],
          "medium": [
            "Deadline",
            "Budget"
          ],
          "hard": [
            "Feedback",
            "Launch"
          ]
        }
      }
    },
    "truth": {
      "n": "Truth or Dare",
      "d": "Clean, modern prompts for friends and parties.",
      "p": "3-10 players",
      "t": "20 min",
      "c": {
        "Truth": {
          "easy": [
            "What skill do you wish you had?"
          ],
          "medium": [
            "Which message did you reread most this week?"
          ],
          "hard": [
            "What is your most useless talent?"
          ]
        },
        "Dare": {
          "easy": [
            "Swap seats with the person on your left."
          ],
          "medium": [
            "Do your best movie-trailer voice."
          ],
          "hard": [
            "Speak only in questions for two minutes."
          ]
        }
      }
    },
    "random": {
      "n": "Random Game",
      "d": "Let the system pick what to play next.",
      "p": "2-12 players",
      "t": "Any",
      "c": null
    }
  },
  "testimonials": [
    [
      "Sofia",
      "Sweden",
      "We used Who Am I? during a team evening. It was simple, fast and genuinely fun.",
      "Who Am I?"
    ],
    [
      "Dmytro",
      "Ukraine",
      "Crocodile worked perfectly from one phone at a house party.",
      "Crocodile"
    ],
    [
      "Lena",
      "Germany",
      "Alias became our quick icebreaker before meetings.",
      "Alias"
    ],
    [
      "Marta",
      "Poland",
      "Truth or Dare felt clean and modern, not awkward.",
      "Truth or Dare"
    ]
  ]
};

export const PLAYER_COPY = {
  "title": "Deal cards to players",
  "text": "Enter names, press random, and every player gets a hidden card. Do not reveal a card in front of its owner.",
  "label": "Player names",
  "placeholder": "Nickolas\nSofia\nDmytro",
  "customLabel": "Custom card words",
  "customPlaceholder": "Footballer\nTeacher\nMinecraft",
  "customHint": "One word per line or separated by commas.",
  "onlyCustom": "Use only custom words",
  "assign": "Random cards",
  "hideAll": "Hide all",
  "show": "Show word",
  "hide": "Hide word",
  "forPlayer": "Card for",
  "hidden": "Hidden from player",
  "empty": "Add at least one name.",
  "notEnough": "There are fewer unique cards than players. Add more words or remove some players.",
  "guessed": "Guessed",
  "guessedWord": "Guessed word",
  "giveUp": "Give up",
  "gaveUpWord": "The word was",
  "noNewWord": "There is no new unique word for this player.",
  "manualLabel": "New word for this player",
  "manualPlaceholder": "Enter a word",
  "manualAssign": "Give word",
  "manualDuplicate": "This word is already active or was already used by this player."
};
