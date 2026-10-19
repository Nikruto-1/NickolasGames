import { CROCODILE_DE } from "../data/crocodile.de.js";
import { WHOAMI_DE } from "../data/whoami.de.js";

export const UI_COPY = {
  "heroTitle": "Spiele für echte Momente.",
  "heroText": "Einfache Webspiele für Freunde, Teams und Partys.",
  "start": "Jetzt spielen",
  "explore": "Spiele ansehen",
  "flight": "Tritt in die Spielwelt ein.",
  "gamesTitle": "Wähle dein Spiel.",
  "gamesText": "Fünf Wege, einen Raum zum Reden, Lachen und Mitmachen zu bringen.",
  "play": "Spielen",
  "previewTitle": "Probiere es direkt hier.",
  "previewText": "Decke eine Karte auf, stelle sie dar und ziehe dann die nächste.",
  "gameLabel": "Spiel",
  "categoryLabel": "Kategorie",
  "allCategories": "Alle Kategorien",
  "difficultyLabel": "Schwierigkeit",
  "difficulty": {
    "easy": "Leicht",
    "medium": "Mittel",
    "hard": "Schwer"
  },
  "random": "Zufall",
  "any": "Jederzeit",
  "players": "Spieler",
  "min": "Min",
  "reset": "Zurücksetzen",
  "startTimer": "Timer starten",
  "timerDuration": "Rundenzeit",
  "sec": "s",
  "tap": "Tippen zum Aufdecken",
  "noWords": "Für diese Auswahl gibt es keine Wörter. Ändere Kategorie, Schwierigkeit oder füge eigene Wörter hinzu.",
  "reveal": "Aufdecken",
  "next": "Weiter",
  "skip": "Überspringen",
  "guessed": "Erraten",
  "skipped": "Übersprungen",
  "howTitle": "So funktioniert es",
  "testimonialsTitle": "Weltweit gespielt.",
  "played": "Spielte",
  "finalTitle": "Bereit zu spielen?",
  "finalText": "Wähle ein Spiel, sammle deine Leute und starte in Sekunden.",
  "footer": "© 2026 NickolasGames. Spiele für echte Momente.",
  "language": "Sprache",
  "steps": [
    [
      "Spiel wählen",
      "Wähle eines von fünf Spielen oder lass das System entscheiden."
    ],
    [
      "Spieler und Zeit festlegen",
      "Entscheide, wie viele Personen mitspielen und wie lange jede Runde dauert."
    ],
    [
      "Von einem Handy oder Bildschirm spielen",
      "Gib das Gerät weiter oder streame es auf den Fernseher. Niemand muss etwas installieren."
    ]
  ],
  "games": {
    "whoami": {
      "n": "Wer bin ich?",
      "d": "Errate die Person, Figur oder Sache auf deiner Karte.",
      "p": "2-10 Spieler",
      "t": "10 Min",
      "c": WHOAMI_DE
    },
    "crocodile": {
      "n": "Krokodil",
      "d": "Nur Gestik, Mimik und Körperbewegungen — ohne Sprechen oder Requisiten.",
      "p": "3-12 Spieler",
      "t": "15 Min",
      "c": CROCODILE_DE
    },
    "alias": {
      "n": "Alias",
      "d": "Erkläre Wörter schnell und sammle Punkte für dein Team.",
      "p": "4+ Spieler",
      "t": "20 Min",
      "c": {
        "Alltag": {
          "easy": [
            "Frühstück",
            "Regenschirm",
            "Wochenende"
          ],
          "medium": [
            "Verkehr",
            "Pass"
          ],
          "hard": []
        },
        "Reisen": {
          "easy": [
            "Flughafen",
            "Gepäck",
            "Ticket"
          ],
          "medium": [
            "Grenze"
          ],
          "hard": [
            "Hafen"
          ]
        },
        "Arbeit": {
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
      "n": "Wahrheit oder Pflicht",
      "d": "Saubere moderne Aufgaben für Freunde und Partys.",
      "p": "3-10 Spieler",
      "t": "20 Min",
      "c": {
        "Wahrheit": {
          "easy": [
            "Welche Fähigkeit hättest du gern?"
          ],
          "medium": [
            "Welche Nachricht hast du diese Woche am häufigsten gelesen?"
          ],
          "hard": [
            "Was ist dein nutzlosestes Talent?"
          ]
        },
        "Pflicht": {
          "easy": [
            "Tausche den Platz mit der Person links von dir."
          ],
          "medium": [
            "Mach deine beste Filmtrailer-Stimme."
          ],
          "hard": [
            "Sprich zwei Minuten lang nur in Fragen."
          ]
        }
      }
    },
    "random": {
      "n": "Zufallsspiel",
      "d": "Lass das System wählen, was als Nächstes gespielt wird.",
      "p": "2-12 Spieler",
      "t": "Jederzeit",
      "c": null
    }
  },
  "testimonials": [
    [
      "Sofia",
      "Schweden",
      "Wir haben Wer bin ich? bei einem Teamabend genutzt. Es war einfach, schnell und wirklich lustig.",
      "Wer bin ich?"
    ],
    [
      "Dmytro",
      "Ukraine",
      "Krokodil funktionierte perfekt von einem Handy auf einer Hausparty.",
      "Krokodil"
    ],
    [
      "Lena",
      "Deutschland",
      "Alias wurde unser schneller Eisbrecher vor Meetings.",
      "Alias"
    ],
    [
      "Marta",
      "Polen",
      "Wahrheit oder Pflicht wirkte modern und gar nicht unangenehm.",
      "Wahrheit oder Pflicht"
    ]
  ]
};

export const PLAYER_COPY = {
  "title": "Karten an Spieler verteilen",
  "text": "Gib Namen ein, drücke Zufall, und jeder bekommt eine verdeckte Karte. Zeige die Karte nicht vor der eigenen Person.",
  "label": "Spielernamen",
  "placeholder": "Nickolas\nSofia\nDmytro",
  "customLabel": "Eigene Kartenwörter",
  "customPlaceholder": "Fußballer\nLehrer\nMinecraft",
  "customHint": "Ein Wort pro Zeile oder durch Kommas getrennt.",
  "onlyCustom": "Nur eigene Wörter verwenden",
  "assign": "Zufällige Karten",
  "hideAll": "Alle verbergen",
  "show": "Wort zeigen",
  "hide": "Wort verbergen",
  "forPlayer": "Karte für",
  "hidden": "Vor dem Spieler verborgen",
  "empty": "Füge mindestens einen Namen hinzu.",
  "notEnough": "Es gibt weniger einzigartige Karten als Spieler. Füge mehr Wörter hinzu oder entferne einige Spieler.",
  "guessed": "Erraten",
  "guessedWord": "Erratenes Wort",
  "giveUp": "Ich gebe auf",
  "gaveUpWord": "Das Wort war",
  "noNewWord": "Es gibt kein neues einzigartiges Wort für diesen Spieler.",
  "manualLabel": "Neues Wort für diesen Spieler",
  "manualPlaceholder": "Wort eingeben",
  "manualAssign": "Wort geben",
  "manualDuplicate": "Dieses Wort ist bereits aktiv oder wurde von diesem Spieler schon verwendet."
};
