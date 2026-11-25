import { useEffect,useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { gameAudioEnabled, setGameAudioEnabled } from '../utils/gameAudioPreference.js';
import "./GameScreen.css";
import {GameFaq} from './GameFaq.jsx';
import {PlayerGuide} from "./PlayerGuide.jsx";
import {gameSearchCopy} from "../locales/gameSearchCopy.js";

const COPY = {
  uk: { back: "До всіх ігор", label: "Обери гру", intro: "Грай у своєму темпі — налаштування й прогрес зберігаються на цьому пристрої." },
  en: { back: "All games", label: "Choose a game", intro: "Play at your own pace. Your settings and progress stay on this device." },
  sv: { back: "Alla spel", label: "Välj ett spel", intro: "Spela i er egen takt. Inställningar och framsteg sparas på den här enheten." },
  de: { back: "Alle Spiele", label: "Spiel auswählen", intro: "Spielt in eurem Tempo. Einstellungen und Fortschritt bleiben auf diesem Gerät." },
  es: { back: "Todos los juegos", label: "Elige un juego", intro: "Jugad a vuestro ritmo. Los ajustes y el progreso se guardan en este dispositivo." }
};

const AUDIO_COPY={uk:['Звуки гри','Увімкнено','Вимкнено'],en:['Game sounds','On','Off'],sv:['Spelljud','På','Av'],de:['Spielklänge','An','Aus'],es:['Sonidos del juego','Activados','Desactivados']};
const GAME_KEYS = ["whoami", "crocodile", "alias", "truth", "checkers", "spy"];

export function GameScreen({ game, games, lang, onBack, onChoose, children }) {
  const copy = COPY[lang] || COPY.en;
  const [audio,setAudio]=useState(gameAudioEnabled);
  useEffect(()=>{const sync=()=>setAudio(gameAudioEnabled());window.addEventListener('nickolasgames-audio-change',sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener('nickolasgames-audio-change',sync);window.removeEventListener('storage',sync);};},[]);
  const labels=AUDIO_COPY[lang]||AUDIO_COPY.en;
  return (
    <div className="game-screen" data-game={game}>
      <header className="game-screen-header">
        <div className="wrap">
          <button type="button" className="game-back" onClick={onBack}>
            <span aria-hidden="true">←</span> {copy.back}
          </button>
          <button type="button" className="game-audio-toggle" aria-pressed={audio} aria-label={labels[0]} onClick={()=>{const next=!audio;if(setGameAudioEnabled(next))setAudio(next);}}>{audio?<Volume2 size={19} aria-hidden="true"/>:<VolumeX size={19} aria-hidden="true"/>}<span>{labels[1+Number(!audio)]}</span></button>
          <div className="game-screen-heading">
            <div>
              <p className="game-screen-kicker">NICKOLASGAMES</p>
              <h1>{games[game].n}</h1>
              <p>{gameSearchCopy(lang,game)?.[1]||copy.intro}</p>
            </div>
          </div>
          <nav className="game-screen-nav" aria-label={copy.label}>
            {GAME_KEYS.map(key => (
              <button key={key} type="button" aria-current={key === game ? "page" : undefined}
                className={"game-screen-tab" + (key === game ? " is-active" : "")}
                onClick={() => onChoose(key)}>{games[key].n}</button>
            ))}
          </nav>
        </div>
      </header>
      {children}
      <PlayerGuide lang={lang} game={game}/>
      <GameFaq lang={lang} game={game} games={games} onChoose={onChoose}/>
    </div>
  );
}
