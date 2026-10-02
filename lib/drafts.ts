'use client';
import { newExperience, type ExperienceConfig, type MediaItem, mapMedia, withoutUrls } from './experience';
const draftKey='love-test-draft-v2';
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open('love-test-media',1);request.onupgradeneeded=()=>request.result.createObjectStore('files');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('Photo storage is unavailable in this browser.'));});}
async function transaction<T>(mode:IDBTransactionMode,action:(store:IDBObjectStore)=>IDBRequest):Promise<T>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('files',mode);const req=action(tx.objectStore('files'));tx.oncomplete=()=>{resolve(req.result as T);db.close();};tx.onerror=()=>{reject(tx.error);db.close();};tx.onabort=()=>{reject(tx.error);db.close();};});}
export const storeFile=(id:string,file:Blob)=>transaction('readwrite',s=>s.put(file,id));
export const getFile=(id:string)=>transaction<Blob|undefined>('readonly',s=>s.get(id));
export const removeFile=(id:string)=>transaction('readwrite',s=>s.delete(id));
export async function clearDraftForTest(id:string){try{const saved=JSON.parse(localStorage.getItem(draftKey)??'null');if(saved?.editId===id){for(const item of mapMediaList(saved.config))await removeFile(item.id);localStorage.removeItem(draftKey);}}catch{/* Cloud deletion remains complete if local storage is unavailable. */}}
export function saveDraft(config:ExperienceConfig,editId?:string){localStorage.setItem(draftKey,JSON.stringify({config:withoutUrls(config),editId,savedAt:new Date().toISOString()}));}
export function loadDraft():{config:ExperienceConfig;editId?:string}{try{const data=JSON.parse(localStorage.getItem(draftKey)??'null');if(data?.config?.version===2)return data;}catch{}const config=newExperience();try{const legacy=JSON.parse(localStorage.getItem('love-test-config')??'null');if(legacy?.loveMeter)config.loveMeter={...config.loveMeter,...legacy.loveMeter};}catch{}return {config};}
export async function hydrateDraft(config:ExperienceConfig){const urls=new Map<string,string>();await Promise.all(mapMediaList(config).map(async item=>{const file=await getFile(item.id);if(file)urls.set(item.id,URL.createObjectURL(file));}));return mapMedia(config,item=>({...item,url:urls.get(item.id)??item.url}));}
function mapMediaList(config:ExperienceConfig):MediaItem[]{return [...config.photos,...(config.video?[config.video]:[]),...(config.music?[config.music]:[])];}
