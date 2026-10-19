import { CROCODILE_ES } from "../data/crocodile.es.js";
import { WHOAMI_ES } from "../data/whoami.es.js";

export const UI_COPY = {
  "heroTitle": "Juegos para momentos reales.",
  "heroText": "Juegos web sencillos para amigos, equipos y fiestas.",
  "start": "Empezar a jugar",
  "explore": "Explorar juegos",
  "flight": "Entra en el mundo del juego.",
  "gamesTitle": "Elige tu juego.",
  "gamesText": "Cinco formas de hacer que todos hablen, rían y se muevan.",
  "play": "Jugar",
  "previewTitle": "Pruébalo aquí mismo.",
  "previewText": "Revela una tarjeta, actúala y luego toma la siguiente.",
  "gameLabel": "Juego",
  "categoryLabel": "Categoría",
  "allCategories": "Todas las categorías",
  "difficultyLabel": "Dificultad",
  "difficulty": {
    "easy": "Fácil",
    "medium": "Media",
    "hard": "Difícil"
  },
  "random": "Aleatorio",
  "any": "Cualquiera",
  "players": "jugadores",
  "min": "min",
  "reset": "Reiniciar",
  "startTimer": "Iniciar temporizador",
  "timerDuration": "Duración",
  "sec": "s",
  "tap": "Toca para revelar",
  "noWords": "No hay palabras para esta selección. Cambia la categoría, la dificultad o añade palabras propias.",
  "reveal": "Revelar",
  "next": "Siguiente",
  "skip": "Saltar",
  "guessed": "Adivinadas",
  "skipped": "Saltadas",
  "howTitle": "Cómo funciona",
  "testimonialsTitle": "Jugado en todo el mundo.",
  "played": "Jugó",
  "finalTitle": "¿Listo para jugar?",
  "finalText": "Elige un juego, reúne a tu gente y empieza en segundos.",
  "footer": "© 2026 NickolasGames. Juegos para momentos reales.",
  "language": "Idioma",
  "steps": [
    [
      "Elige un juego",
      "Elige uno de los cinco juegos o deja que el sistema elija por ti."
    ],
    [
      "Configura jugadores y tiempo",
      "Decide cuántas personas juegan y cuánto dura cada ronda."
    ],
    [
      "Juega desde un móvil o una pantalla",
      "Pasa el dispositivo o compártelo en la TV. Nadie necesita instalar nada."
    ]
  ],
  "games": {
    "whoami": {
      "n": "¿Quién soy?",
      "d": "Adivina la persona, personaje u objeto de tu tarjeta.",
      "p": "2-10 jugadores",
      "t": "10 min",
      "c": WHOAMI_ES
    },
    "crocodile": {
      "n": "Cocodrilo",
      "d": "Usa solo gestos, expresiones faciales y movimientos del cuerpo: sin hablar ni utilizar objetos.",
      "p": "3-12 jugadores",
      "t": "15 min",
      "c": CROCODILE_ES
    },
    "alias": {
      "n": "Alias",
      "d": "Explica palabras rápido y suma puntos para tu equipo.",
      "p": "4+ jugadores",
      "t": "20 min",
      "c": {
        "Diario": {
          "easy": [
            "Desayuno",
            "Paraguas",
            "Fin de semana"
          ],
          "medium": [
            "Tráfico",
            "Pasaporte"
          ],
          "hard": []
        },
        "Viajes": {
          "easy": [
            "Aeropuerto",
            "Equipaje",
            "Billete"
          ],
          "medium": [
            "Frontera"
          ],
          "hard": [
            "Puerto"
          ]
        },
        "Trabajo": {
          "easy": [
            "Reunión"
          ],
          "medium": [
            "Fecha límite",
            "Presupuesto"
          ],
          "hard": [
            "Comentarios",
            "Lanzamiento"
          ]
        }
      }
    },
    "truth": {
      "n": "Verdad o reto",
      "d": "Retos modernos y limpios para amigos y fiestas.",
      "p": "3-10 jugadores",
      "t": "20 min",
      "c": {
        "Verdad": {
          "easy": [
            "¿Qué habilidad te gustaría tener?"
          ],
          "medium": [
            "¿Qué mensaje releíste más esta semana?"
          ],
          "hard": [
            "¿Cuál es tu talento más inútil?"
          ]
        },
        "Reto": {
          "easy": [
            "Cambia de asiento con la persona de tu izquierda."
          ],
          "medium": [
            "Haz tu mejor voz de tráiler de película."
          ],
          "hard": [
            "Habla solo con preguntas durante dos minutos."
          ]
        }
      }
    },
    "random": {
      "n": "Juego aleatorio",
      "d": "Deja que el sistema elija qué jugar después.",
      "p": "2-12 jugadores",
      "t": "Cualquiera",
      "c": null
    }
  },
  "testimonials": [
    [
      "Sofia",
      "Suecia",
      "Usamos ¿Quién soy? durante una noche de equipo. Fue simple, rápido y muy divertido.",
      "¿Quién soy?"
    ],
    [
      "Dmytro",
      "Ucrania",
      "Cocodrilo funcionó perfecto desde un solo teléfono en una fiesta en casa.",
      "Cocodrilo"
    ],
    [
      "Lena",
      "Alemania",
      "Alias se convirtió en nuestro rompehielos rápido antes de reuniones.",
      "Alias"
    ],
    [
      "Marta",
      "Polonia",
      "Verdad o reto se sintió moderno y nada incómodo.",
      "Verdad o reto"
    ]
  ]
};

export const PLAYER_COPY = {
  "title": "Repartir tarjetas a jugadores",
  "text": "Escribe nombres, pulsa aleatorio y cada jugador recibe una tarjeta oculta. No muestres la tarjeta delante de su dueño.",
  "label": "Nombres de jugadores",
  "placeholder": "Nickolas\nSofia\nDmytro",
  "customLabel": "Palabras propias",
  "customPlaceholder": "Futbolista\nProfesor\nMinecraft",
  "customHint": "Una palabra por línea o separadas por comas.",
  "onlyCustom": "Usar solo palabras propias",
  "assign": "Tarjetas aleatorias",
  "hideAll": "Ocultar todo",
  "show": "Mostrar palabra",
  "hide": "Ocultar palabra",
  "forPlayer": "Tarjeta para",
  "hidden": "Oculta para el jugador",
  "empty": "Añade al menos un nombre.",
  "notEnough": "Hay menos tarjetas únicas que jugadores. Añade más palabras o elimina algunos jugadores.",
  "guessed": "Adivinó",
  "guessedWord": "Palabra adivinada",
  "giveUp": "Me rindo",
  "gaveUpWord": "La palabra era",
  "noNewWord": "No hay una palabra única nueva para este jugador.",
  "manualLabel": "Nueva palabra para este jugador",
  "manualPlaceholder": "Escribe una palabra",
  "manualAssign": "Dar palabra",
  "manualDuplicate": "Esta palabra ya está activa o ya fue usada por este jugador."
};
