'use client';
import { useState } from 'react';
import { AnimatePresence,motion } from 'framer-motion';
import { useExperience } from '@/lib/experience-context';
import { CuteButton } from './CuteButton';
export function MemoriesScreen({next}:{next:()=>void}){const {photos}=useExperience();const [index,setIndex]=useState(0);const item=photos[index];return <><div className="eyebrow">LITTLE MOMENTS, BIG FEELINGS</div><h1 className="scene-title">Our Memories ❤️</h1><div className="memory-stage"><AnimatePresence mode="wait"><motion.figure key={item.id} className="polaroid" initial={{opacity:0,x:25,rotate:3}} animate={{opacity:1,x:0,rotate:-2}} exit={{opacity:0,x:-25}} drag="x" dragConstraints={{left:0,right:0}} dragElastic={.25} onDragEnd={(_,info)=>{if(info.offset.x<-45)setIndex(i=>Math.min(photos.length-1,i+1));if(info.offset.x>45)setIndex(i=>Math.max(0,i-1));}}>
{/* Uploaded and signed media URLs are deliberately rendered without Next's optimizer. */}
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src={item.url} alt={item.caption||`Memory ${index+1}`} draggable={false}/><figcaption>{item.caption||'A little moment to keep ♡'}</figcaption></motion.figure></AnimatePresence></div><div className="memory-controls"><button disabled={index===0} onClick={()=>setIndex(i=>i-1)} aria-label="Previous memory">←</button><span>{index+1} / {photos.length}</span><button disabled={index===photos.length-1} onClick={()=>setIndex(i=>i+1)} aria-label="Next memory">→</button></div><p className="fine-print">Swipe to turn the page</p><CuteButton onClick={next}>Keep these close →</CuteButton></>}
