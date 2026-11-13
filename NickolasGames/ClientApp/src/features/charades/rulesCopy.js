export const CHARADES_RULES = {
  uk: {
    label: 'Правила',
    description: 'Показуй слова жестами, відгадуй те, що показують інші, і набирай бали. Кожен грає за себе.',
    sections: [
      { title: 'Підготовка', items: ['Додайте щонайменше двох гравців. Оберіть категорію, режим часу та кількість балів для перемоги.', 'Показуйте по черзі в порядку списку. Телефон із карткою бачить лише той, хто показує.'] },
      { title: 'Твій хід', items: ['Відкрий картку й обери одне з трьох слів: легке, середнє або складне. Показуй без розмов та предметів.', 'Коли слово вгадали, натисни «Вгадав» і вибери гравця, який його назвав. Пропуск завершує хід без балів і штрафу.'] },
      { title: 'Бали та бонус за швидкість', items: ['За легке слово обом гравцям по 1 балу, за середнє по 2, за складне по 3.', 'У режимі «1 хвилина» той, хто показував, додатково отримує +2 бали за відповідь до 20 секунд включно або +1 до 40 секунд включно. Після 40 секунд бонусу немає.'] },
      { title: 'Коли хвилина минула', items: ['Таймер починається після вибору слова. Після сигналу можна продовжити показувати: бали за слово отримає лише той, хто вгадав, а той, хто показував, отримає 0.', 'У режимі «Без часу» обмеження й бонусу за швидкість немає. Обом гравцям нараховуються однакові бали за складність слова.'] },
      { title: 'Хто перемагає', items: ['Коли хтось набере обрану кількість балів, дограйте коло, щоб усі мали однакову кількість ходів.', 'Після завершення кола виграє найбільший рахунок. Якщо найкращий результат однаковий у кількох гравців, вони ділять перемогу.'] },
    ],
  },
  en: {
    label: 'Rules',
    description: 'Act out words, guess what others are showing and earn points. Every player competes individually.',
    sections: [
      { title: 'Set up', items: ['Add at least two players. Choose a category, time mode and winning score.', 'Take turns in list order. Only the actor should see the phone with the card.'] },
      { title: 'Your turn', items: ['Reveal the card and choose one of three words: easy, medium or hard. Act it out without speaking or props.', 'When someone guesses, press Guessed and select that player. Skipping ends the turn without points or a penalty.'] },
      { title: 'Points and speed bonus', items: ['Both players earn 1 point for an easy word, 2 for medium or 3 for hard.', 'In 1-minute mode, the actor also earns +2 for an answer within 20 seconds, or +1 within 40 seconds, including those limits. After that there is no bonus for the rest of the minute.'] },
      { title: 'When the minute ends', items: ['The timer starts when you choose a word. After the signal, you may keep acting: only the guesser earns the word points; the actor earns 0.', 'With no time limit, there is no speed bonus. Both players earn the same points for the difficulty of the word.'] },
      { title: 'Winning', items: ['When someone reaches the winning score, finish the round so everyone has the same number of turns.', 'The highest score at the end of the round wins. Players tied for the highest score share the win.'] },
    ],
  },
  sv: {
    label: 'Regler',
    description: 'Visa ord med gester, gissa vad andra visar och samla poäng. Alla spelar individuellt.',
    sections: [
      { title: 'Förberedelser', items: ['Lägg till minst två spelare. Välj kategori, tidsläge och poängmål.', 'Spela i listans ordning. Bara den som visar får se telefonen med kortet.'] },
      { title: 'Din tur', items: ['Visa kortet och välj ett av tre ord: lätt, medel eller svårt. Visa utan att prata eller använda rekvisita.', 'När någon gissar rätt, tryck på Gissat och välj den spelaren. Att hoppa över avslutar turen utan poäng eller avdrag.'] },
      { title: 'Poäng och snabbhetsbonus', items: ['Båda får 1 poäng för ett lätt ord, 2 för medel eller 3 för svårt.', 'I läget 1 minut får den som visar också +2 vid svar inom 20 sekunder eller +1 inom 40 sekunder, inklusive gränserna. Därefter ges ingen bonus under resten av minuten.'] },
      { title: 'När minuten är slut', items: ['Tiden börjar när du väljer ord. Efter signalen får du fortsätta visa: bara den som gissar får ordpoängen; den som visar får 0.', 'Utan tidsgräns ges ingen snabbhetsbonus. Båda får lika många poäng efter ordets svårighetsgrad.'] },
      { title: 'Vem vinner?', items: ['När någon når poängmålet slutför ni omgången så att alla får lika många turer.', 'Högst poäng efter omgången vinner. Om flera delar den högsta poängen delar de segern.'] },
    ],
  },
  de: {
    label: 'Regeln',
    description: 'Stelle Wörter mit Gesten dar, errate die Begriffe der anderen und sammle Punkte. Alle spielen für sich.',
    sections: [
      { title: 'Vorbereitung', items: ['Fügt mindestens zwei Spieler hinzu. Wählt Kategorie, Zeitmodus und Zielpunktzahl.', 'Spielt in der Reihenfolge der Liste. Nur die darstellende Person darf die Karte auf dem Telefon sehen.'] },
      { title: 'Dein Zug', items: ['Decke die Karte auf und wähle eines von drei Wörtern: leicht, mittel oder schwer. Stelle es ohne Sprechen oder Requisiten dar.', 'Wurde das Wort erraten, drücke Erraten und wähle die ratende Person. Überspringen beendet den Zug ohne Punkte oder Abzug.'] },
      { title: 'Punkte und Zeitbonus', items: ['Beide erhalten 1 Punkt für ein leichtes Wort, 2 für ein mittleres oder 3 für ein schweres.', 'Im Modus 1 Minute erhält die darstellende Person zusätzlich +2 bei einer Antwort bis einschließlich 20 Sekunden oder +1 bis einschließlich 40 Sekunden. Danach gibt es für den Rest der Minute keinen Bonus.'] },
      { title: 'Nach Ablauf der Minute', items: ['Die Zeit beginnt mit der Wortwahl. Nach dem Signal darfst du weitermachen: Nur die ratende Person erhält die Wortpunkte; für die Darstellung gibt es 0.', 'Ohne Zeitlimit gibt es keinen Zeitbonus. Beide erhalten dieselben Punkte für die Schwierigkeit des Wortes.'] },
      { title: 'Wer gewinnt?', items: ['Sobald jemand die Zielpunktzahl erreicht, spielt ihr die Runde zu Ende, damit alle gleich viele Züge haben.', 'Die höchste Punktzahl nach der Runde gewinnt. Bei Gleichstand auf dem ersten Platz wird der Sieg geteilt.'] },
    ],
  },
  es: {
    label: 'Reglas',
    description: 'Representa palabras con gestos, adivina lo que muestran los demás y suma puntos. Cada jugador compite por su cuenta.',
    sections: [
      { title: 'Preparación', items: ['Añadid al menos dos jugadores. Elegid categoría, modo de tiempo y puntuación para ganar.', 'Jugad en el orden de la lista. Solo quien representa la palabra debe ver la tarjeta en el teléfono.'] },
      { title: 'Tu turno', items: ['Muestra la tarjeta y elige una de tres palabras: fácil, media o difícil. Represéntala sin hablar ni usar objetos.', 'Cuando alguien acierte, pulsa Adivinada y elige a esa persona. Pasar termina el turno sin puntos ni penalización.'] },
      { title: 'Puntos y bono de rapidez', items: ['Ambos reciben 1 punto por una palabra fácil, 2 por una media o 3 por una difícil.', 'En el modo de 1 minuto, quien representa recibe además +2 si aciertan en 20 segundos o menos, o +1 en 40 segundos o menos. Después no hay bono durante el resto del minuto.'] },
      { title: 'Cuando termina el minuto', items: ['El tiempo empieza al elegir la palabra. Tras la señal puedes seguir: solo quien adivina recibe los puntos de la palabra; quien la representa recibe 0.', 'Sin límite de tiempo no hay bono de rapidez. Ambos reciben los mismos puntos según la dificultad de la palabra.'] },
      { title: 'Quién gana', items: ['Cuando alguien alcance la puntuación objetivo, terminad la ronda para que todos tengan el mismo número de turnos.', 'Gana la puntuación más alta al terminar la ronda. Si hay empate en el primer puesto, se comparte la victoria.'] },
    ],
  },
};
