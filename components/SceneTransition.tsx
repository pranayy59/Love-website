'use client';
import { motion } from 'framer-motion';
export function SceneTransition({children}:{children:React.ReactNode}){return <motion.section className="scene-content" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:.3}}>{children}</motion.section>}
