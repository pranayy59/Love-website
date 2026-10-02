'use client';
import { useExperience } from '@/lib/experience-context';
import { CuteButton } from './CuteButton';
export function VideoScreen({next,onPlay}:{next:()=>void;onPlay?:()=>void}){const {video}=useExperience();return <><div className="eyebrow">A MOMENT JUST FOR YOU</div><h1 className="scene-title">A Special Video 🎥</h1><video className="special-video" src={video?.url} controls playsInline preload="metadata" onPlay={onPlay}/><p className="scene-description">{video?.caption||'Press play when you’re ready ♡'}</p><CuteButton onClick={next}>Next →</CuteButton></>}
