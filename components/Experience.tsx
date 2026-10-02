'use client';
import { useEffect,useRef,useState } from 'react';
import { AnimatePresence,MotionConfig } from 'framer-motion';
import { Heart } from 'lucide-react';
import { type ExperienceConfig } from '@/lib/experience';
import { ExperienceContext } from '@/lib/experience-context';
import { themeStyle } from '@/lib/theme';
import { IntroScreen } from './IntroScreen';
import { LoveMeter } from './LoveMeter';
import { QuestionScreen } from './QuestionScreen';
import { DrawingGame } from './DrawingGame';
import { BouquetGame } from './BouquetGame';
import { MemoriesScreen } from './MemoriesScreen';
import { VideoScreen } from './VideoScreen';
import { PassedScreen } from './PassedScreen';
import { LoveLetter } from './LoveLetter';
import { FinalSurprise } from './FinalSurprise';
import { FloatingHearts } from './FloatingHearts';
import { ProgressIndicator } from './ProgressIndicator';
import { SceneTransition } from './SceneTransition';
import { SoundToggle,useLoveAudio } from './SoundToggle';
import { Envelope } from './Illustrations';

export function sceneNames(config:ExperienceConfig){return ['Hello','Love meter',...(config.questions.length?['Questions']:[]),'Draw a heart','Your bouquet',...(config.photos.length?['Memories']:[]),...(config.video?['Video']:[]),'Surprise','Love letter','Forever'];}
export function Experience({config,preview=false,previewScene}:{config:ExperienceConfig;preview?:boolean;previewScene?:string}) {
  const [scene,setScene]=useState(0);
  const names=sceneNames(config);
  const selected=previewScene && previewScene!=='Play all' ? Math.max(0,names.indexOf(previewScene)) : scene;
  const index=Math.min(selected,names.length-1);
  const {enabled,toggle,pop}=useLoveAudio(config.music?.url??'');
  const main=useRef<HTMLElement>(null);
  useEffect(()=>{if(index>0&&!preview)main.current?.focus({preventScroll:true});},[index,preview]);
  const next=()=>{pop();setScene(s=>Math.min(names.length-1,s+1));};
  const content:Record<string,React.ReactNode>={
    Hello:<IntroScreen next={next}/>, 'Love meter':<LoveMeter next={next} config={config.loveMeter}/>, Questions:<QuestionScreen next={next} pop={pop}/>,
    'Draw a heart':<DrawingGame next={next} pop={pop}/>, 'Your bouquet':<BouquetGame next={next} pop={pop}/>,
    Memories:<MemoriesScreen next={next}/>,Video:<VideoScreen next={next} onPlay={()=>{if(enabled)void toggle();}}/>,
    Surprise:<PassedScreen next={next} pop={pop}/>, 'Love letter':<LoveLetter next={next}/>, Forever:<FinalSurprise replay={()=>{pop();setScene(0);}}/>,
  };
  return <ExperienceContext value={config}><MotionConfig reducedMotion="user"><div className={`experience personalized ${preview?'is-preview':''}`} style={themeStyle(config.theme)}>
    <FloatingHearts rise={names[index]==='Forever'}/><header className="site-header"><div className="brand"><Heart size={20}/><span>a little love test.</span></div><SoundToggle enabled={enabled} toggle={toggle}/></header>
    <div className="experience-frame"><div className="top-note handwritten">a little something, a lot of love</div><div className="side-doodle left-doodle" aria-hidden="true"><span className="doodle-heart">♡</span><span className="handwritten">made with<br/>all my heart</span></div><div className="side-doodle right-doodle" aria-hidden="true"><Envelope/><span className="handwritten">sealed with<br/>a little kiss</span></div>
      <main ref={main} tabIndex={-1} className={`paper-card scene-${index}`}><span className="tape tape-left" aria-hidden="true"/><span className="tape tape-right" aria-hidden="true"/>
        <AnimatePresence mode="wait"><SceneTransition key={names[index]}>{content[names[index]]}</SceneTransition></AnimatePresence><ProgressIndicator scene={index} labels={names}/>
      </main><p className="bottom-note handwritten">{config.anniversary?`Our little forever, since ${config.anniversary}`:'a tiny test for a very big love ♡'}</p>
    </div><footer className="site-footer"><span>MADE WITH LOVE, FOR {config.recipientName||'YOUR FAVORITE PERSON'}</span><span>from {config.senderName||'you'} <Heart size={11}/></span></footer>
  </div></MotionConfig></ExperienceContext>;
}
