'use client';
import { useExperience } from '@/lib/experience-context';
import { Rose,Envelope } from './Illustrations';
import { CuteButton } from './CuteButton';
export function LoveLetter({next}:{next:()=>void}){const config=useExperience();return <><div className="eyebrow">WORDS I WANT YOU TO KEEP</div><h1 className="scene-title">{config.letterHeading}</h1><div className="letter-paper"><div className="letter-rose"><Rose/></div><div className="letter-envelope"><Envelope/></div><p className="letter-to">For {config.recipientName},</p><div className="letter-body">{config.letter}</div><p className="letter-closing">{config.closingLine}</p><p className="letter-signature">{config.signature || `Yours, ${config.senderName}`}</p></div><CuteButton onClick={next}>One more little thing →</CuteButton></>}
