'use client';
import { useEffect,useState } from 'react';
import { Experience } from './Experience';
import { type ExperienceConfig } from '@/lib/experience';
import { api } from '@/lib/api-client';
export function Recipient({id}:{id:string}){const [config,setConfig]=useState<ExperienceConfig|null>(null);const [locked,setLocked]=useState(false);const [secret,setSecret]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  useEffect(()=>{let active=true;api<{config?:ExperienceConfig;locked?:boolean}>(`/api/love/${id}`).then(data=>{if(active){setConfig(data.config??null);setLocked(Boolean(data.locked));}}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[id]);
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{const data=await api<{config:ExperienceConfig}>(`/api/love/${id}`,{method:'POST',body:JSON.stringify({secret})});setSecret('');setConfig(data.config);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  if(config)return <Experience config={config}/>;
  return <main className="gate-page"><div className="paper-card"><div className="handwritten">sealed with a little love ♡</div><h1 className="scene-title">{locked?"What's our secret word? 💕":error?'This little letter is unavailable':'Opening a little love…'}</h1>{locked&&<form onSubmit={submit}><label>Our secret word<input type="password" autoComplete="off" required maxLength={128} value={secret} onChange={e=>setSecret(e.target.value)}/></label><button className="cute-button" disabled={busy}>{busy?'Opening…':'Open my surprise ♡'}</button></form>}<p role="alert">{error}</p></div></main>;
}
