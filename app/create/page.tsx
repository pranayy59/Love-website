'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import { Heart,ArrowUpRight,Check } from 'lucide-react';
import { experienceSchema,newExperience,themes,mediaItems,type ExperienceConfig,mapMedia } from '@/lib/experience';
import { loadDraft,saveDraft,hydrateDraft } from '@/lib/drafts';
import { api,uploadMedia } from '@/lib/api-client';
import { meterRanges } from '@/lib/love-meter';
import { Field,Reorder,reordered } from '@/components/creator/Field';
import { MediaEditor } from '@/components/creator/MediaEditor';
import { QuestionsEditor } from '@/components/creator/QuestionsEditor';
import { PreviewPanel } from '@/components/creator/PreviewPanel';
import { ShareCard } from '@/components/creator/ShareCard';

export default function Creator(){
  const [config,setConfig]=useState<ExperienceConfig|null>(null);
  const [editId,setEditId]=useState<string>();
  const [secret,setSecret]=useState('');
  const [saved,setSaved]=useState('');
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [connected,setConnected]=useState<boolean|null>(null);
  const [busy,setBusy]=useState(false);
  const [readyUrl,setReadyUrl]=useState('');
  const [previewOpen,setPreviewOpen]=useState(false);
  const [scene,setScene]=useState('Hello');
  useEffect(()=>{
    let active=true;let restored:ExperienceConfig|null=null;
    async function load(){
      try{
        const params=new URLSearchParams(location.search);const id=params.get('id');
        let loaded:ExperienceConfig;let loadedId:string|undefined;
        if(id){const data=await api<{config:ExperienceConfig}>(`/api/tests/${id}`);loaded=data.config;loadedId=id;}
        else if(params.has('new'))loaded=newExperience();
        else {const draft=loadDraft();loaded=draft.config;loadedId=draft.editId;
          if(loadedId){try{const remote=await api<{config:ExperienceConfig}>(`/api/tests/${loadedId}`);const urls=new Map(mediaItems(remote.config).map(item=>[item.id,item.url]));loaded=mapMedia(loaded,item=>({...item,url:urls.get(item.id)}));}catch{if(active)setNotice('Your local draft is restored. Published media will reload when sharing is connected.');}}
        }
        try{restored=await hydrateDraft(loaded);}catch{restored=loaded;if(active)setNotice('Your text is restored, but local media storage is unavailable.');}
        if(active){setConfig(restored);setEditId(loadedId);}
      }catch(e){if(active)setError((e as Error).message);}
    }
    void load();api<{configured:boolean}>('/api/setup').then(data=>{if(active)setConnected(data.configured);}).catch(()=>{if(active)setConnected(false);});
    return()=>{active=false;if(restored)mediaItems(restored).forEach(item=>{if(item.url?.startsWith('blob:'))URL.revokeObjectURL(item.url);});};
  },[]);
  useEffect(()=>{if(!config)return;const timer=setTimeout(()=>{try{saveDraft(config,editId);setSaved('Saved ✓');}catch{setSaved('Could not save on this browser');}},800);return()=>clearTimeout(timer);},[config,editId]);
  function change(patch:Partial<ExperienceConfig>){setConfig(previous=>previous?{...previous,...patch}:previous);setSaved('Saving…');setError('');}
  function manualSave(){if(!config)return;try{saveDraft(config,editId);setSaved('Saved ✓');}catch{setError('Browser storage is full or unavailable. Please allow storage to keep this draft.');}}
  async function publish(e:React.FormEvent){e.preventDefault();if(!config)return;setError('');const validated=experienceSchema.safeParse(config);if(!validated.success){const issue=validated.error.issues[0];setError(`${issue.path.join(' → ')}: ${issue.message}`);return;}if(config.secretEnabled&&!editId&&secret.length<4){setError('Enter a secret word of at least 4 characters. Secret words are never saved in drafts.');return;}setBusy(true);setNotice('Preparing your little love story…');try{
      const status=await api<{configured:boolean}>('/api/setup');if(!status.configured)throw new Error('Your draft is saved. Connect Supabase using the setup guide to create a shareable link.');
      const uploaded=await uploadMedia(validated.data,setNotice);
      const result=await api<{id:string}>(editId?`/api/tests/${editId}`:'/api/tests',{method:editId?'PUT':'POST',body:JSON.stringify({config:uploaded,secret})});
      setConfig(uploaded);setEditId(result.id);setSecret('');saveDraft(uploaded,result.id);setReadyUrl(new URL(`/love/${result.id}`,location.origin).toString());setNotice('');window.scrollTo({top:0,behavior:'smooth'});
    }catch(e){setError((e as Error).message);setNotice('');}finally{setBusy(false);}}
  if(!config)return <main className="gate-page"><div className="paper-card"><h1 className="scene-title">{error?'Could not open this draft':'Unfolding your little love story…'}</h1><p role="alert">{error}</p>{error&&<Link href="/create?new=1">Start a new love test</Link>}</div></main>;
  return <div className="setup-shell"><header className="setup-header"><Link href="/" className="brand"><Heart size={21}/>a little love test.</Link><Link href="/dashboard">My love tests <ArrowUpRight size={15}/></Link></header><main className="setup-main">
    {readyUrl?<><ShareCard url={readyUrl} onEdit={()=>setReadyUrl('')}/><Link className="creator-back" href="/dashboard">Go to my dashboard →</Link></>:<>
    <div className="setup-heading"><span className="eyebrow">A LITTLE YOU. A LITTLE THEM. A LOT OF LOVE.</span><h1>Create Your Love Test <span>💗</span></h1><p>Make something special for your favorite person.</p><div className="setup-meta"><span><Check size={14}/>{saved||'Your story starts here'}</span><span>No design skills. Just a little love.</span></div></div>
    {connected===false&&<div className="connection-note">You can create, preview, and save your draft now. Shareable links become available once Supabase is connected. <Link href="/setup">View setup guide →</Link></div>}
    <div className="setup-layout"><form className="setup-form" onSubmit={publish} noValidate>
    <details className="setup-section" open><summary><span className="section-number">01</span><div>Start with the two of you<small>The people behind this little story</small></div><span>♡</span></summary><div className="section-content"><div className="field-pair"><Field label="Recipient's name" value={config.recipientName} maxLength={80} required onChange={recipientName=>change({recipientName})}/><Field label="Your name" value={config.senderName} maxLength={80} required onChange={senderName=>change({senderName})}/></div><div className="field-pair"><Field label="Nickname / pet name" value={config.nickname} maxLength={80} onChange={nickname=>change({nickname})}/><Field label="Relationship anniversary (optional)" type="date" value={config.anniversary} onChange={anniversary=>change({anniversary})}/></div><Field label="Intro message" value={config.introMessage} maxLength={500} onChange={introMessage=>change({introMessage})}/></div></details>
    <details className="setup-section"><summary><span className="section-number">02</span><div>Write Your Love Letter 💌<small>The words you want them to keep</small></div><span>+</span></summary><div className="section-content"><Field label="Letter heading" value={config.letterHeading} onChange={letterHeading=>change({letterHeading})}/><Field label="Your love letter" value={config.letter} multiline maxLength={10000} required onChange={letter=>change({letter})}/><Field label="Closing line" value={config.closingLine} onChange={closingLine=>change({closingLine})}/><Field label="Signature (leave blank to use your name)" value={config.signature} onChange={signature=>change({signature})}/><button className="cute-button secondary" type="button" onClick={()=>{setScene('Love letter');if(matchMedia('(max-width: 900px)').matches)setPreviewOpen(true);}}>Preview Letter</button></div></details>
    <details className="setup-section"><summary><span className="section-number">03</span><div>Add Your Memories 📸<small>{config.photos.length?`${config.photos.length} moments to keep`:'Your favorite days, in little Polaroids'}</small></div><span>+</span></summary><div className="section-content"><MediaEditor kind="photo" config={config} change={change}/></div></details>
    <details className="setup-section"><summary><span className="section-number">04</span><div>Add a Special Video 🎥<small>A little moment, in motion · optional</small></div><span>+</span></summary><div className="section-content"><MediaEditor kind="video" config={config} change={change}/></div></details>
    <details className="setup-section"><summary><span className="section-number">05</span><div>Choose Your Song 🎵<small>The soundtrack to your story · optional</small></div><span>+</span></summary><div className="section-content"><MediaEditor kind="music" config={config} change={change}/><p className="field-help">Music starts only when they tap the sound button. Without a song, the gentle built-in melody is available.</p></div></details>
    <details className="setup-section"><summary><span className="section-number">06</span><div>Create Your Questions 💕<small>{config.questions.length} little questions, just for them</small></div><span>+</span></summary><div className="section-content"><QuestionsEditor questions={config.questions} change={questions=>change({questions})}/></div></details>
    <details className="setup-section"><summary><span className="section-number">07</span><div>Love Meter Messages<small>A little love… or to the moon and back?</small></div><span>+</span></summary><div className="section-content"><Field label="Love meter question" value={config.loveMeter.question} onChange={question=>change({loveMeter:{...config.loveMeter,question}})}/><label className="setup-field">Minimum accepted percentage<input type="number" min={0} max={100} value={config.loveMeter.minimum} onChange={e=>change({loveMeter:{...config.loveMeter,minimum:Math.max(0,Math.min(100,Number(e.target.value)))}})}/></label>{meterRanges.map((max,i)=><Field key={max} label={i===0?'Low percentage message (0–10%)':i===10?'100% message':`${meterRanges[i-1]+1}–${max}% message`} value={config.loveMeter.messages[i]} onChange={value=>change({loveMeter:{...config.loveMeter,messages:config.loveMeter.messages.map((text,n)=>n===i?value:text)}})}/>)}{([['leftLabel','Left slider label'],['rightLabel','Right slider label'],['completionMessage','Success message'],['continueText','Continue button text']] as const).map(([key,label])=><Field key={key} label={label} value={config.loveMeter[key]} onChange={value=>change({loveMeter:{...config.loveMeter,[key]:value}})}/>)}<button type="button" className="text-button" onClick={()=>{setScene('Love meter');if(matchMedia('(max-width: 900px)').matches)setPreviewOpen(true);}}>Try the meter →</button></div></details>
    <details className="setup-section"><summary><span className="section-number">08</span><div>Your Bouquet Messages<small>Every reason adds another flower</small></div><span>+</span></summary><div className="section-content">{config.bouquetMessages.map((message,index)=><div className="bouquet-editor-row" key={index}><Field label={`Bouquet message ${index+1}`} value={message} onChange={value=>change({bouquetMessages:config.bouquetMessages.map((m,i)=>i===index?value:m)})}/><Reorder index={index} length={config.bouquetMessages.length} label={`bouquet message ${index+1}`} move={d=>change({bouquetMessages:reordered(config.bouquetMessages,index,d)})} remove={()=>change({bouquetMessages:config.bouquetMessages.filter((_,i)=>i!==index)})}/></div>)}<button type="button" className="cute-button secondary" disabled={config.bouquetMessages.length>=12} onClick={()=>change({bouquetMessages:[...config.bouquetMessages,'']})}>+ Add a reason</button></div></details>
    <details className="setup-section"><summary><span className="section-number">09</span><div>The Final I Love You<small>Save the biggest feeling for last</small></div><span>+</span></summary><div className="section-content"><Field label="Small intro" value={config.finalIntro} onChange={finalIntro=>change({finalIntro})}/><Field label="Main message" value={config.finalMessage} onChange={finalMessage=>change({finalMessage})}/><Field label="Subtitle" value={config.finalSubtitle} onChange={finalSubtitle=>change({finalSubtitle})}/></div></details>
    <details className="setup-section"><summary><span className="section-number">10</span><div>Choose Your Style 🎨<small>Pick the colors of your kind of love</small></div><span>+</span></summary><div className="section-content"><div className="theme-picker">{themes.map(theme=><button type="button" key={theme.name} aria-pressed={config.theme.name===theme.name} onClick={()=>change({theme:{...theme}})}><span style={{background:theme.background,borderColor:theme.primary}}><Heart size={18} fill={theme.primary} color={theme.primary}/></span>{theme.name}</button>)}</div><div className="color-fields">{(['primary','background','accent'] as const).map(key=><Field key={key} type="color" label={`${key[0].toUpperCase()+key.slice(1)} color`} value={config.theme[key]} onChange={value=>change({theme:{...config.theme,name:'Custom',[key]:value}})}/>)}</div><p className="field-help">Text contrast adjusts automatically. Your letter stays on soft, readable paper.</p></div></details>
    <details className="setup-section"><summary><span className="section-number">11</span><div>A Secret Between You Two 🔐<small>Optional, just like a little locked diary</small></div><span>+</span></summary><div className="section-content"><label className="check-label"><input type="checkbox" checked={config.secretEnabled} onChange={e=>change({secretEnabled:e.target.checked})}/>Protect with a secret word</label>{config.secretEnabled&&<><Field type="password" label={editId?'New secret word (leave blank to keep the current word)':'Secret word'} maxLength={128} value={secret} onChange={setSecret}/><p className="field-help">Use at least 4 characters. The word is not saved in your draft; re-enter it before creating your test.</p></>}</div></details>
    <div className="create-actions"><p className="handwritten">A few little details. A very big feeling.</p><p className="form-error" role="alert">{error}</p><p role="status">{notice}</p><div><button className="cute-button secondary" type="button" onClick={manualSave}>Save Draft</button><button className="cute-button" disabled={busy} type="submit">{busy?'Making a little magic…':editId?'Update My Love Test 💗':'Create My Love Test 💗'}</button></div><small>Only the finished experience is shared. Your editing space stays yours.</small></div>
    </form><PreviewPanel config={config} scene={scene} setScene={setScene} open={previewOpen} onClose={()=>setPreviewOpen(false)}/></div><button className="mobile-preview-trigger cute-button" onClick={()=>setPreviewOpen(true)}>Preview 💗</button>
    </>}
  </main><footer className="setup-footer">A LITTLE LOVE GOES A LONG WAY ♡</footer></div>;
}
