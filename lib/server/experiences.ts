import 'server-only';
import { experienceSchema,mediaItems,mapMedia,withoutUrls,type ExperienceConfig } from '../experience';
import { ApiError,db } from './security';
export async function record(id:string,ownerHash?:string){let query=db().from('love_tests').select('*').eq('id',id);if(ownerHash)query=query.eq('owner_hash',ownerHash);const {data,error}=await query.maybeSingle();if(error)throw new ApiError(503,'Love tests are temporarily unavailable.');if(!data)throw new ApiError(404,'This love test was not found.');return data;}
export async function signedConfig(config:ExperienceConfig){const items=mediaItems(config);const urls=new Map<string,string>();await Promise.all(items.map(async item=>{if(!item.path)return;const {data,error}=await db().storage.from('love-media').createSignedUrl(item.path,3600);if(error)throw new ApiError(503,'A memory could not be loaded. Try refreshing.');urls.set(item.id,data.signedUrl);}));return mapMedia(config,item=>({...item,url:urls.get(item.id)}));}
export async function validateConfig(value:unknown,ownerHash:string,testId?:string){const parsed=experienceSchema.safeParse(value);if(!parsed.success)throw new ApiError(400,'Check the required names, letter, questions and media settings.');const config=withoutUrls(parsed.data);const items=mediaItems(config);
  if(config.photos.some(i=>i.kind!=='photo')||config.video&&config.video.kind!=='video'||config.music&&config.music.kind!=='music')throw new ApiError(400,'Invalid media types.');
  if(new Set(items.map(i=>i.id)).size!==items.length)throw new ApiError(400,'Duplicate media.');
  if(items.length){const {data,error}=await db().from('love_uploads').select('*').in('id',items.map(i=>i.id)).eq('owner_hash',ownerHash).eq('verified',true);if(error)throw error;for(const item of items){const stored=data?.find(row=>row.id===item.id);if(!stored||stored.path!==item.path||stored.kind!==item.kind||stored.mime!==item.mime||stored.size!==item.size||(stored.test_id&&stored.test_id!==testId))throw new ApiError(400,'Please upload and verify your media before creating the test.');}}
  return config;
}
