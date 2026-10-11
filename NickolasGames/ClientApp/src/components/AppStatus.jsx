import { useEffect, useState } from "react";
export const PROGRESS_COPY = {
 uk: {saved:"Прогрес зберігається на цьому пристрої автоматично.",restored:"Прогрес відновлено. Таймер на паузі.",failed:"Не вдалося зберегти прогрес. Перевірте сховище браузера.",newGame:"Нова гра",confirm:"Очистити рахунок і картки поточної гри?",resume:"Продовжити таймер",install:"Встановити гру",offline:"Ви офлайн",ready:"Гра готова до офлайн-режиму",loading:"Для підготовки офлайн-режиму потрібен інтернет",details:"Детальніше",hideDetails:"Згорнути",android:"На Android: Chrome → меню ⋮ → Встановити застосунок або На головний екран.",ios:"На iPhone: Safari → Поділитися → На початковий екран."},
 en: {saved:"Progress is saved automatically on this device.",restored:"Progress restored. Timer paused.",failed:"Progress could not be saved. Check browser storage.",newGame:"New game",confirm:"Clear the score and cards for this game?",resume:"Resume timer",install:"Install game",offline:"You are offline",ready:"Ready to play offline",loading:"Internet is needed to prepare offline mode",details:"Learn more",hideDetails:"Hide details",android:"On Android: Chrome → menu ⋮ → Install app or Add to Home screen.",ios:"On iPhone: Safari → Share → Add to Home Screen."},
 sv: {saved:"Framsteg sparas automatiskt på den här enheten.",restored:"Spelet återställt. Timern är pausad.",failed:"Kunde inte spara. Kontrollera webbläsarens lagring.",newGame:"Nytt spel",confirm:"Rensa poäng och kort för detta spel?",resume:"Fortsätt timern",install:"Installera spelet",offline:"Du är offline",ready:"Redo att spela offline",loading:"Internet behövs för att förbereda offlineläget",details:"Läs mer",hideDetails:"Dölj detaljer",android:"På Android: Chrome → menyn ⋮ → Installera app eller Lägg till på startskärmen.",ios:"På iPhone: Safari → Dela → Lägg till på hemskärmen."},
 de: {saved:"Der Fortschritt wird automatisch auf diesem Gerät gespeichert.",restored:"Spiel wiederhergestellt. Timer pausiert.",failed:"Speichern fehlgeschlagen. Browserspeicher prüfen.",newGame:"Neues Spiel",confirm:"Punkte und Karten dieses Spiels zurücksetzen?",resume:"Timer fortsetzen",install:"Spiel installieren",offline:"Du bist offline",ready:"Bereit zum Offline-Spielen",loading:"Internet wird zur Vorbereitung des Offline-Modus benötigt",details:"Mehr erfahren",hideDetails:"Details ausblenden",android:"Auf Android: Chrome → Menü ⋮ → App installieren oder Zum Startbildschirm hinzufügen.",ios:"Auf dem iPhone: Safari → Teilen → Zum Home-Bildschirm."},
 es: {saved:"El progreso se guarda automáticamente en este dispositivo.",restored:"Partida restaurada. Temporizador en pausa.",failed:"No se pudo guardar. Revisa el almacenamiento del navegador.",newGame:"Nueva partida",confirm:"¿Borrar la puntuación y las cartas de esta partida?",resume:"Continuar temporizador",install:"Instalar juego",offline:"Sin conexión",ready:"Listo para jugar sin conexión",loading:"Se necesita internet para preparar el modo sin conexión",details:"Más información",hideDetails:"Ocultar detalles",android:"En Android: Chrome → menú ⋮ → Instalar aplicación o Añadir a pantalla de inicio.",ios:"En iPhone: Safari → Compartir → Añadir a pantalla de inicio."}
};
export function AppStatus({lang}) {
 const t = PROGRESS_COPY[lang] || PROGRESS_COPY.en;
 const [prompt, setPrompt] = useState(null);
 const [detailsOpen, setDetailsOpen] = useState(false);
 const [online, setOnline] = useState(navigator.onLine);
 const [ready, setReady] = useState(false);
 const [installed, setInstalled] = useState(() => matchMedia("(display-mode: standalone)").matches || navigator.standalone);
 useEffect(() => {
   const update = () => setOnline(navigator.onLine);
   const install = e => { e.preventDefault(); setPrompt(e); };
   const done = () => {setInstalled(true); setPrompt(null);};
   addEventListener("online", update); addEventListener("offline", update);
   addEventListener("beforeinstallprompt", install); addEventListener("appinstalled", done);
   let active = true;
   if ("serviceWorker" in navigator) navigator.serviceWorker.ready.then(() => {if(active) setReady(true);});
   return () => {active = false; removeEventListener("online", update); removeEventListener("offline", update); removeEventListener("beforeinstallprompt", install); removeEventListener("appinstalled", done);};
 }, []);
 return <aside className="wrap app-status" aria-label="App status">
   <div className="app-status-line">
     <p role="status">{!online ? `${t.offline} · ` : ""}{ready ? t.ready : t.loading}</p>
     {!installed && <button type="button" className="app-status-more" aria-expanded={detailsOpen} aria-controls="app-install-details" onClick={() => setDetailsOpen(open => !open)}>
       {detailsOpen ? t.hideDetails : t.details}
     </button>}
   </div>
   {!installed && <div id="app-install-details" className="app-install-details" hidden={!detailsOpen}>
     <p>{t.android}</p>
     <p>{t.ios}</p>
     {prompt && <button className="btn sm" onClick={async () => {await prompt.prompt(); await prompt.userChoice; setPrompt(null);}}>{t.install}</button>}
   </div>}
 </aside>;
}
