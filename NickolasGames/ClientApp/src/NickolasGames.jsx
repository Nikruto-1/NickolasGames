import { useEffect, useMemo, useRef, useState } from "react";
import { CloudShader } from "@/components/ui/cloud-shader";
import "./nickolasgames.css";

const LANGS = [
  { code: "uk", short: "UA", label: "Українська" },
  { code: "en", short: "EN", label: "English" },
  { code: "sv", short: "SV", label: "Svenska" },
  { code: "de", short: "DE", label: "Deutsch" },
  { code: "es", short: "ES", label: "Español" },
];

const COPY = {
  uk: {
    heroTitle: "Ігри для справжніх моментів.",
    heroText: "Прості вебігри для друзів, команд і вечірок.",
    start: "Почати гру",
    explore: "Переглянути ігри",
    flight: "Увійди у світ гри.",
    gamesTitle: "Обери гру.",
    gamesText: "П'ять способів розговорити кімнату, розсмішити всіх і додати руху.",
    play: "Грати",
    previewTitle: "Спробуй прямо тут.",
    previewText: "Відкрий картку, пояснюй або показуй, а потім бери наступну.",
    gameLabel: "Гра",
    categoryLabel: "Категорія",
    random: "Випадкова",
    any: "Будь-коли",
    players: "гравців",
    min: "хв",
    reset: "Скинути",
    startTimer: "Запустити таймер",
    tap: "Натисни, щоб відкрити",
    reveal: "Відкрити",
    next: "Далі",
    skip: "Пропустити",
    guessed: "Вгадано",
    skipped: "Пропущено",
    howTitle: "Як це працює",
    steps: [
      ["Обери гру", "Вибери одну з п'яти ігор або дозволь системі обрати за тебе."],
      ["Встанови гравців і час", "Виріши, скільки людей грає і скільки триває кожен раунд."],
      ["Грай з одного телефона або екрана", "Передавай пристрій по колу або виведи гру на телевізор. Нічого встановлювати не потрібно."],
    ],
    testimonialsTitle: "Грають у різних країнах.",
    played: "Грали в",
    finalTitle: "Готові грати?",
    finalText: "Обери гру, збери людей і починай за кілька секунд.",
    footer: "© 2026 NickolasGames. Ігри для справжніх моментів.",
    language: "Мова",
    games: {
      whoami: { n: "Хто я?", d: "Вгадай людину, персонажа або предмет на своїй картці.", p: "2-10 гравців", t: "10 хв",
        c: { Люди: ["Кінорежисер", "Астронавт", "Чемпіон з шахів", "Вуличний музикант", "Піцайоло"], Персонажі: ["Шерлок Голмс", "Робот-дворецький", "Піратський капітан", "Чарівник", "Детектив"], Предмети: ["Літак", "Парасоля", "Маяк", "Вінілова платівка", "Компас"] } },
      crocodile: { n: "Крокодил", d: "Показуй слова без жодного звуку.", p: "3-12 гравців", t: "15 хв",
        c: { Тварини: ["Слон", "Пінгвін", "Восьминіг", "Фламінго", "Кенгуру"], Професії: ["Кінорежисер", "Піцайоло", "Пілот", "Бариста", "Фокусник"], Речі: ["Літак", "Робот", "Велосипед", "Скейтборд", "Ліфт"] } },
      alias: { n: "Alias", d: "Пояснюй слова швидко і заробляй бали для команди.", p: "4-12 гравців", t: "20 хв",
        c: { Щоденне: ["Сніданок", "Затори", "Парасоля", "Вихідні", "Паспорт"], Подорожі: ["Аеропорт", "Багаж", "Гавань", "Квиток", "Кордон"], Робота: ["Дедлайн", "Зустріч", "Бюджет", "Відгук", "Запуск"] } },
      truth: { n: "Правда або дія", d: "Чисті сучасні завдання для друзів і вечірок.", p: "3-10 гравців", t: "20 хв",
        c: { Правда: ["Яку навичку ти хотів би мати?", "Яке повідомлення ти перечитував цього тижня найчастіше?", "Який твій найбезкорисніший талант?"], Дія: ["Говори лише питаннями дві хвилини.", "Зроби голос трейлера до фільму.", "Поміняйся місцями з людиною ліворуч."] } },
      random: { n: "Випадкова гра", d: "Нехай система сама обере, у що грати далі.", p: "2-12 гравців", t: "Будь-коли", c: null },
    },
    testimonials: [
      ["Софія", "Швеція", "Ми грали у 'Хто я?' на командному вечорі. Було просто, швидко і справді весело.", "Хто я?"],
      ["Дмитро", "Україна", "Крокодил ідеально спрацював з одного телефона на домашній вечірці.", "Крокодил"],
      ["Лена", "Німеччина", "Alias став нашим швидким icebreaker перед зустрічами.", "Alias"],
      ["Марта", "Польща", "Правда або дія виглядала сучасно і без незручних моментів.", "Правда або дія"],
    ],
  },
  en: {
    heroTitle: "Games for real moments.", heroText: "Simple web games for friends, teams and parties.", start: "Start playing", explore: "Explore games", flight: "Step into the game world.", gamesTitle: "Pick your game.", gamesText: "Five ways to get a room talking, laughing and moving.", play: "Play", previewTitle: "Try it right here.", previewText: "Reveal a card, act it out, then draw the next one.", gameLabel: "Game", categoryLabel: "Category", random: "Random", any: "Any", players: "players", min: "min", reset: "Reset", startTimer: "Start timer", tap: "Tap to reveal", reveal: "Reveal", next: "Next", skip: "Skip", guessed: "Guessed", skipped: "Skipped", howTitle: "How it works", testimonialsTitle: "Played around the world.", played: "Played", finalTitle: "Ready to play?", finalText: "Pick a game, gather your people and start in seconds.", footer: "© 2026 NickolasGames. Games for real moments.", language: "Language",
    steps: [["Choose a game", "Pick one of five games, or let the system choose for you."], ["Set players and time", "Decide how many people are playing and how long each round lasts."], ["Play from one phone or screen", "Pass the device around or cast it to a TV. Nobody needs to install anything."]],
    games: {
      whoami: { n: "Who Am I?", d: "Guess the person, character or object on your card.", p: "2-10 players", t: "10 min", c: { People: ["Movie director", "Astronaut", "Chess champion", "Street musician", "Pizza chef"], Characters: ["Sherlock Holmes", "Robot butler", "Pirate captain", "Wizard", "Detective"], Objects: ["Airplane", "Umbrella", "Lighthouse", "Vinyl record", "Compass"] } },
      crocodile: { n: "Crocodile", d: "Act out words without speaking.", p: "3-12 players", t: "15 min", c: { Animals: ["Elephant", "Penguin", "Octopus", "Flamingo", "Kangaroo"], Jobs: ["Movie director", "Pizza chef", "Pilot", "Barista", "Magician"], Things: ["Airplane", "Robot", "Bicycle", "Skateboard", "Elevator"] } },
      alias: { n: "Alias", d: "Explain words fast and score points with your team.", p: "4-12 players", t: "20 min", c: { Everyday: ["Breakfast", "Traffic", "Umbrella", "Weekend", "Passport"], Travel: ["Airport", "Luggage", "Harbour", "Ticket", "Border"], Work: ["Deadline", "Meeting", "Budget", "Feedback", "Launch"] } },
      truth: { n: "Truth or Dare", d: "Clean, modern prompts for friends and parties.", p: "3-10 players", t: "20 min", c: { Truth: ["What skill do you wish you had?", "Which message did you reread most this week?", "What is your most useless talent?"], Dare: ["Speak only in questions for two minutes.", "Do your best movie-trailer voice.", "Swap seats with the person on your left."] } },
      random: { n: "Random Game", d: "Let the system pick what to play next.", p: "2-12 players", t: "Any", c: null },
    },
    testimonials: [["Sofia", "Sweden", "We used Who Am I? during a team evening. It was simple, fast and genuinely fun.", "Who Am I?"], ["Dmytro", "Ukraine", "Crocodile worked perfectly from one phone at a house party.", "Crocodile"], ["Lena", "Germany", "Alias became our quick icebreaker before meetings.", "Alias"], ["Marta", "Poland", "Truth or Dare felt clean and modern, not awkward.", "Truth or Dare"]],
  },
  sv: {
    heroTitle: "Spel för riktiga stunder.", heroText: "Enkla webbspel för vänner, team och fester.", start: "Börja spela", explore: "Utforska spel", flight: "Kliv in i spelvärlden.", gamesTitle: "Välj ditt spel.", gamesText: "Fem sätt att få rummet att prata, skratta och röra på sig.", play: "Spela", previewTitle: "Prova direkt här.", previewText: "Vänd ett kort, spela ut det och dra sedan nästa.", gameLabel: "Spel", categoryLabel: "Kategori", random: "Slump", any: "När som helst", players: "spelare", min: "min", reset: "Återställ", startTimer: "Starta timer", tap: "Tryck för att visa", reveal: "Visa", next: "Nästa", skip: "Hoppa över", guessed: "Gissade", skipped: "Hoppade över", howTitle: "Så fungerar det", testimonialsTitle: "Spelas runt om i världen.", played: "Spelade", finalTitle: "Redo att spela?", finalText: "Välj ett spel, samla dina människor och börja på några sekunder.", footer: "© 2026 NickolasGames. Spel för riktiga stunder.", language: "Språk",
    steps: [["Välj ett spel", "Välj ett av fem spel eller låt systemet välja åt dig."], ["Ställ in spelare och tid", "Bestäm hur många som spelar och hur länge varje runda varar."], ["Spela från en telefon eller skärm", "Skicka runt enheten eller casta till en TV. Ingen behöver installera något."]],
    games: {
      whoami: { n: "Vem är jag?", d: "Gissa personen, karaktären eller saken på ditt kort.", p: "2-10 spelare", t: "10 min", c: { Personer: ["Filmregissör", "Astronaut", "Schackmästare", "Gatumusiker", "Pizzakock"], Karaktärer: ["Sherlock Holmes", "Robotbutler", "Piratkapten", "Trollkarl", "Detektiv"], Saker: ["Flygplan", "Paraply", "Fyr", "Vinylskiva", "Kompass"] } },
      crocodile: { n: "Krokodil", d: "Spela upp ord utan att prata.", p: "3-12 spelare", t: "15 min", c: { Djur: ["Elefant", "Pingvin", "Bläckfisk", "Flamingo", "Känguru"], Jobb: ["Filmregissör", "Pizzakock", "Pilot", "Barista", "Magiker"], Saker: ["Flygplan", "Robot", "Cykel", "Skateboard", "Hiss"] } },
      alias: { n: "Alias", d: "Förklara ord snabbt och samla poäng till laget.", p: "4-12 spelare", t: "20 min", c: { Vardag: ["Frukost", "Trafik", "Paraply", "Helg", "Pass"], Resor: ["Flygplats", "Bagage", "Hamn", "Biljett", "Gräns"], Arbete: ["Deadline", "Möte", "Budget", "Feedback", "Lansering"] } },
      truth: { n: "Sanning eller konsekvens", d: "Fräscha moderna frågor och uppdrag för vänner och fester.", p: "3-10 spelare", t: "20 min", c: { Sanning: ["Vilken färdighet önskar du att du hade?", "Vilket meddelande läste du om flest gånger den här veckan?", "Vilken är din mest onödiga talang?"], Konsekvens: ["Prata bara i frågor i två minuter.", "Gör din bästa filmtrailerröst.", "Byt plats med personen till vänster."] } },
      random: { n: "Slumpspel", d: "Låt systemet välja vad ni ska spela härnäst.", p: "2-12 spelare", t: "När som helst", c: null },
    },
    testimonials: [["Sofia", "Sverige", "Vi använde Vem är jag? på en teamkväll. Det var enkelt, snabbt och riktigt kul.", "Vem är jag?"], ["Dmytro", "Ukraina", "Krokodil fungerade perfekt från en telefon på en hemmafest.", "Krokodil"], ["Lena", "Tyskland", "Alias blev vår snabba isbrytare före möten.", "Alias"], ["Marta", "Polen", "Sanning eller konsekvens kändes rent och modernt, inte pinsamt.", "Sanning eller konsekvens"]],
  },
  de: {
    heroTitle: "Spiele für echte Momente.", heroText: "Einfache Webspiele für Freunde, Teams und Partys.", start: "Jetzt spielen", explore: "Spiele ansehen", flight: "Tritt in die Spielwelt ein.", gamesTitle: "Wähle dein Spiel.", gamesText: "Fünf Wege, einen Raum zum Reden, Lachen und Mitmachen zu bringen.", play: "Spielen", previewTitle: "Probiere es direkt hier.", previewText: "Decke eine Karte auf, stelle sie dar und ziehe dann die nächste.", gameLabel: "Spiel", categoryLabel: "Kategorie", random: "Zufall", any: "Jederzeit", players: "Spieler", min: "Min", reset: "Zurücksetzen", startTimer: "Timer starten", tap: "Tippen zum Aufdecken", reveal: "Aufdecken", next: "Weiter", skip: "Überspringen", guessed: "Erraten", skipped: "Übersprungen", howTitle: "So funktioniert es", testimonialsTitle: "Weltweit gespielt.", played: "Spielte", finalTitle: "Bereit zu spielen?", finalText: "Wähle ein Spiel, sammle deine Leute und starte in Sekunden.", footer: "© 2026 NickolasGames. Spiele für echte Momente.", language: "Sprache",
    steps: [["Spiel wählen", "Wähle eines von fünf Spielen oder lass das System entscheiden."], ["Spieler und Zeit festlegen", "Entscheide, wie viele Personen mitspielen und wie lange jede Runde dauert."], ["Von einem Handy oder Bildschirm spielen", "Gib das Gerät weiter oder streame es auf den Fernseher. Niemand muss etwas installieren."]],
    games: {
      whoami: { n: "Wer bin ich?", d: "Errate die Person, Figur oder Sache auf deiner Karte.", p: "2-10 Spieler", t: "10 Min", c: { Personen: ["Filmregisseur", "Astronaut", "Schachmeister", "Straßenmusiker", "Pizzabäcker"], Figuren: ["Sherlock Holmes", "Roboterbutler", "Piratenkapitän", "Zauberer", "Detektiv"], Dinge: ["Flugzeug", "Regenschirm", "Leuchtturm", "Schallplatte", "Kompass"] } },
      crocodile: { n: "Krokodil", d: "Stelle Wörter dar, ohne zu sprechen.", p: "3-12 Spieler", t: "15 Min", c: { Tiere: ["Elefant", "Pinguin", "Oktopus", "Flamingo", "Känguru"], Berufe: ["Filmregisseur", "Pizzabäcker", "Pilot", "Barista", "Magier"], Dinge: ["Flugzeug", "Roboter", "Fahrrad", "Skateboard", "Aufzug"] } },
      alias: { n: "Alias", d: "Erkläre Wörter schnell und sammle Punkte für dein Team.", p: "4-12 Spieler", t: "20 Min", c: { Alltag: ["Frühstück", "Verkehr", "Regenschirm", "Wochenende", "Pass"], Reisen: ["Flughafen", "Gepäck", "Hafen", "Ticket", "Grenze"], Arbeit: ["Deadline", "Meeting", "Budget", "Feedback", "Launch"] } },
      truth: { n: "Wahrheit oder Pflicht", d: "Saubere moderne Aufgaben für Freunde und Partys.", p: "3-10 Spieler", t: "20 Min", c: { Wahrheit: ["Welche Fähigkeit hättest du gern?", "Welche Nachricht hast du diese Woche am häufigsten gelesen?", "Was ist dein nutzlosestes Talent?"], Pflicht: ["Sprich zwei Minuten lang nur in Fragen.", "Mach deine beste Filmtrailer-Stimme.", "Tausche den Platz mit der Person links von dir."] } },
      random: { n: "Zufallsspiel", d: "Lass das System wählen, was als Nächstes gespielt wird.", p: "2-12 Spieler", t: "Jederzeit", c: null },
    },
    testimonials: [["Sofia", "Schweden", "Wir haben Wer bin ich? bei einem Teamabend genutzt. Es war einfach, schnell und wirklich lustig.", "Wer bin ich?"], ["Dmytro", "Ukraine", "Krokodil funktionierte perfekt von einem Handy auf einer Hausparty.", "Krokodil"], ["Lena", "Deutschland", "Alias wurde unser schneller Eisbrecher vor Meetings.", "Alias"], ["Marta", "Polen", "Wahrheit oder Pflicht wirkte modern und gar nicht unangenehm.", "Wahrheit oder Pflicht"]],
  },
  es: {
    heroTitle: "Juegos para momentos reales.", heroText: "Juegos web sencillos para amigos, equipos y fiestas.", start: "Empezar a jugar", explore: "Explorar juegos", flight: "Entra en el mundo del juego.", gamesTitle: "Elige tu juego.", gamesText: "Cinco formas de hacer que todos hablen, rían y se muevan.", play: "Jugar", previewTitle: "Pruébalo aquí mismo.", previewText: "Revela una tarjeta, actúala y luego toma la siguiente.", gameLabel: "Juego", categoryLabel: "Categoría", random: "Aleatorio", any: "Cualquiera", players: "jugadores", min: "min", reset: "Reiniciar", startTimer: "Iniciar temporizador", tap: "Toca para revelar", reveal: "Revelar", next: "Siguiente", skip: "Saltar", guessed: "Adivinadas", skipped: "Saltadas", howTitle: "Cómo funciona", testimonialsTitle: "Jugado en todo el mundo.", played: "Jugó", finalTitle: "¿Listo para jugar?", finalText: "Elige un juego, reúne a tu gente y empieza en segundos.", footer: "© 2026 NickolasGames. Juegos para momentos reales.", language: "Idioma",
    steps: [["Elige un juego", "Elige uno de los cinco juegos o deja que el sistema elija por ti."], ["Configura jugadores y tiempo", "Decide cuántas personas juegan y cuánto dura cada ronda."], ["Juega desde un móvil o una pantalla", "Pasa el dispositivo o compártelo en la TV. Nadie necesita instalar nada."]],
    games: {
      whoami: { n: "¿Quién soy?", d: "Adivina la persona, personaje u objeto de tu tarjeta.", p: "2-10 jugadores", t: "10 min", c: { Personas: ["Director de cine", "Astronauta", "Campeón de ajedrez", "Músico callejero", "Pizzero"], Personajes: ["Sherlock Holmes", "Mayordomo robot", "Capitán pirata", "Mago", "Detective"], Objetos: ["Avión", "Paraguas", "Faro", "Disco de vinilo", "Brújula"] } },
      crocodile: { n: "Cocodrilo", d: "Representa palabras sin hablar.", p: "3-12 jugadores", t: "15 min", c: { Animales: ["Elefante", "Pingüino", "Pulpo", "Flamenco", "Canguro"], Profesiones: ["Director de cine", "Pizzero", "Piloto", "Barista", "Mago"], Cosas: ["Avión", "Robot", "Bicicleta", "Monopatín", "Ascensor"] } },
      alias: { n: "Alias", d: "Explica palabras rápido y suma puntos para tu equipo.", p: "4-12 jugadores", t: "20 min", c: { Diario: ["Desayuno", "Tráfico", "Paraguas", "Fin de semana", "Pasaporte"], Viajes: ["Aeropuerto", "Equipaje", "Puerto", "Billete", "Frontera"], Trabajo: ["Fecha límite", "Reunión", "Presupuesto", "Comentarios", "Lanzamiento"] } },
      truth: { n: "Verdad o reto", d: "Retos modernos y limpios para amigos y fiestas.", p: "3-10 jugadores", t: "20 min", c: { Verdad: ["¿Qué habilidad te gustaría tener?", "¿Qué mensaje releíste más esta semana?", "¿Cuál es tu talento más inútil?"], Reto: ["Habla solo con preguntas durante dos minutos.", "Haz tu mejor voz de tráiler de película.", "Cambia de asiento con la persona de tu izquierda."] } },
      random: { n: "Juego aleatorio", d: "Deja que el sistema elija qué jugar después.", p: "2-12 jugadores", t: "Cualquiera", c: null },
    },
    testimonials: [["Sofia", "Suecia", "Usamos ¿Quién soy? durante una noche de equipo. Fue simple, rápido y muy divertido.", "¿Quién soy?"], ["Dmytro", "Ucrania", "Cocodrilo funcionó perfecto desde un solo teléfono en una fiesta en casa.", "Cocodrilo"], ["Lena", "Alemania", "Alias se convirtió en nuestro rompehielos rápido antes de reuniones.", "Alias"], ["Marta", "Polonia", "Verdad o reto se sintió moderno y nada incómodo.", "Verdad o reto"]],
  },
};

const PLAYABLE = ["whoami", "crocodile", "alias", "truth"];
const RM = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
const go = (id) => document.querySelector(id)?.scrollIntoView({ behavior: RM ? "auto" : "smooth" });
const pickRandom = () => PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)];

function Hero({ t }) {
  return (
    <header className="hero">
      <CloudShader className="cloud-backdrop" speed={0.7} count={6} cloudColor="#f7fbff" skyTopColor="#8EC8FF" skyBottomColor="#CCE6FF" />
      <div className="wrap">
        <h1>{t.heroTitle}</h1>
        <p>{t.heroText}</p>
        <div className="cta-row">
          <button className="btn pri" onClick={() => go("#preview")}>{t.start}</button>
          <button className="btn" onClick={() => go("#games")}>{t.explore}</button>
        </div>
      </div>
    </header>
  );
}

function PlaneFlight({ title }) {
  const root = useRef(null), plane = useRef(null), trail = useRef(null), heading = useRef(null);
  useEffect(() => {
    if (RM) return;
    const X = (t) => -0.05 + 1.1 * t, Y = (t) => 0.85 - 0.7 * t - 0.08 * Math.sin(Math.PI * t * 2);
    const fly = () => {
      const r = root.current.getBoundingClientRect(), vh = innerHeight, W = innerWidth;
      const p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
      let d = "";
      for (let i = 0; i <= 40; i++) { const t = (p * i) / 40; d += (i ? "L" : "M") + (X(t) * 100).toFixed(2) + " " + (Y(t) * 100).toFixed(2); }
      trail.current.setAttribute("d", d);
      const e = 0.01, dx = (X(p + e) - X(p)) * W, dy = (Y(p + e) - Y(p)) * vh;
      const el = plane.current;
      el.style.left = X(p) * 100 + "%"; el.style.top = Y(p) * 100 + "%";
      el.style.transform = `rotate(${(Math.atan2(dy, dx) * 180) / Math.PI}deg)`;
      heading.current.style.opacity = Math.min(1, p * 3) * Math.min(1, (1 - p) * 4);
    };
    addEventListener("scroll", fly, { passive: true }); addEventListener("resize", fly); fly();
    return () => { removeEventListener("scroll", fly); removeEventListener("resize", fly); };
  }, []);
  if (RM) return null;
  return (
    <div className="flight" ref={root} aria-hidden="true">
      <div className="stage">
        <svg className="trail" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path ref={trail} fill="none" stroke="#0097FF" strokeWidth="1.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" opacity=".7" />
        </svg>
        <h2 ref={heading}>{title}</h2>
                <svg ref={plane} className="plane" viewBox="0 0 120 72" role="img" aria-label="Airplane">
          <defs>
            <linearGradient id="planeBody" x1="18" x2="108" y1="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.55" stopColor="#d9efff" />
              <stop offset="1" stopColor="#7bbcff" />
            </linearGradient>
            <linearGradient id="planeWing" x1="38" x2="68" y1="22" y2="62" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f7fbff" />
              <stop offset="1" stopColor="#0097FF" />
            </linearGradient>
          </defs>
          <path className="plane-shadow" d="M18 44c22 11 62 12 88-1" />
          <path className="plane-wing back" d="M45 37 18 62h18l38-22z" />
          <path className="plane-body" d="M8 36c15-10 58-18 94-13 7 1 12 6 12 10s-5 8-12 9c-36 5-79-3-94-13-4-3-4-7 0-10z" />
          <path className="plane-nose" d="M96 24c12 2 18 6 18 9s-6 7-18 9c4-5 4-13 0-18z" />
          <path className="plane-wing front" d="M47 34 23 10h18l36 22z" />
          <path className="plane-tail" d="M24 30 9 15h14l20 16zM24 42 9 57h14l20-16z" />
          <path className="plane-window" d="M76 26c6 0 11 1 16 3" />
          <path className="plane-highlight" d="M18 32c20-6 47-9 74-6" />
        </svg>
      </div>
    </div>
  );
}

function GamesGrid({ games, t, onPlay }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section className="s" id="games">
      <div className="wrap">
        <div className="head"><h2>{t.gamesTitle}</h2><p>{t.gamesText}</p></div>
        <div ref={ref} className={"grid reveal-games" + (seen ? " in" : "")}>
          {Object.entries(games).map(([k, g]) => (
            <article className="gc" key={k}>
              <h3>{g.n}</h3><p>{g.d}</p>
              <div className="meta"><span>{g.p}</span><span>{g.t}</span></div>
              <button className="btn sm" onClick={() => onPlay(k)} aria-label={`${t.play} ${g.n}`}>{t.play}</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const SCRAMBLE = "▓▒░#@$%&*+?";
const PLAYER_SETUP = {
  uk: {
    title: "Роздати картки гравцям",
    text: "Введи імена, натисни random, і кожен отримає приховану картку. Не відкривай картку перед її власником.",
    label: "Імена гравців",
    placeholder: "Nickolas\nSofia\nDmytro",
    assign: "Random картки",
    hideAll: "Сховати всі",
    show: "Показати слово",
    hide: "Сховати слово",
    forPlayer: "Картка для",
    hidden: "Приховано від гравця",
    empty: "Додай хоча б одне ім'я.",
    notEnough: "Унікальних карток менше, ніж гравців. Додай більше слів або прибери частину гравців.",
    guessed: "Вгадав",
    guessedWord: "Вгадане слово",
    noNewWord: "Немає нового унікального слова для цього гравця.",
  },
  en: {
    title: "Deal cards to players",
    text: "Enter names, press random, and every player gets a hidden card. Do not reveal a card in front of its owner.",
    label: "Player names",
    placeholder: "Nickolas\nSofia\nDmytro",
    assign: "Random cards",
    hideAll: "Hide all",
    show: "Show word",
    hide: "Hide word",
    forPlayer: "Card for",
    hidden: "Hidden from player",
    empty: "Add at least one name.",
    notEnough: "There are fewer unique cards than players. Add more words or remove some players.",
    guessed: "Guessed",
    guessedWord: "Guessed word",
    noNewWord: "There is no new unique word for this player.",
  },
  sv: {
    title: "Dela ut kort till spelare",
    text: "Skriv namn, tryck på slump, så får varje spelare ett dolt kort. Visa inte kortet för den som äger det.",
    label: "Spelarnamn",
    placeholder: "Nickolas\nSofia\nDmytro",
    assign: "Slumpa kort",
    hideAll: "Dölj alla",
    show: "Visa ord",
    hide: "Dölj ord",
    forPlayer: "Kort för",
    hidden: "Dolt för spelaren",
    empty: "Lägg till minst ett namn.",
    notEnough: "Det finns färre unika kort än spelare. Lägg till fler ord eller ta bort några spelare.",
    guessed: "Gissade",
    guessedWord: "Gissat ord",
    noNewWord: "Det finns inget nytt unikt ord för den här spelaren.",
  },
  de: {
    title: "Karten an Spieler verteilen",
    text: "Gib Namen ein, drücke Zufall, und jeder bekommt eine verdeckte Karte. Zeige die Karte nicht vor der eigenen Person.",
    label: "Spielernamen",
    placeholder: "Nickolas\nSofia\nDmytro",
    assign: "Zufällige Karten",
    hideAll: "Alle verbergen",
    show: "Wort zeigen",
    hide: "Wort verbergen",
    forPlayer: "Karte für",
    hidden: "Vor dem Spieler verborgen",
    empty: "Füge mindestens einen Namen hinzu.",
    notEnough: "Es gibt weniger einzigartige Karten als Spieler. Füge mehr Wörter hinzu oder entferne einige Spieler.",
    guessed: "Erraten",
    guessedWord: "Erratenes Wort",
    noNewWord: "Es gibt kein neues einzigartiges Wort für diesen Spieler.",
  },
  es: {
    title: "Repartir tarjetas a jugadores",
    text: "Escribe nombres, pulsa aleatorio y cada jugador recibe una tarjeta oculta. No muestres la tarjeta delante de su dueño.",
    label: "Nombres de jugadores",
    placeholder: "Nickolas\nSofia\nDmytro",
    assign: "Tarjetas aleatorias",
    hideAll: "Ocultar todo",
    show: "Mostrar palabra",
    hide: "Ocultar palabra",
    forPlayer: "Tarjeta para",
    hidden: "Oculta para el jugador",
    empty: "Añade al menos un nombre.",
    notEnough: "Hay menos tarjetas únicas que jugadores. Añade más palabras o elimina algunos jugadores.",
    guessed: "Adivinó",
    guessedWord: "Palabra adivinada",
    noNewWord: "No hay una palabra única nueva para este jugador.",
  },
};

function CardStackPreview({ game, games, t, lang, onGame }) {
  const cats = useMemo(() => Object.keys(games[game].c), [game, games]);
  const [cat, setCat] = useState(cats[0]);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(false);
  const [text, setText] = useState("");
  const [enc, setEnc] = useState(false);
  const [exit, setExit] = useState(null);
  const [score, setScore] = useState({ got: 0, skipped: 0 });
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [playerNames, setPlayerNames] = useState("Nickolas\nSofia\nDmytro");
  const [assignments, setAssignments] = useState([]);
  const [visibleCards, setVisibleCards] = useState({});
  const [dealWarning, setDealWarning] = useState("");
  const scr = useRef(0);
  const playerCopy = PLAYER_SETUP[lang] || PLAYER_SETUP.en;

  useEffect(() => { setCat(Object.keys(games[game].c)[0]); }, [game, games]);
  useEffect(() => {
    clearInterval(scr.current);
    setQueue(shuffle(games[game].c[cat] || []));
    setIdx(0); setShown(false); setExit(null); setEnc(false); setText(""); setScore({ got: 0, skipped: 0 }); setAssignments([]); setVisibleCards({}); setDealWarning("");
  }, [game, cat, games]);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => { if (l <= 1) { setRunning(false); return 0; } return l - 1; }), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => () => clearInterval(scr.current), []);

  const word = queue.length ? queue[idx % queue.length] : "";

  const reveal = () => {
    if (shown || exit || !word) return;
    setShown(true);
    if (!running && left === 60) setRunning(true);
    if (RM) { setText(word); return; }
    setEnc(true);
    let f = 0;
    const N = 22;
    scr.current = setInterval(() => {
      f++;
      const r = Math.floor((f / N) * word.length * 1.4);
      setText([...word].map((ch, i) => (ch === " " ? " " : i < r ? ch : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)])).join(""));
      if (f >= N || r >= word.length) { clearInterval(scr.current); setEnc(false); setText(word); }
    }, 34);
  };

  const advance = (dir) => {
    if (exit || !word) return;
    if (!shown && dir === "next") return reveal();
    clearInterval(scr.current);
    setExit(dir);
    setScore((s) => (dir === "skip" ? { ...s, skipped: s.skipped + 1 } : { ...s, got: s.got + 1 }));
    setTimeout(() => { setIdx((i) => i + 1); setShown(false); setEnc(false); setExit(null); setText(""); }, RM ? 0 : 380);
  };

  const cardStyle = (i) => i === 0 && exit
    ? { transform: `translate(${exit === "skip" ? "-" : ""}130%,-20px) rotate(${exit === "skip" ? -12 : 12}deg)`, opacity: 0 }
    : { transform: `translateY(${i * 14}px) scale(${1 - i * 0.05})`, opacity: 1 - i * 0.25 };

  const toggleTimer = () => {
    if (running || left < 60) { setRunning(false); setLeft(60); } else setRunning(true);
  };

  const allWhoAmIWords = useMemo(() => [...new Set(Object.values(games.whoami.c).flat())], [games]);
  const parsedNames = playerNames.split(/[\n,]+/).map((name) => name.trim()).filter(Boolean);
  const dealWhoAmICards = () => {
    if (!parsedNames.length) {
      setAssignments([]);
      setVisibleCards({});
      setDealWarning("");
      return;
    }
    const categories = games.whoami.c;
    const preferredWords = categories[cat] || [];
    const fallbackWords = Object.entries(categories)
      .filter(([category]) => category !== cat)
      .flatMap(([, words]) => words);
    const uniqueWords = [...new Set([...shuffle(preferredWords), ...shuffle(fallbackWords)])];
    const dealt = parsedNames.slice(0, uniqueWords.length).map((name, i) => ({
      id: `${name}-${i}-${Date.now()}`,
      name,
      word: uniqueWords[i],
    }));
    setAssignments(dealt);
    setVisibleCards({});
    setDealWarning(parsedNames.length > uniqueWords.length ? playerCopy.notEnough : "");
  };

  const toggleAssignedCard = (id) => {
    setVisibleCards((current) => ({ ...current, [id]: !current[id] }));
  };

  const markAssignedGuessed = (id) => {
    const target = assignments.find((item) => item.id === id);
    if (!target) return;
    const activeWords = new Set(assignments.filter((item) => item.id !== id).map((item) => item.word));
    const nextWord = shuffle(allWhoAmIWords).find((candidate) => candidate !== target.word && !activeWords.has(candidate));
    if (!nextWord) {
      setAssignments((current) => current.map((item) => item.id === id ? { ...item, lastGuessed: item.word } : item));
      setVisibleCards((current) => ({ ...current, [id]: false }));
      setDealWarning(playerCopy.noNewWord);
      return;
    }
    setAssignments((current) => current.map((item) => item.id === id ? { ...item, word: nextWord, lastGuessed: item.word } : item));
    setVisibleCards((current) => ({ ...current, [id]: false }));
    setDealWarning("");
  };

  return (
    <section className="s pv" id="preview">
      <div className="wrap pvg">
        <div>
          <div className="head" style={{ margin: 0 }}><h2>{t.previewTitle}</h2><p>{t.previewText}</p></div>
          <div className="tabs" role="group" aria-label={t.gameLabel}>
            {PLAYABLE.map((k) => <button key={k} className="chip" aria-pressed={k === game} onClick={() => onGame(k)}>{games[k].n}</button>)}
            <button className="chip" aria-pressed="false" onClick={() => onGame("random")}>{t.random}</button>
          </div>
          <div className="cats" role="group" aria-label={t.categoryLabel}>
            {cats.map((c) => <button key={c} className="chip" aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <div className="timer">
            <b>{left}</b>
            <div className="tbar"><i style={{ transform: `scaleX(${left / 60})` }} /></div>
            <button className="btn sm" onClick={toggleTimer}>{running || left < 60 ? t.reset : t.startTimer}</button>
          </div>
          {game === "whoami" && (
            <div className="players-panel">
              <h3>{playerCopy.title}</h3>
              <p>{playerCopy.text}</p>
              <label className="players-label" htmlFor="player-names">{playerCopy.label}</label>
              <textarea id="player-names" value={playerNames} placeholder={playerCopy.placeholder} onChange={(e) => setPlayerNames(e.target.value)} />
              <div className="players-actions">
                <button className="btn pri sm" onClick={dealWhoAmICards}>{playerCopy.assign}</button>
                <button className="btn sm" onClick={() => setVisibleCards({})}>{playerCopy.hideAll}</button>
              </div>
              {!parsedNames.length && <div className="players-note">{playerCopy.empty}</div>}
              {dealWarning && <div className="players-note warn">{dealWarning}</div>}
            </div>
          )}
        </div>
        <div>
          <div className="deck" aria-live="polite">
            {queue.length > 0 && [2, 1, 0].map((i) => {
              const k = idx + i;
              return (
                <div key={k} className="card" style={cardStyle(i)} onClick={i === 0 ? reveal : undefined}>
                  <small>{games[game].n} · {cat}</small>
                  {i === 0 && shown ? <div className={"w" + (enc ? " enc" : "")}>{text}</div> : <div className="w hid">{t.tap}</div>}
                </div>
              );
            })}
          </div>
          <div className="ctrl">
            <button className="btn pri" onClick={reveal}>{t.reveal}</button>
            <button className="btn" onClick={() => advance("next")}>{t.next}</button>
            <button className="btn" onClick={() => advance("skip")}>{t.skip}</button>
          </div>
          <div className="score">{t.guessed} {score.got} · {t.skipped} {score.skipped}</div>
          {game === "whoami" && assignments.length > 0 && (
            <div className="assigned-grid">
              {assignments.map((item) => {
                const isVisible = Boolean(visibleCards[item.id]);
                return (
                  <article className="assigned-card" key={item.id}>
                    <small>{playerCopy.forPlayer}</small>
                    <h3>{item.name}</h3>
                    <div className={"assigned-word" + (isVisible ? " visible" : "")}>{isVisible ? item.word : playerCopy.hidden}</div>
                    {item.lastGuessed && <div className="assigned-solved">{playerCopy.guessedWord}: <b>{item.lastGuessed}</b></div>}
                    <div className="assigned-actions">
                      <button className="btn sm" onClick={() => toggleAssignedCard(item.id)}>{isVisible ? playerCopy.hide : playerCopy.show}</button>
                      <button className="btn pri sm" onClick={() => markAssignedGuessed(item.id)}>{playerCopy.guessed}</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ t }) {
  return (
    <section className="s">
      <div className="wrap">
        <div className="head"><h2>{t.howTitle}</h2></div>
        <div className="steps">
          {t.steps.map(([title, text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ t }) {
  const items = RM ? t.testimonials : [...t.testimonials, ...t.testimonials];
  return (
    <section className="s" style={{ paddingTop: 20 }}>
      <div className="wrap"><div className="head"><h2>{t.testimonialsTitle}</h2></div></div>
      <div className="mq"><div className="mt">
        {items.map(([name, country, quote, game], i) => (
          <figure className="tc" style={{ margin: 0 }} key={`${name}-${i}`}>
            <q>{quote}</q>
            <div><b>{name}, {country}</b>{t.played} {game}</div>
          </figure>
        ))}
      </div></div>
    </section>
  );
}

function FinalCta({ t }) {
  return (
    <section className="fin">
      <div className="wrap">
        <h2>{t.finalTitle}</h2>
        <p>{t.finalText}</p>
        <button className="btn pri" onClick={() => go("#preview")}>{t.start}</button>
      </div>
    </section>
  );
}

function LanguageSwitcher({ lang, setLang, label }) {
  return (
    <div className="lang" role="group" aria-label={label}>
      {LANGS.map((item) => (
        <button key={item.code} className="lang-btn" aria-pressed={lang === item.code} title={item.label} onClick={() => setLang(item.code)}>
          {item.short}
        </button>
      ))}
    </div>
  );
}

export default function NickolasGames() {
  const [lang, setLang] = useState(() => localStorage.getItem("nickolasgames-lang") || "en");
  const [game, setGame] = useState("crocodile");
  const t = COPY[lang] || COPY.en;
  const choose = (k, scroll) => {
    setGame(k === "random" ? pickRandom() : k);
    if (scroll) go("#preview");
  };

  useEffect(() => {
    localStorage.setItem("nickolasgames-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
      <nav><span>NickolasGames</span><LanguageSwitcher lang={lang} setLang={setLang} label={t.language} /></nav>
      <Hero t={t} />
      <PlaneFlight title={t.flight} />
      <GamesGrid games={t.games} t={t} onPlay={(k) => choose(k, true)} />
      <CardStackPreview game={game} games={t.games} t={t} lang={lang} onGame={(k) => choose(k, false)} />
      <HowItWorks t={t} />
      <Testimonials t={t} />
      <FinalCta t={t} />
      <footer>{t.footer}</footer>
    </>
  );
}

