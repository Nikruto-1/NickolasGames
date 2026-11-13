export const WHOAMI_UI = {
 uk:{timeUp:'Холмс повідомляє, що час закінчився',allLevels:'Усі рівні',pause:'Пауза',title:'Хто я?',setup:'Налаштуй гру',players:'Гравці',name:'Ім’я гравця',add:'Додати',remove:'Видалити',start:'Почати гру',advanced:'Додаткові налаштування',open:'Відкрити картку',hold:'Утримуй, щоб показати',privacy:'Передай телефон іншим. Не дивись на свою картку.',close:'Приховати й закрити',hidden:'Картка прихована',empty:'Немає нових слів',finish:'Завершити гру',summary:'Підсумок гри',again:'Зіграти ще',settings:'Змінити налаштування',resume:'Продовжити гру',duplicate:'Гравець із таким ім’ям уже є.',saved:'Прогрес зберігається автоматично. Після повернення всі картки приховані.',failed:'Не вдалося зберегти прогрес.',timer:'Таймер раунду',confirm:'Почати нову гру та скинути результати?',manual:'Замінити слово вручну',total:'Всього вгадано',placeholder:'Наприклад, Микола',savedGame:'Гра збережена'},
 en:{timeUp:'Holmes says that time is up',allLevels:'All levels',pause:'Pause',title:'Who Am I?',setup:'Set up your game',players:'Players',name:'Player name',add:'Add',remove:'Remove',start:'Start game',advanced:'Advanced settings',open:'Open card',hold:'Hold to reveal',privacy:'Pass the phone to the others. Do not look at your own card.',close:'Hide and close',hidden:'Card hidden',empty:'No new words',finish:'Finish game',summary:'Game summary',again:'Play again',settings:'Change settings',resume:'Continue game',duplicate:'A player with this name already exists.',saved:'Progress is saved automatically. All cards stay hidden when you return.',failed:'Progress could not be saved.',timer:'Round timer',confirm:'Start a new game and clear the results?',manual:'Replace word manually',total:'Total guessed',placeholder:'For example, Mykola',savedGame:'Game saved'},
 sv:{timeUp:'Holmes meddelar att tiden är ute',allLevels:'Alla nivåer',pause:'Paus',title:'Vem är jag?',setup:'Ställ in spelet',players:'Spelare',name:'Spelarens namn',add:'Lägg till',remove:'Ta bort',start:'Starta spelet',advanced:'Fler inställningar',open:'Öppna kort',hold:'Håll för att visa',privacy:'Ge telefonen till de andra. Titta inte på ditt eget kort.',close:'Dölj och stäng',hidden:'Kortet är dolt',empty:'Inga nya ord',finish:'Avsluta spelet',summary:'Spelöversikt',again:'Spela igen',settings:'Ändra inställningar',resume:'Fortsätt spelet',duplicate:'En spelare med detta namn finns redan.',saved:'Spelet sparas automatiskt. Alla kort är dolda när du återvänder.',failed:'Kunde inte spara spelet.',timer:'Rundans timer',confirm:'Starta ett nytt spel och nollställa resultaten?',manual:'Byt ord manuellt',total:'Totalt gissat',placeholder:'Till exempel Mykola',savedGame:'Spelet sparat'},
 de:{timeUp:'Holmes meldet, dass die Zeit abgelaufen ist',allLevels:'Alle Stufen',pause:'Pause',title:'Wer bin ich?',setup:'Spiel einrichten',players:'Spieler',name:'Spielername',add:'Hinzufügen',remove:'Entfernen',start:'Spiel starten',advanced:'Weitere Einstellungen',open:'Karte öffnen',hold:'Zum Anzeigen gedrückt halten',privacy:'Gib den anderen das Telefon. Schau nicht auf deine eigene Karte.',close:'Verbergen und schließen',hidden:'Karte verborgen',empty:'Keine neuen Wörter',finish:'Spiel beenden',summary:'Spielübersicht',again:'Erneut spielen',settings:'Einstellungen ändern',resume:'Spiel fortsetzen',duplicate:'Ein Spieler mit diesem Namen existiert bereits.',saved:'Der Fortschritt wird automatisch gespeichert. Bei der Rückkehr sind alle Karten verborgen.',failed:'Speichern fehlgeschlagen.',timer:'Runden-Timer',confirm:'Neues Spiel starten und Ergebnisse löschen?',manual:'Wort manuell ersetzen',total:'Insgesamt erraten',placeholder:'Zum Beispiel Mykola',savedGame:'Spiel gespeichert'},
 es:{timeUp:'Holmes anuncia que se ha acabado el tiempo',allLevels:'Todos los niveles',pause:'Pausa',title:'¿Quién soy?',setup:'Configura la partida',players:'Jugadores',name:'Nombre del jugador',add:'Añadir',remove:'Eliminar',start:'Empezar partida',advanced:'Más ajustes',open:'Abrir tarjeta',hold:'Mantén pulsado para mostrar',privacy:'Pasa el teléfono a los demás. No mires tu propia tarjeta.',close:'Ocultar y cerrar',hidden:'Tarjeta oculta',empty:'No hay palabras nuevas',finish:'Finalizar partida',summary:'Resumen de la partida',again:'Volver a jugar',settings:'Cambiar ajustes',resume:'Continuar partida',duplicate:'Ya existe un jugador con este nombre.',saved:'El progreso se guarda automáticamente. Al volver, todas las tarjetas están ocultas.',failed:'No se pudo guardar el progreso.',timer:'Temporizador de ronda',confirm:'¿Empezar otra partida y borrar los resultados?',manual:'Cambiar la palabra manualmente',total:'Total adivinado',placeholder:'Por ejemplo, Mykola',savedGame:'Partida guardada'},
};

export const WHOAMI_RULES = {
 uk: {
  label: 'Правила', description: 'Відгадай своє приховане слово, ставлячи запитання, на які інші відповідають лише «так» або «ні».',
  sections: [
   { title: 'Підготовка', items: ['Додайте імена гравців, оберіть категорію та складність. Після старту кожен отримає приховане слово.', 'У додаткових налаштуваннях можна вписати власні слова та грати лише з ними.'] },
   { title: 'Як вгадувати', items: ['Передайте телефон іншим: вони відкривають картку гравця й утримують кнопку показу. Свою картку не підглядайте.', 'Ставте запитання про своє слово. Інші гравці відповідають лише «так» або «ні», не називаючи саме слово.'] },
   { title: 'Вгадав або здаюся', items: ['Позначайте вгадані слова й пропуски відповідними кнопками на картці гравця.', 'Після відповіді гравець отримує нове приховане слово, якщо в наборі є доступні картки.'] },
   { title: 'Таймер і підсумок', items: ['Таймер необов’язковий: його можна ввімкнути й налаштувати в додаткових налаштуваннях. Сигнал повідомляє про кінець часу, але не завершує гру автоматично.', 'Натисніть «Завершити гру», щоб переглянути кількість вгаданих слів і пропусків кожного гравця.'] },
  ],
 },
 en: {
  label: 'Rules', description: 'Guess your hidden word by asking questions that the others can answer only with yes or no.',
  sections: [
   { title: 'Preparation', items: ['Add player names and choose a category and difficulty. Each player gets a hidden word when the game starts.', 'Advanced settings let you add your own words and play with only those words.'] },
   { title: 'How to guess', items: ['Pass the phone to the others: they open a player’s card and hold the reveal button. Do not look at your own card.', 'Ask questions about your word. The other players answer only yes or no, without saying the word itself.'] },
   { title: 'Guessed or give up', items: ['Use the buttons on the player’s card to record a correct guess or a skip.', 'After an answer, the player receives another hidden word if any suitable cards remain in the set.'] },
   { title: 'Timer and results', items: ['The timer is optional and can be enabled and adjusted in advanced settings. Its signal announces the end of the time, but does not finish the game automatically.', 'Choose Finish game to see each player’s guessed and skipped word counts.'] },
  ],
 },
 sv: {
  label: 'Regler', description: 'Gissa ditt dolda ord genom att ställa frågor som de andra bara får besvara med ja eller nej.',
  sections: [
   { title: 'Förberedelser', items: ['Lägg till spelarnas namn och välj kategori och svårighetsgrad. Varje spelare får ett dolt ord när spelet börjar.', 'Under Fler inställningar kan ni lägga till egna ord och spela enbart med dem.'] },
   { title: 'Så gissar ni', items: ['Ge telefonen till de andra: de öppnar spelarens kort och håller inne knappen för att visa ordet. Titta inte på ditt eget kort.', 'Ställ frågor om ditt ord. De andra svarar bara ja eller nej utan att säga själva ordet.'] },
   { title: 'Rätt gissat eller ge upp', items: ['Använd knapparna på spelarens kort för att registrera rätt gissning eller ett överhoppat ord.', 'Efter svaret får spelaren ett nytt dolt ord om det finns tillgängliga kort i urvalet.'] },
   { title: 'Timer och resultat', items: ['Timern är valfri och kan aktiveras och justeras under Fler inställningar. Signalen meddelar att tiden är slut men avslutar inte spelet automatiskt.', 'Välj Avsluta spelet för att se varje spelares antal rätt gissade och överhoppade ord.'] },
  ],
 },
 de: {
  label: 'Regeln', description: 'Errate dein verborgenes Wort mit Fragen, die die anderen nur mit Ja oder Nein beantworten dürfen.',
  sections: [
   { title: 'Vorbereitung', items: ['Spielernamen hinzufügen und Kategorie sowie Schwierigkeit wählen. Beim Start bekommt jede Person ein verborgenes Wort.', 'Unter Weitere Einstellungen könnt ihr eigene Wörter hinzufügen und nur mit diesen spielen.'] },
   { title: 'So wird geraten', items: ['Gib den anderen das Telefon: Sie öffnen die Karte und halten die Anzeigetaste gedrückt. Schau nicht auf deine eigene Karte.', 'Stelle Fragen zu deinem Wort. Die anderen antworten nur mit Ja oder Nein, ohne das Wort selbst zu nennen.'] },
   { title: 'Erraten oder aufgeben', items: ['Mit den Tasten auf der Spielerkarte werden erratene und übersprungene Wörter erfasst.', 'Danach erhält die Person ein neues verborgenes Wort, sofern noch passende Karten verfügbar sind.'] },
   { title: 'Timer und Ergebnis', items: ['Der Timer ist optional und lässt sich unter Weitere Einstellungen aktivieren und anpassen. Das Signal meldet das Zeitende, beendet das Spiel aber nicht automatisch.', 'Wähle Spiel beenden, um die erratenen und übersprungenen Wörter jeder Person zu zählen.'] },
  ],
 },
 es: {
  label: 'Reglas', description: 'Adivina tu palabra oculta haciendo preguntas que los demás solo pueden responder con sí o no.',
  sections: [
   { title: 'Preparación', items: ['Añade los nombres y elige categoría y dificultad. Cada jugador recibe una palabra oculta al empezar.', 'En Más ajustes podéis añadir palabras propias y jugar solo con ellas.'] },
   { title: 'Cómo adivinar', items: ['Pasa el teléfono a los demás: abren la tarjeta del jugador y mantienen pulsado el botón para mostrarla. No mires tu propia tarjeta.', 'Haz preguntas sobre tu palabra. Los demás responden solo sí o no, sin decir la palabra.'] },
   { title: 'Acertar o rendirse', items: ['Usa los botones de la tarjeta para registrar un acierto o una palabra pasada.', 'Después, el jugador recibe otra palabra oculta si quedan tarjetas disponibles en el conjunto.'] },
   { title: 'Temporizador y resultados', items: ['El temporizador es opcional y se activa y ajusta en Más ajustes. La señal avisa de que se acabó el tiempo, pero no termina la partida automáticamente.', 'Elige Finalizar partida para ver cuántas palabras acertó o pasó cada jugador.'] },
  ],
 },
};
