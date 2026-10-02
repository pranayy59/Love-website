import 'server-only';
import { cookies } from 'next/headers';
import { createHash,createHmac,randomBytes,scrypt,timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { createClient } from '@supabase/supabase-js';
const derive=promisify(scrypt);
export class ApiError extends Error {constructor(public status:number,message:string){super(message);}}
export function configured(){return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && (process.env.LOVE_APP_SECRET?.length??0)>=64);}
export function db(){if(!configured())throw new ApiError(503,'Sharing is not connected yet. Your draft is safe; configure Supabase to publish.');return createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});}
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict' as const,path:'/'};
export async function owner(create=false){const jar=await cookies();let token=jar.get('love-creator')?.value;if(!token || !/^[a-f0-9]{64}$/.test(token)){if(!create)throw new ApiError(401,'Open the creator on the browser you used to create this test.');token=randomBytes(32).toString('hex');jar.set('love-creator',token,{...cookieOptions,maxAge:60*60*24*365});}return digest(token);}
export function sameOrigin(request:Request){const expected=process.env.APP_ORIGIN || new URL(request.url).origin;if(request.headers.get('origin')!==expected)throw new ApiError(403,'This request must come from the love test website.');}
export async function body(request:Request){const reader=request.body?.getReader();if(!reader)throw new ApiError(400,'Missing request.');let bytes=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>150000){await reader.cancel();throw new ApiError(413,'This love test is too large.');}chunks.push(value);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new ApiError(400,'Invalid request.');}}
export function validId(id:string){if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))throw new ApiError(404,'This love test was not found.');}
export async function hashSecret(word:string){const salt=randomBytes(16).toString('hex');const hash=await derive(word.normalize('NFKC'),salt,64) as Buffer;return `${salt}:${hash.toString('hex')}`;}
export async function checkSecret(word:string,stored:string){const [salt,hex]=stored.split(':');if(!salt||hex?.length!==128)return false;const actual=await derive(word.normalize('NFKC'),salt,64) as Buffer;return timingSafeEqual(actual,Buffer.from(hex,'hex'));}
function proof(id:string,hash:string,expires:string){return createHmac('sha256',process.env.LOVE_APP_SECRET!).update(`${id}:${hash}:${expires}`).digest('hex');}
export async function unlocked(id:string,hash:string){const token=(await cookies()).get(`love-unlock-${id}`)?.value;const [expires,mac]=token?.split('.')??[];if(!expires||!mac||Number(expires)<Date.now()||mac.length!==64)return false;const expected=proof(id,hash,expires);return timingSafeEqual(Buffer.from(mac),Buffer.from(expected));}
export async function unlock(id:string,hash:string){const expires=String(Date.now()+86400000);(await cookies()).set(`love-unlock-${id}`,`${expires}.${proof(id,hash,expires)}`,{...cookieOptions,maxAge:86400});}
export async function rate(key:string,limit:number,seconds=900){const {data,error}=await db().rpc('love_rate_limit',{p_key:digest(key),p_limit:limit,p_seconds:seconds});if(error)throw new ApiError(503,'Sharing is temporarily unavailable. Please try again.');if(!data)throw new ApiError(429,'Too many attempts. Please try again in 15 minutes.');}
export async function handle(fn:()=>Promise<Response>){try{return await fn();}catch(error){if(error instanceof ApiError)return Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'no-store'}});return Response.json({error:'Something could not be saved or loaded. Please try again.'},{status:500,headers:{'Cache-Control':'no-store'}});}}
export const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
