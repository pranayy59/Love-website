'use client';
import { motion } from 'framer-motion';
export function CuteButton({ children, onClick, disabled, secondary = false }: {children: React.ReactNode; onClick:()=>void; disabled?:boolean; secondary?:boolean}) {return <motion.button type="button" whileHover={{ y:-3 }} whileTap={{scale:.97}} className={`cute-button ${secondary?'secondary':''}`} disabled={disabled} onClick={onClick}>{children}</motion.button>}
