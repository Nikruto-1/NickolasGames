import { PlayerReviews } from './PlayerReviews.jsx';
import {OfflineDownload} from './OfflineDownload.jsx';
import { ResultsHistory } from './ResultsHistory.jsx';
import { CustomLibrary } from './CustomLibrary.jsx';
import { Hero, GamesGrid, HowItWorks, FinalCta } from "./HomeSections.jsx";
import {PlayerGuide} from "./PlayerGuide.jsx";

export default function HomeScreen({t,lang,library,updateLibrary,choose,requestStart}) {
 return <>
        <Hero t={t} onStart={requestStart} />
        <GamesGrid games={t.games} t={t} lang={lang} onPlay={choose} />
        <PlayerReviews key={lang} lang={lang} t={t}/>
        <CustomLibrary key={lang} items={library} onSave={updateLibrary} lang={lang} t={t} />
        <ResultsHistory key={lang} lang={lang} t={t}/>
        <OfflineDownload lang={lang}/>
        <HowItWorks t={t} />
        <PlayerGuide lang={lang}/>
        <FinalCta t={t} onStart={requestStart} />
 </>;
}
