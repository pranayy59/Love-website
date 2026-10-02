import type { CSSProperties } from 'react';
import type { ExperienceConfig } from './experience';
function luminance(hex:string){const rgb=hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
export function contrastText(color:string){return luminance(color)>.179?'#352b31':'#fffaf7';}
export function themeStyle(theme:ExperienceConfig['theme']):CSSProperties{return {
  '--rose':theme.primary,'--page-background':theme.background,'--theme-accent':theme.accent,'--button-ink':contrastText(theme.primary),
  '--outside-ink':contrastText(theme.background),
} as CSSProperties;}
