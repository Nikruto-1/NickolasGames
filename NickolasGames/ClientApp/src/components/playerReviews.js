// Editorial paraphrases of oral feedback supplied and confirmed by the project owner.
// These are not verbatim quotations; individual author sign-off is not independently verified.
export const REVIEW_LANGS = ['uk','en','sv','de','es'];
const TOPICS = new Set(['whoami','crocodile','alias','truth','checkers','spy','design','offline']);
const rows = [
  [
    "de-andrii",
    "Андрій",
    "Andrii",
    "DE",
    "whoami",
    "Грали компанією, і найсмішніше було слухати, які дивні запитання люди ставлять, щоб відгадати свого персонажа.",
    "We played as a group, and the funniest part was hearing the strange questions people asked to guess their character.",
    "Vi spelade i ett sällskap, och roligast var att höra vilka märkliga frågor folk ställde för att gissa sin karaktär.",
    "Wir haben in einer Gruppe gespielt. Am lustigsten waren die seltsamen Fragen, mit denen alle ihre Figur erraten wollten.",
    "Jugamos en grupo y lo más divertido fue escuchar las preguntas tan raras que hacía la gente para adivinar su personaje."
  ],
  [
    "hennadii",
    "Геннадій",
    "Hennadii",
    null,
    "offline",
    "Працюю моряком, тому в морі не завжди є доступ до інтернету. Дуже зручно, що ми змогли пограти разом із колегами прямо на судні. Окремий плюс за англійську локалізацію, адже в екіпажі можуть бути люди з різних країн.",
    "I work as a seafarer, so internet access isn't always available at sea. It was really convenient to play together with my colleagues right on board. English language support is also a big plus, especially when the crew includes people from different countries.",
    "Jag arbetar som sjöman, så tillgång till internet finns inte alltid till havs. Det var väldigt praktiskt att kunna spela med kollegorna direkt ombord. Engelskan är ett stort plus, särskilt när besättningen består av människor från olika länder.",
    "Ich arbeite als Seemann, und auf See gibt es nicht immer Internet. Es war sehr praktisch, direkt an Bord mit meinen Kollegen spielen zu können. Die englische Sprachversion ist ein großer Pluspunkt, besonders bei einer internationalen Besatzung.",
    "Trabajo como marino, así que en el mar no siempre hay internet. Fue muy práctico poder jugar con mis compañeros a bordo. La versión en inglés también es una gran ventaja, especialmente cuando la tripulación es de distintos países."
  ],
  [
    "ua-vlad-1",
    "Влад",
    "Vlad",
    "UA",
    "spy",
    "Найцікавіше — спостерігати, як усі починають підозрювати одне одного через звичайне запитання.",
    "The best part is watching everyone start to suspect each other over a perfectly ordinary question.",
    "Det roligaste är att se hur alla börjar misstänka varandra på grund av en helt vanlig fråga.",
    "Am spannendsten ist es, zu sehen, wie alle wegen einer ganz normalen Frage anfangen, sich gegenseitig zu verdächtigen.",
    "Lo mejor es ver cómo todos empiezan a sospechar unos de otros por una pregunta de lo más normal."
  ],
  [
    "pl-kate",
    "Кейт",
    "Kate",
    "PL",
    "design",
    "Дуже затишний дизайн, особливо подобається Холмс. Приємно, що сайт не перевантажений зайвими кнопками.",
    "The design feels really cozy, and I especially like Holmes. It's nice that the website isn't cluttered with unnecessary buttons.",
    "Designen känns riktigt mysig, och jag gillar särskilt Holmes. Det är skönt att webbplatsen inte är full av onödiga knappar.",
    "Das Design ist richtig gemütlich, besonders gefällt mir Holmes. Schön, dass die Website nicht mit unnötigen Schaltflächen überladen ist.",
    "El diseño es muy acogedor y me gusta especialmente Holmes. Se agradece que la web no esté llena de botones innecesarios."
  ],
  [
    "se-yara",
    "Яра",
    "Yara",
    "SE",
    "truth",
    "Думали, що добре знаємо одне одного, але після деяких запитань зрозуміли, що це зовсім не так.",
    "We thought we knew each other well, but after a few questions we realized that wasn't quite true.",
    "Vi trodde att vi kände varandra väl, men efter några frågor insåg vi att det inte riktigt stämde.",
    "Wir dachten, wir kennen uns gut, aber nach ein paar Fragen merkten wir, dass das gar nicht so stimmt.",
    "Pensábamos que nos conocíamos bien, pero después de algunas preguntas nos dimos cuenta de que no era del todo cierto."
  ],
  [
    "gb-ruslan",
    "Руслан",
    "Ruslan",
    "GB",
    "crocodile",
    "Зручно, що для цілої компанії достатньо одного телефона. Не потрібно нічого завантажувати.",
    "It's convenient that one phone is enough for the whole group. There's nothing to install.",
    "Det är smidigt att en enda mobil räcker för hela sällskapet. Man behöver inte installera något.",
    "Praktisch, dass ein einziges Handy für die ganze Gruppe reicht. Man muss nichts installieren.",
    "Es muy cómodo que baste un teléfono para todo el grupo. No hay que instalar nada."
  ],
  [
    "ua-elina",
    "Еліна",
    "Elina",
    "UA",
    "whoami",
    "Коли всі знають твого персонажа, а ти навіть не здогадуєшся, починається найвеселіша частина гри.",
    "The funniest part starts when everyone knows your character and you haven't got a clue.",
    "Det roligaste börjar när alla vet vem din karaktär är och du själv inte har en aning.",
    "Der lustigste Teil beginnt, wenn alle deine Figur kennen und du selbst keine Ahnung hast.",
    "La parte más divertida empieza cuando todos saben quién es tu personaje y tú no tienes ni idea."
  ],
  [
    "ro-mykita",
    "Микита",
    "Mykyta",
    "RO",
    "checkers",
    "Прикольно, що серед ігор для компанії є і звичайні шашки. Окремий плюс за фігурки у вигляді котів.",
    "It's cool that there are classic checkers alongside the party games. Extra points for the cat-shaped pieces.",
    "Kul att det finns klassiskt damspel bland sällskapsspelen. Ett extra plus för pjäserna som ser ut som katter.",
    "Cool, dass es neben den Partyspielen auch klassisches Dame gibt. Ein Extra-Plus für die Katzenfiguren.",
    "Me gusta que también haya damas clásicas entre los juegos de grupo. Un punto extra por las fichas con forma de gato."
  ],
  [
    "pl-artem",
    "Артем",
    "Artem",
    "PL",
    "spy",
    "Цікаво перевіряти, наскільки переконливо ти можеш відповідати, навіть якщо не знаєш локації.",
    "It's fun to see how convincingly you can answer even when you don't know the location.",
    "Det är kul att se hur övertygande man kan svara även när man inte vet platsen.",
    "Es macht Spaß, auszuprobieren, wie überzeugend man antworten kann, obwohl man den Ort nicht kennt.",
    "Es divertido comprobar lo convincente que puedes sonar incluso cuando no sabes cuál es el lugar."
  ],
  [
    "ua-vika",
    "Віка",
    "Vika",
    "UA",
    "crocodile",
    "Ідеальна гра для вечора з друзями. Іноді самі спроби показати слово смішніші за правильну відповідь.",
    "A perfect game for an evening with friends. Sometimes the attempts to act out the word are funnier than the correct answer.",
    "Ett perfekt spel för en kväll med vänner. Ibland är försöken att gestalta ordet roligare än rätt svar.",
    "Ein perfektes Spiel für einen Abend mit Freunden. Manchmal sind die Versuche, das Wort darzustellen, lustiger als die richtige Antwort.",
    "Un juego perfecto para una noche con amigos. A veces los intentos de representar la palabra hacen más gracia que la respuesta correcta."
  ],
  [
    "se-andrii",
    "Андрій",
    "Andrii",
    "SE",
    "crocodile",
    "Особливо весело, коли людина намагається показати складне слово, а всі навколо вигадують абсолютно різні варіанти.",
    "It's especially funny when someone tries to act out a difficult word and everyone comes up with completely different guesses.",
    "Det är extra roligt när någon försöker gestalta ett svårt ord och alla kommer med helt olika gissningar.",
    "Besonders lustig ist es, wenn jemand ein schwieriges Wort darstellt und alle völlig unterschiedliche Antworten raten.",
    "Es especialmente divertido cuando alguien intenta representar una palabra difícil y todos proponen respuestas totalmente distintas."
  ],
  [
    "pl-zhenia",
    "Женя",
    "Zhenia",
    "PL",
    "alias",
    "Коли закінчується час, починаєш пояснювати слова настільки дивно, що вже сам не розумієш, що говориш.",
    "When time is running out, you start explaining words so strangely that even you don't understand what you're saying.",
    "När tiden håller på att ta slut börjar man förklara orden så konstigt att man själv inte förstår vad man säger.",
    "Wenn die Zeit knapp wird, erklärt man Wörter so seltsam, dass man selbst nicht mehr weiß, was man sagt.",
    "Cuando se acaba el tiempo, empiezas a explicar las palabras de una forma tan rara que ni tú entiendes lo que dices."
  ],
  [
    "ua-vlad-2",
    "Влад",
    "Vlad",
    "UA",
    "checkers",
    "Подобається, що можна просто відкрити сайт і зіграти в шашки без встановлення додаткових програм.",
    "I like that you can just open the website and play checkers without installing anything else.",
    "Jag gillar att man bara kan öppna webbplatsen och spela dam utan att installera något annat.",
    "Mir gefällt, dass man einfach die Website öffnen und Dame spielen kann, ohne zusätzliche Programme zu installieren.",
    "Me gusta poder abrir la web y jugar a las damas sin instalar programas adicionales."
  ],
  [
    "gb-alex",
    "Алекс",
    "Alex",
    "GB",
    "alias",
    "Подобається азарт, коли намагаєшся пояснити якомога більше слів за одну хвилину.",
    "I enjoy the excitement of trying to explain as many words as possible in one minute.",
    "Jag gillar spänningen när man försöker förklara så många ord som möjligt på en minut.",
    "Ich mag den Nervenkitzel, wenn man in einer Minute möglichst viele Wörter erklären will.",
    "Me gusta la emoción de intentar explicar tantas palabras como sea posible en un minuto."
  ],
  [
    "pl-maryna",
    "Марина",
    "Maryna",
    "PL",
    "whoami",
    "Хороший спосіб провести вечір разом і відкласти соціальні мережі хоча б на деякий час.",
    "A great way to spend an evening together and put social media aside for a while.",
    "Ett bra sätt att tillbringa en kväll tillsammans och lägga undan sociala medier en stund.",
    "Eine schöne Möglichkeit, den Abend zusammen zu verbringen und soziale Medien eine Weile beiseitezulassen.",
    "Una buena forma de pasar la noche juntos y dejar las redes sociales a un lado durante un rato."
  ],
  [
    "ro-dasha",
    "Даша",
    "Dasha",
    "RO",
    "truth",
    "Хороший варіант, коли зустрілися з друзями, але не знаєте, чим зайнятися. Є з чого вибрати.",
    "A great option when you've met up with friends but don't know what to do. There's plenty to choose from.",
    "Ett bra alternativ när man träffar vänner men inte vet vad man ska göra. Det finns mycket att välja på.",
    "Eine gute Wahl, wenn man sich mit Freunden trifft, aber nicht weiß, was man machen soll. Es gibt genug Auswahl.",
    "Una buena opción cuando te reúnes con amigos y no sabes qué hacer. Hay mucho donde elegir."
  ],
  [
    "ua-anastasiia",
    "Анастасія",
    "Anastasiia",
    "UA",
    "truth",
    "Подобається, що можна не просто пограти, а й дізнатися щось нове про друзів.",
    "I like that you can do more than just play: you also learn something new about your friends.",
    "Jag gillar att man inte bara spelar utan också lär sig något nytt om sina vänner.",
    "Mir gefällt, dass man nicht nur spielt, sondern auch etwas Neues über seine Freunde erfährt.",
    "Me gusta que no solo juegas, sino que también descubres algo nuevo sobre tus amigos."
  ]
];
export const PLAYER_REVIEWS = rows.map(([id,name,latin,country,game,...texts])=>({id,name,latin,country,game,approved:true,quotes:Object.fromEntries(REVIEW_LANGS.map((lang,i)=>[lang,texts[i]]))}));
export function visiblePlayerReviews(entries,lang){
 const language=REVIEW_LANGS.includes(lang)?lang:'en';
 const seen=new Set();
 return entries.filter(entry=>{
  if(!entry||entry.approved!==true||typeof entry.id!=='string'||!entry.id.trim()||seen.has(entry.id)||typeof entry.name!=='string'||!entry.name.trim()||(entry.country!==null&&!/^[A-Z]{2}$/.test(entry.country??''))||!TOPICS.has(entry.game)||!REVIEW_LANGS.every(l=>typeof entry.quotes?.[l]==='string'&&entry.quotes[l].trim()))return false;
  seen.add(entry.id);return true;
 }).map(({id,name,latin,country,game,quotes})=>({id,name:language==='uk'?name:(latin||name),country,game,quote:quotes[language]}));
}
