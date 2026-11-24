import { Sun, Moon } from 'lucide-react';
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

const THEME_COPY={uk:['Темна тема','Світла тема'],en:['Dark theme','Light theme'],sv:['Mörkt tema','Ljust tema'],de:['Dunkles Design','Helles Design'],es:['Tema oscuro','Tema claro']};
export function SiteNavigation({ lang, setLang, label, onHome, theme, onTheme }) {
  return (
    <nav>
      <a className="site-logo" href={LANGUAGE_PATHS[lang]} aria-label="NickolasGames" onClick={event => { if (!onHome || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onHome(); }}>
        <img src={holmesLogo} alt="NickolasGames" width="1024" height="341" />
      </a>
      <div className="site-nav-controls"><LanguageSwitcher lang={lang} setLang={setLang} label={label} /><button type="button" className="theme-toggle" aria-label={(THEME_COPY[lang]||THEME_COPY.en)[theme==='dark'?1:0]} aria-pressed={theme==='dark'} onClick={onTheme}>{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button></div>
    </nav>
  );
}
