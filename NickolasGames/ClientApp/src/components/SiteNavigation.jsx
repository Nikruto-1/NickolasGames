import holmesLogo from "../assets/holmes-logo.webp";
import { LANGUAGE_PATHS } from "../utils/siteMetadata.js";

const LANGS = [
  { code: "uk", short: "UA", label: "Українська" },
  { code: "en", short: "EN", label: "English" },
  { code: "sv", short: "SV", label: "Svenska" },
  { code: "de", short: "DE", label: "Deutsch" },
  { code: "es", short: "ES", label: "Español" },
];

export function LanguageSwitcher({ lang, setLang, label }) {
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

export function SiteNavigation({ lang, setLang, label, onHome }) {
  return (
    <nav>
      <a className="site-logo" href={LANGUAGE_PATHS[lang]} aria-label="NickolasGames" onClick={event => { if (!onHome || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onHome(); }}>
        <img src={holmesLogo} alt="NickolasGames" width="1024" height="341" />
      </a>
      <LanguageSwitcher lang={lang} setLang={setLang} label={label} />
    </nav>
  );
}
