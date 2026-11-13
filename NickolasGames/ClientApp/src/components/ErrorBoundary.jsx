import React from "react";
import { LANGUAGE_PATHS, initialLanguage } from "../utils/siteMetadata.js";
import "./ErrorBoundary.css";

const COPY = {
  uk: { code: "Помилка", title: "Щось пішло не так", text: "Холмс натрапив на помилку. Спробуй перезавантажити гру або повернися на головну.", retry: "Спробувати ще раз", home: "На головну", label: "Помилка гри" },
  en: { code: "Error", title: "Something went wrong", text: "Holmes ran into a problem. Try loading the game again or return to the home page.", retry: "Try again", home: "Home", label: "Game error" },
  sv: { code: "Fel", title: "Något gick fel", text: "Holmes stötte på ett problem. Försök ladda spelet igen eller gå tillbaka till startsidan.", retry: "Försök igen", home: "Startsida", label: "Spelfel" },
  de: { code: "Fehler", title: "Etwas ist schiefgelaufen", text: "Holmes ist auf ein Problem gestoßen. Lade das Spiel erneut oder kehre zur Startseite zurück.", retry: "Erneut versuchen", home: "Startseite", label: "Spielfehler" },
  es: { code: "Error", title: "Algo salió mal", text: "Holmes encontró un problema. Intenta cargar el juego de nuevo o vuelve al inicio.", retry: "Intentar de nuevo", home: "Inicio", label: "Error del juego" }
};

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error("NickolasGames UI error", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    const lang = initialLanguage();
    const t = COPY[lang] || COPY.en;
    return (
      <main className="ng-error-page" lang={lang}>
        <div className="ng-error-panel" role="alert" aria-label={t.label}>
          <span className="ng-error-brand">NickolasGames</span>
          <p className="ng-error-code">{t.code}</p>
          <h1>{t.title}</h1>
          <p className="ng-error-copy">{t.text}</p>
          <div className="ng-error-actions">
            <button type="button" className="ng-error-primary" onClick={() => window.location.reload()}>{t.retry}</button>
            <a className="ng-error-secondary" href={LANGUAGE_PATHS[lang] || "/"}>{t.home}</a>
          </div>
        </div>
      </main>
    );
  }
}
