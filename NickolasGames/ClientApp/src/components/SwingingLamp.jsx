import {useId} from 'react';
import './SwingingLamp.css';

// Adapted from the supplied SwingingLamp.jsx: pendant, metal shade, bulb,
// warm diffused cone, drop entrance and pendulum. Theme is inherited from :root.
export default function SwingingLamp(){
 const id=useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const paint=name=>`url(#${id}-${name})`;
 return <div className="holmes-lamp" aria-hidden="true">
  <div className="holmes-lamp-drop">
   <span className="holmes-lamp-mount"/>
   <div className="holmes-lamp-pivot">
    <svg className="holmes-lamp-light" viewBox="0 0 320 420" preserveAspectRatio="none" focusable="false">
     <defs>
      <linearGradient id={id+'-cone'} x1="0" y1="0" x2="0" y2="100%">
       <stop offset="0%" stopColor="#ffd27a" stopOpacity=".55"/><stop offset="60%" stopColor="#ffd27a" stopOpacity=".18"/><stop offset="100%" stopColor="#ffd27a" stopOpacity="0"/>
      </linearGradient>
      <filter id={id+'-blur'} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
     </defs>
     <polygon className="holmes-lamp-cone" points="116,0 204,0 320,420 0,420" fill={paint('cone')} filter={paint('blur')}/>
    </svg>
    <span className="holmes-lamp-cord"/>
    <svg className="holmes-lamp-art" viewBox="0 0 150 145" focusable="false">
     <defs>
      <linearGradient id={id+'-shade'}>
       <stop offset="0%" stopColor="#14151a"/><stop offset="22%" stopColor="#3b3f4b"/><stop offset="38%" stopColor="#6a6f7e"/><stop offset="55%" stopColor="#2b2e37"/><stop offset="100%" stopColor="#0f1015"/>
      </linearGradient>
      <radialGradient id={id+'-inner'} cx="50%" cy="0%" r="90%"><stop stopColor="#fff6d6"/><stop offset="45%" stopColor="#ffd27a"/><stop offset="100%" stopColor="#c47a1a"/></radialGradient>
      <radialGradient id={id+'-bulb'} cx="50%" cy="45%" r="55%"><stop stopColor="#fff"/><stop offset="50%" stopColor="#fff0b8"/><stop offset="100%" stopColor="#ffd27a"/></radialGradient>
      <radialGradient id={id+'-halo'}><stop stopColor="#ffd27a" stopOpacity=".85"/><stop offset="100%" stopColor="#ffd27a" stopOpacity="0"/></radialGradient>
      <filter id={id+'-soft'}><feGaussianBlur stdDeviation="2.2"/></filter>
     </defs>
     <g>
      <rect x="66" y="0" width="18" height="14" rx="3" fill={paint('shade')}/>
      <rect x="62" y="12" width="26" height="6" rx="3" fill="#20222a"/>
      <path d="M 5 80 C 8 50, 30 16, 75 16 C 120 16, 142 50, 145 80 A 70 13 0 0 1 5 80 Z" fill={paint('shade')}/>
      <path d="M 48 34 C 36 44, 28 58, 25 70" stroke="#fff" strokeOpacity=".35" strokeWidth="4" strokeLinecap="round" fill="none" filter={paint('soft')}/>
      <ellipse cx="75" cy="80" rx="70" ry="13" fill="none" stroke="#0b0c10" strokeWidth="2"/>
      <ellipse cx="75" cy="80" rx="68" ry="11.5" fill="none" stroke="#8b90a0" strokeOpacity=".35"/>
      <ellipse cx="75" cy="80.5" rx="65" ry="10" fill="#0d0e12"/>
      <ellipse cx="75" cy="80.5" rx="65" ry="10" fill={paint('inner')}/>
      <circle cx="75" cy="106" r="60" fill={paint('halo')}/>
      <rect x="66" y="70" width="18" height="20" rx="3" fill={paint('shade')}/>
      <rect x="66" y="78" width="18" height="2" fill="#0b0c10" opacity=".55"/>
      <rect x="66" y="83" width="18" height="2" fill="#0b0c10" opacity=".55"/>
      <rect x="64" y="88" width="22" height="4" rx="2" fill="#1d1f26"/>
      <path d="M 66 91 C 53 99, 53 121, 75 128 C 97 121, 97 99, 84 91 Z" fill={paint('bulb')}/>
      <path d="M 70 95 L 71 107 L 75 101 L 79 107 L 80 95" stroke="#e08a1e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M 63 103 C 62 110, 64 116, 68 120" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" fill="none"/>
     </g>
    </svg>
   </div>
  </div>
 </div>;
}
