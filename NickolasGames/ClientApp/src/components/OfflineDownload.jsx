import {useEffect,useState} from 'react';
import {requestOffline} from '../utils/offlineDownload.js';
const COPY={
 uk:['Ігри без інтернету','Завантаж усі ігри на цей пристрій, щоб відкрити їх навіть без мережі.','Завантажити для офлайн-гри','Завантаження…','Усі ресурси ігор збережено','Не вдалося завантажити. Перевір інтернет і вільне місце та спробуй ще раз.','Після оновлення сайту може знадобитися повторне завантаження.'],
 en:['Games without internet','Download all games on this device so you can open them without a connection.','Download for offline play','Downloading…','All game resources are saved','Download failed. Check your connection and storage and try again.','After a site update, another download may be needed.'],
 sv:['Spela utan internet','Ladda ner alla spel på enheten för att spela utan uppkoppling.','Ladda ner för offlinespel','Laddar ner…','Alla spelresurser är sparade','Nedladdningen misslyckades. Kontrollera nätverk och lagring.','Efter en uppdatering kan en ny nedladdning behövas.'],
 de:['Spielen ohne Internet','Lade alle Spiele auf dieses Gerät, um sie offline zu öffnen.','Für Offline-Spiele herunterladen','Wird heruntergeladen…','Alle Spielressourcen gespeichert','Download fehlgeschlagen. Prüfe Verbindung und Speicher.','Nach einem Update kann ein neuer Download nötig sein.'],
 es:['Juegos sin internet','Descarga todos los juegos en este dispositivo para abrirlos sin conexión.','Descargar para jugar sin conexión','Descargando…','Todos los recursos guardados','Error de descarga. Comprueba la conexión y el espacio libre.','Tras una actualización puede ser necesaria otra descarga.']
};
export function OfflineDownload({lang}){
 const c=COPY[lang]||COPY.en;const [state,setState]=useState('idle');
 useEffect(()=>{
  const worker=navigator.serviceWorker;if(!worker)return;
  let active=true;
  const check=()=>requestOffline('OFFLINE_STATUS',worker).then(value=>{if(active)setState(old=>old==='busy'?old:value.ready?'ready':'idle');});
  check();worker.addEventListener('controllerchange',check);
  return()=>{active=false;worker.removeEventListener('controllerchange',check);};
 },[]);
 if(!('serviceWorker' in navigator))return null;
 const download=async()=>{setState('busy');const result=await requestOffline('OFFLINE_DOWNLOAD');setState(result.ready?'ready':'error');};
 return <section className="s custom-library" id="offline-download"><div className="wrap"><h2>{c[0]}</h2><p>{c[1]}</p><button className="btn pri" type="button" disabled={state==='busy'||state==='ready'} onClick={download}>{c[state==='busy'?3:state==='ready'?4:2]}</button><p>{c[6]}</p>{state==='error'&&<p role="alert">{c[5]}</p>}</div></section>;
}
