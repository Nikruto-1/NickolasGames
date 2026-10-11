import { CROCODILE_SV } from "../data/crocodile.sv";
import { WHOAMI_SV } from "../data/whoami.sv";

export const UI_COPY = {
  "heroTitle": "Spel för riktiga stunder.",
  "heroText": "Enkla webbspel för vänner, team och fester.",
  "start": "Börja spela",
  "explore": "Utforska spel",
  "flight": "Kliv in i spelvärlden.",
  "gamesTitle": "Välj ditt spel.",
  "gamesText": "Fem sätt att få rummet att prata, skratta och röra på sig.",
  "play": "Spela",
  "previewTitle": "Prova direkt här.",
  "previewText": "Vänd ett kort, spela ut det och dra sedan nästa.",
  "gameLabel": "Spel",
  "categoryLabel": "Kategori",
  "allCategories": "Alla kategorier",
  "difficultyLabel": "Svårighet",
  "difficulty": {
    "easy": "Lätt",
    "medium": "Medel",
    "hard": "Svår"
  },
  "random": "Slump",
  "any": "När som helst",
  "players": "spelare",
  "min": "min",
  "reset": "Återställ",
  "startTimer": "Starta timer",
  "timerDuration": "Rundtid",
  "sec": "s",
  "tap": "Tryck för att visa",
  "noWords": "Det finns inga ord för det här valet. Byt kategori, svårighet eller lägg till egna ord.",
  "reveal": "Visa",
  "next": "Nästa",
  "skip": "Hoppa över",
  "guessed": "Gissade",
  "skipped": "Hoppade över",
  "howTitle": "Så fungerar det",
  "testimonialsTitle": "Spelas runt om i världen.",
  "played": "Spelade",
  "finalTitle": "Redo att spela?",
  "finalText": "Välj ett spel, samla dina människor och börja på några sekunder.",
  "footer": "© 2026 NickolasGames. Spel för riktiga stunder.",
  "language": "Språk",
  "steps": [
    [
      "Välj ett spel",
      "Välj ett av fem spel eller låt systemet välja åt dig."
    ],
    [
      "Ställ in spelare och tid",
      "Bestäm hur många som spelar och hur länge varje runda varar."
    ],
    [
      "Spela från en telefon eller skärm",
      "Skicka runt enheten eller casta till en TV. Ingen behöver installera något."
    ]
  ],
  "games": {
    "whoami": {
      "n": "Vem är jag?",
      "d": "Gissa personen, karaktären eller saken på ditt kort.",
      "p": "2-10 spelare",
      "t": "10 min",
      "c": WHOAMI_SV
    },
    "crocodile": {
      "n": "Krokodil",
      "d": "Använd bara gester, mimik och kroppsrörelser — inget prat eller rekvisita.",
      "p": "3-12 spelare",
      "t": "15 min",
      "c": CROCODILE_SV
    },
    "alias": {
      "n": "Alias",
      "d": "Förklara ord snabbt och samla poäng till laget.",
      "p": "4-12 spelare",
      "t": "20 min",
      "c": {
        "Vardag": {
          "easy": [
            "Frukost",
            "Paraply",
            "Helg"
          ],
          "medium": [
            "Trafik",
            "Pass"
          ],
          "hard": []
        },
        "Resor": {
          "easy": [
            "Flygplats",
            "Bagage",
            "Biljett"
          ],
          "medium": [
            "Gräns"
          ],
          "hard": [
            "Hamn"
          ]
        },
        "Arbete": {
          "easy": [
            "Möte"
          ],
          "medium": [
            "Deadline",
            "Budget"
          ],
          "hard": [
            "Feedback",
            "Lansering"
          ]
        }
      }
    },
    "truth": {
      "n": "Sanning eller konsekvens",
      "d": "Fräscha moderna frågor och uppdrag för vänner och fester.",
      "p": "3-10 spelare",
      "t": "20 min",
      "c": {
        "Sanning": {
          "easy": [
            "Vilken färdighet önskar du att du hade?"
          ],
          "medium": [
            "Vilket meddelande läste du om flest gånger den här veckan?"
          ],
          "hard": [
            "Vilken är din mest onödiga talang?"
          ]
        },
        "Konsekvens": {
          "easy": [
            "Byt plats med personen till vänster."
          ],
          "medium": [
            "Gör din bästa filmtrailerröst."
          ],
          "hard": [
            "Prata bara i frågor i två minuter."
          ]
        }
      }
    },
    "random": {
      "n": "Slumpspel",
      "d": "Låt systemet välja vad ni ska spela härnäst.",
      "p": "2-12 spelare",
      "t": "När som helst",
      "c": null
    }
  },
  "testimonials": [
    [
      "Sofia",
      "Sverige",
      "Vi använde Vem är jag? på en teamkväll. Det var enkelt, snabbt och riktigt kul.",
      "Vem är jag?"
    ],
    [
      "Dmytro",
      "Ukraina",
      "Krokodil fungerade perfekt från en telefon på en hemmafest.",
      "Krokodil"
    ],
    [
      "Lena",
      "Tyskland",
      "Alias blev vår snabba isbrytare före möten.",
      "Alias"
    ],
    [
      "Marta",
      "Polen",
      "Sanning eller konsekvens kändes rent och modernt, inte pinsamt.",
      "Sanning eller konsekvens"
    ]
  ]
};

export const PLAYER_COPY = {
  "title": "Dela ut kort till spelare",
  "text": "Skriv namn, tryck på slump, så får varje spelare ett dolt kort. Visa inte kortet för den som äger det.",
  "label": "Spelarnamn",
  "placeholder": "Nickolas\nSofia\nDmytro",
  "customLabel": "Egna kortord",
  "customPlaceholder": "Fotbollsspelare\nLärare\nMinecraft",
  "customHint": "Ett ord per rad eller separerat med kommatecken.",
  "onlyCustom": "Använd bara egna ord",
  "assign": "Slumpa kort",
  "hideAll": "Dölj alla",
  "show": "Visa ord",
  "hide": "Dölj ord",
  "forPlayer": "Kort för",
  "hidden": "Dolt för spelaren",
  "empty": "Lägg till minst ett namn.",
  "notEnough": "Det finns färre unika kort än spelare. Lägg till fler ord eller ta bort några spelare.",
  "guessed": "Gissade",
  "guessedWord": "Gissat ord",
  "giveUp": "Ger upp",
  "gaveUpWord": "Ordet var",
  "noNewWord": "Det finns inget nytt unikt ord för den här spelaren.",
  "manualLabel": "Nytt ord för den här spelaren",
  "manualPlaceholder": "Skriv ett ord",
  "manualAssign": "Ge ord",
  "manualDuplicate": "Det ordet är redan aktivt eller har redan använts av spelaren."
};
