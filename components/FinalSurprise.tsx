'use client';
import { motion } from 'framer-motion';
import { useExperience } from '@/lib/experience-context';
import { Cat } from './Illustrations';
import { CuteButton } from './CuteButton';
export function FinalSurprise({replay}:{replay:()=>void}){const config=useExperience();return <><div className="eyebrow">MY FAVORITE ENDING IS YOU</div><p className="handwritten final-preface">{config.finalIntro}</p><motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:1,duration:.8}}><h1 className="final-title">{config.finalMessage}</h1><p className="scene-description">{config.finalSubtitle}</p></motion.div><Cat couple/><p className="handwritten">Love, {config.senderName}</p><CuteButton secondary onClick={replay}>Replay our love test ↻</CuteButton><p className="fine-print">The answer will always be you.</p></>}
