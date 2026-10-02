'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useExperience } from '@/lib/experience-context';
import { Cat } from './Illustrations';
import { CuteButton } from './CuteButton';
export function QuestionScreen({next,pop}:{next:()=>void;pop:()=>void}) {
  const {questions}=useExperience();
  const [index,setIndex]=useState(0);
  const [tease,setTease]=useState(false);
  const q=questions[index];
  function answer(option:number){pop();if(option!==q.preferred){setTease(true);return;}if(index===questions.length-1)next();else{setIndex(index+1);setTease(false);}}
  return <><div className="eyebrow">THE IMPORTANT QUESTIONS</div><Cat/><motion.div key={q.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}><p className="handwritten question-count">a little question {index+1} of {questions.length}</p><h1 className="scene-title">{q.title}</h1><p className="scene-description">{q.note}</p><div className="answer-list">{q.answers.map((a,i)=><CuteButton key={i} onClick={()=>answer(i)}>{a}</CuteButton>)}</div><p className="feedback" role="status">{tease?'Hmm… my heart was hoping for the other answer ♡':''}</p></motion.div></>;
}
