'use client';
import { motion, useReducedMotion } from 'framer-motion';
export function FloatingHearts({ rise=false }: { rise?: boolean }){const reduced=useReducedMotion();return <div className="floating-hearts" aria-hidden="true">{Array.from({length:9},(_,i)=><motion.span key={i} style={{left:`${8+i*11}%`,top:`${15+(i*23)%70}%`}} animate={reduced?{}:rise?{y:[100,-650],opacity:[0,.6,0],rotate:[-12,12]}:{y:[15,-20,15],rotate:[-12,12,-12]}} transition={{duration:6+i,repeat:Infinity}}>{i%3===0?'✧':'♡'}</motion.span>)}</div>}
