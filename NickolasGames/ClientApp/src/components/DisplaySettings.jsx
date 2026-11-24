import {useEffect,useRef,useState} from 'react';
import {Settings,X} from 'lucide-react';
import {readDisplay,saveDisplay,applyDisplay,DEFAULT_DISPLAY} from '../utils/displayPreferences.js';
import {gameAudioEnabled,setGameAudioEnabled} from '../utils/gameAudioPreference.js';
import './DisplaySettings.css';
const COPY={
 uk:['Налаштування','Закрити','Звуки ігор','Анімації','Як у системі','Зменшені','Збільшений текст','Скинути налаштування','Не вдалося зберегти налаштування','Зміни зберігаються на цьому пристрої.'],
 en:['Settings','Close','Game sounds','Animations','System default','Reduced','Larger text','Reset settings','Could not save settings','Changes stay on this device.'],
 sv:['Inställningar','Stäng','Spelljud','Animationer','Systemstandard','Minskade','Större text','Återställ inställningar','Kunde inte spara inställningarna','Ändringar sparas på den här enheten.'],
 de:['Einstellungen','Schließen','Spielklänge','Animationen','Systemstandard','Reduziert','Größerer Text','Einstellungen zurücksetzen','Einstellungen konnten nicht gespeichert werden','Änderungen bleiben auf diesem Gerät.'],
 es:['Ajustes','Cerrar','Sonidos del juego','Animaciones','Según el sistema','Reducidas','Texto más grande','Restablecer ajustes','No se pudieron guardar los ajustes','Los cambios se guardan en este dispositivo.']
};
export function DisplaySettings({lang}){
 const c=COPY[lang]||COPY.en;
 const dialog=useRef(null),trigger=useRef(null);
 const [prefs,setPrefs]=useState(readDisplay),[audio,setAudio]=useState(gameAudioEnabled),[error,setError]=useState(false);
 useEffect(()=>{applyDisplay(prefs);},[prefs]);
 const update=next=>{if(saveDisplay(next)){setPrefs(next);setError(false);}else setError(true);};
 const audioUpdate=next=>{if(setGameAudioEnabled(next)){setAudio(next);setError(false);}else setError(true);};
 const close=()=>{dialog.current?.close();trigger.current?.focus();};
 return <><button ref={trigger} type="button" className="display-settings-trigger" aria-label={c[0]} title={c[0]} onClick={()=>{setAudio(gameAudioEnabled());setError(false);dialog.current?.showModal();}}><Settings size={19}/></button>
 <dialog ref={dialog} className="display-settings" aria-labelledby="display-settings-title" onCancel={e=>{e.preventDefault();close();}}>
 <header><h2 id="display-settings-title">{c[0]}</h2><button type="button" className="display-settings-close" aria-label={c[1]} onClick={close}><X size={20}/></button></header>
 <label><input type="checkbox" checked={audio} onChange={e=>audioUpdate(e.target.checked)}/>{c[2]}</label>
 <label>{c[3]}<select value={prefs.motion} onChange={e=>update({...prefs,motion:e.target.value})}><option value="system">{c[4]}</option><option value="reduced">{c[5]}</option></select></label>
 <label><input type="checkbox" checked={prefs.largeText} onChange={e=>update({...prefs,largeText:e.target.checked})}/>{c[6]}</label>
 <p>{c[9]}</p>{error&&<p role="alert">{c[8]}</p>}
 <button type="button" className="btn" onClick={()=>{const ok=saveDisplay(DEFAULT_DISPLAY),soundOk=setGameAudioEnabled(true);if(ok)setPrefs({...DEFAULT_DISPLAY});if(soundOk)setAudio(true);setError(!ok||!soundOk);}}>{c[7]}</button>
 </dialog></>;
}
