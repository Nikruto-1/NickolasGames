import { useEffect, useRef, useState } from 'react';
import { Download, Trash2, X, ShieldCheck } from 'lucide-react';
import { PRIVACY_COPY } from '../locales/privacy.js';
import { inspectGameData, clearGameData } from '../utils/privacy.js';

export function PrivacyPanel({ lang }) {
  const copy = PRIVACY_COPY[lang] || PRIVACY_COPY.en;
  const dialog = useRef(null);
  const trigger = useRef(null);
  const [tab, setTab] = useState('policy');
  const [records, setRecords] = useState({});
  const [failed, setFailed] = useState(false);
  const refresh = () => {
    try { setRecords(inspectGameData()); setFailed(false); } catch { setFailed(true); }
  };
  const open = () => { refresh(); if (!dialog.current.open) dialog.current.showModal(); };
  useEffect(() => {
    if (location.pathname.endsWith('/privacy/')) open();
  }, []);
  const close = () => {
    dialog.current.close();
    if (location.pathname.endsWith('/privacy/')) {
      history.replaceState(null, '', lang === 'en' ? '/' : '/' + lang + '/');
      dispatchEvent(new PopStateEvent('popstate'));
    }
    trigger.current?.focus();
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'NickolasGames-data.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <>
    <button className="footer-command" ref={trigger} onClick={open}><ShieldCheck size={18} aria-hidden="true" />{copy.title}</button>
    <dialog ref={dialog} className="privacy-dialog" aria-labelledby="privacy-title" onCancel={event => { event.preventDefault(); close(); }}>
      <header className="privacy-header"><h2 id="privacy-title">{copy.title}</h2><button className="icon-button" title={copy.close} aria-label={copy.close} onClick={close}><X size={20} /></button></header>
      <div className="privacy-tabs" role="tablist" aria-label={copy.title} onKeyDown={event => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 'policy' : event.key === 'End' ? 'data' : tab === 'policy' ? 'data' : 'policy';
        if (next === 'data') refresh();
        setTab(next);
        requestAnimationFrame(() => document.getElementById('privacy-' + next + '-tab')?.focus());
      }}>
        <button id="privacy-policy-tab" role="tab" aria-controls="privacy-policy" aria-selected={tab === 'policy'} onClick={() => setTab('policy')}>{copy.title}</button>
        <button id="privacy-data-tab" role="tab" aria-controls="privacy-data" aria-selected={tab === 'data'} onClick={() => { refresh(); setTab('data'); }}>{copy.data}</button>
      </div>
      <div id="privacy-policy" role="tabpanel" aria-labelledby="privacy-policy-tab" hidden={tab !== 'policy'}>
        <p>{copy.intro}</p>
        {copy.sections.map(([title, text]) => <section key={title}><h3>{title}</h3><p>{text}</p></section>)}
        <a href="mailto:kkosmacevskij@gmail.com">kkosmacevskij@gmail.com</a>
        <p className="policy-sources"><a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub Privacy Statement</a> · <a href="https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en" target="_blank" rel="noopener noreferrer">EU data protection rights</a></p>
      </div>
      <div id="privacy-data" role="tabpanel" aria-labelledby="privacy-data-tab" hidden={tab !== 'data'}>
        <p>{copy.note}</p>
        {failed ? <p role="status">{copy.failed}</p> : Object.keys(records).length ? <pre className="privacy-records">{JSON.stringify(records, null, 2)}</pre> : <p>{copy.empty}</p>}
        <div className="privacy-actions">
          <button className="btn" disabled={failed || !Object.keys(records).length} onClick={download}><Download size={18} />{copy.export}</button>
          <button className="btn danger" disabled={failed || !Object.keys(records).length} onClick={() => { if (window.confirm(copy.confirm)) { try { clearGameData(); location.reload(); } catch { setFailed(true); } } }}><Trash2 size={18} />{copy.remove}</button>
        </div>
      </div>
    </dialog>
  </>;
}
