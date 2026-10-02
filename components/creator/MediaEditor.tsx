'use client';
import { useRef,useState } from 'react';
import { type ExperienceConfig,type MediaItem,validateMedia,mediaLimits } from '@/lib/experience';
import { storeFile,removeFile } from '@/lib/drafts';
import { Field,Reorder,reordered } from './Field';
const accept={photo:'.jpg,.jpeg,.png,.webp',video:'.mp4,.webm',music:'.mp3,.wav,.m4a'};
function fileMime(file:File){if(file.type)return file.type;const ext=file.name.split('.').pop()?.toLowerCase();return ({m4a:'audio/mp4',mp3:'audio/mpeg',wav:'audio/wav',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',mp4:'video/mp4',webm:'video/webm'} as Record<string,string>)[ext??'']??'';}
export function MediaEditor({kind,config,change}:{kind:MediaItem['kind'];config:ExperienceConfig;change:(patch:Partial<ExperienceConfig>)=>void}){
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);const song=useRef<HTMLAudioElement>(null);
  const items=kind==='photo'?config.photos:config[kind]?[config[kind]!]:[];
  function update(next:MediaItem[]){change(kind==='photo'?{photos:next}:{[kind]:next[0]??null});}
  async function add(files:FileList|null){if(!files)return;setError('');setBusy(true);const created:MediaItem[]=[];try{if(kind==='photo'&&files.length+items.length>20)throw new Error('Choose up to 20 memories.');for(const file of Array.from(files)){const item:MediaItem={id:crypto.randomUUID(),name:file.name.slice(0,160),mime:fileMime(file),size:file.size,kind,caption:''};validateMedia(item);await storeFile(item.id,file);item.url=URL.createObjectURL(file);created.push(item);}update(kind==='photo'?[...items,...created]:created.slice(0,1));}catch(e){for(const item of created){await removeFile(item.id);if(item.url)URL.revokeObjectURL(item.url);}setError((e as Error).message);}finally{setBusy(false);}}
  async function remove(index:number){const item=items[index];try{await removeFile(item.id);}catch{}if(item.url?.startsWith('blob:'))URL.revokeObjectURL(item.url);update(items.filter((_,i)=>i!==index));}
  return <div className="media-editor"><label className="upload-drop"><span>{busy?'Adding your memory…':kind==='photo'?'+ Add photos':kind==='video'?'+ Add a special video':'+ Choose your song'}</span><small>{accept[kind].replaceAll('.','').toUpperCase()} · up to {mediaLimits[kind]/1024/1024} MB {kind==='photo'?'each · 20 photos max':''}</small><input aria-label={`Upload ${kind}`} type="file" accept={accept[kind]} multiple={kind==='photo'} disabled={busy} onChange={e=>{void add(e.target.files);e.target.value='';}}/></label><p className="form-error" role="alert">{error}</p>
    {items.map((item,index)=><div key={item.id} className="media-row">{kind==='photo'&&
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.url} alt={item.caption||item.name}/>
    }{kind==='video'&&<video src={item.url} controls playsInline preload="metadata"/>}<div className="media-row-content"><p>{kind==='music'?'Selected song: ':''}{item.name}</p>{kind==='music'?<><audio ref={song} src={item.url} controls preload="metadata"/><button className="text-button" type="button" onClick={()=>{void song.current?.play().catch(()=>setError('This browser cannot play that audio format. Try an MP3.'));}}>Preview ▶</button></>:<Field label={`Caption for ${kind==='photo'?`photo ${index+1}`:'video'}`} value={item.caption} onChange={caption=>update(items.map((m,i)=>i===index?{...m,caption}:m))}/>}
      <Reorder index={index} length={items.length} label={`${kind} ${index+1}`} move={direction=>update(reordered(items,index,direction))} remove={()=>void remove(index)}/></div></div>)}
  </div>;
}
