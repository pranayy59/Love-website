'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Cat } from './Illustrations';
import { CuteButton } from './CuteButton';
import { activeSegments, messageIndex, type LoveMeterConfig } from '@/lib/love-meter';
import { useSavedMeter } from '@/lib/meter-storage';

const colors = ['#f2dce0','#efbdcb','#e89aaf','#d97592','#bd526e','#96354f'];
const milestones = [25,50,75,100];
export function LoveMeter({ next, config }: { next: () => void; config?: LoveMeterConfig & { minimum?: number } }) {
  const saved = useSavedMeter();
  const settings = config ?? saved;
  const [value,setValue] = useState(0);
  const [bursts,setBursts] = useState<number[]>([]);
  const [ready,setReady] = useState(false);
  const seen = useRef(new Set<number>());
  const reduced = useReducedMotion();
  const inputId = useId();
  const range = messageIndex(value);
  const minimum = config?.minimum ?? 100;
  const complete = value >= minimum;
  // Completion only unlocks after resting at 100; leaving it cancels the timer.
  useEffect(() => {
    if (!complete) return;
    const timer = setTimeout(() => setReady(true),1100);
    return () => clearTimeout(timer);
  },[complete]);
  function change(nextValue: number) {
    const crossed = milestones.filter(m => nextValue >= m && !seen.current.has(m));
    crossed.forEach(m => seen.current.add(m));
    if (crossed.length) setBursts(previous => [...previous,...crossed]);
    if (nextValue < minimum) setReady(false);
    setValue(nextValue);
  }
  return <>
    <div className="eyebrow">01 / A LITTLE LOVE CHECK</div>
    <div className="meter-cat">
      <motion.div animate={bursts.includes(100) && !reduced ? {y:[0,-12,0]} : {y:0}} transition={{duration:.65}}><Cat mood={value <= 30 ? 20 : value <= 70 ? 65 : 100}/></motion.div>
      <span className="meter-mood" aria-hidden="true">{value <= 30 ? '﹏' : value <= 70 ? '♡' : '♡ ♡'}</span>
      <AnimatePresence>{bursts.map(m => <motion.div key={m} data-testid={`milestone-${m}`} className="meter-burst" aria-hidden="true"
        initial={{opacity:1}} animate={{opacity:0}} transition={{duration:reduced ? .01 : 1.6}}
        onAnimationComplete={() => setBursts(previous => previous.filter(n => n !== m))}>
        {Array.from({length:m===100?14:m===75?5:m===50?2:1},(_,i) => <motion.span key={i}
          initial={{x:0,y:0,scale:.3}} animate={reduced?{}:{x:Math.cos(i*2.4)*(m===100?110:65),y:-35-(i%4)*25,scale:1}}
          transition={{duration:1.3}}>{m===100 && i%3===0 ? '✧' : '♥'}</motion.span>)}
      </motion.div>)}</AnimatePresence>
    </div>
    <h1 className="scene-title">{settings.question}</h1>
    <motion.div className="gauge" animate={bursts.includes(100) && !reduced ? {scale:[1,1.035,1]} : {scale:1}} transition={{duration:.55}}>
      <svg viewBox="0 0 300 180" aria-hidden="true">
        {colors.map((color,i) => {
          const a=Math.PI+i*Math.PI/6+.025,b=Math.PI+(i+1)*Math.PI/6-.025;
          const active=i<activeSegments(value);
          return <motion.path key={color} data-testid="gauge-segment" data-active={active}
            d={`M ${150+118*Math.cos(a)} ${145+118*Math.sin(a)} A 118 118 0 0 1 ${150+118*Math.cos(b)} ${145+118*Math.sin(b)}`}
            fill="none" initial={false} animate={{stroke:active?color:'#f4e8e9'}} transition={{duration:.25}} strokeWidth="27"/>;
        })}
        {/* Local SVG coordinates keep the pivot fixed at the gauge's bottom center. */}
        <g transform="translate(150 145)">
          <motion.line data-testid="meter-needle" data-angle={value*1.8-90} x1="0" y1="0" x2="0" y2="-108"
            initial={false} animate={{rotate:value*1.8-90}} style={{transformOrigin:'0px 0px'}}
            transition={reduced?{duration:0}:{type:'spring',stiffness:180,damping:26}}
            stroke="#753448" strokeWidth="4" strokeLinecap="round"/>
        </g>
        <circle cx="150" cy="145" r="8" fill="#753448"/>
        <text x="150" y="110" textAnchor="middle" className="gauge-number">{value}%</text>
        <text x="150" y="177" textAnchor="middle" className="gauge-love">love</text>
      </svg>
    </motion.div>
    <label className="sr-only" htmlFor={inputId}>{settings.question}</label>
    <input id={inputId} className="love-slider" type="range" min="0" max="100" step="1" value={value} aria-valuetext={`${value}%`}
      style={{background:`linear-gradient(to right, #ad435e ${value}%, #f0e3e3 ${value}%)`}} onChange={e=>change(Number(e.target.value))}/>
    <div className="range-labels meter-labels"><span>{settings.leftLabel}</span>
      <motion.span animate={{color:value>70?'#ad435e':'#94737b',scale:value>90?1.035:1}} style={{transformOrigin:'right center'}} transition={{duration:.3}}>{settings.rightLabel}</motion.span>
    </div>
    <div className="meter-reaction" role="status" aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p key={range} className="feedback" initial={{opacity:0,y:7,scale:value>70?.96:1}}
          animate={{opacity:1,y:0,scale:1,x:value<=30&&!reduced?[0,-2,2,0]:0}} exit={{opacity:0,y:-7}} transition={{duration:reduced?0:.25}}>{settings.messages[range]}</motion.p>
      </AnimatePresence>
    </div>
    <div className="meter-completion"><AnimatePresence>{complete && ready && <motion.div key="completion" initial={{opacity:0,y:7}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
      <p className="meter-correct">{settings.completionMessage}</p><CuteButton onClick={next}>{settings.continueText}</CuteButton>
    </motion.div>}</AnimatePresence></div>
  </>;
}
