'use client';
import { Cat } from './Illustrations';
import { CuteButton } from './CuteButton';
import { useExperience } from '@/lib/experience-context';
export function IntroScreen({next}:{next:()=>void}){const config=useExperience();return <><div className="eyebrow">A LITTLE ADVENTURE, JUST FOR YOU</div><h1>Hey {config.nickname || config.recipientName || 'You'}! <span className="heading-heart">♡</span></h1><p className="intro-copy">{config.introMessage}</p><div className="cat-stage"><span className="handwritten cat-note">psst... this is for you</span><Cat/><span className="small-heart">♡</span></div><p className="intro-description">A few little questions. A sprinkle of magic.<br/>And a whole lot of love.</p><CuteButton onClick={next}>Start the Love Test <span>♡ &nbsp;→</span></CuteButton><p className="fine-print">Takes a few minutes. Stays in my heart forever.</p></>}
