import React from "react";
import { createRoot } from "react-dom/client";
import NickolasGames from "./NickolasGames.jsx";
import { startOfflineUpdates } from "./utils/pwaUpdates";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NickolasGames />
  </React.StrictMode>
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    startOfflineUpdates({serviceWorker:navigator.serviceWorker,windowTarget:window,documentTarget:document,scriptUrl:`${import.meta.env.BASE_URL}sw.js`,buildId:__APP_BUILD_ID__}).catch(console.error);
  });
}
