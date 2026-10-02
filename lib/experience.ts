import { z } from 'zod';
import { defaultLoveMeter } from './love-meter';
import { questions } from './questions';

const text = (max=300) => z.string().trim().max(max);
const color = z.string().regex(/^#[0-9a-f]{6}$/i);
export const mediaSchema = z.object({
  id:z.string().uuid(), name:text(160), mime:text(80), size:z.number().int().positive(),
  kind:z.enum(['photo','video','music']), caption:text(300).default(''),
  path:z.string().regex(/^[a-f0-9]{64}\/[a-f0-9-]{36}\.[a-z0-9]+$/).optional(),
  url:z.string().max(5000).optional(),
});
export type MediaItem=z.infer<typeof mediaSchema>;
export const experienceSchema=z.object({
  version:z.literal(2), recipientName:text(80).min(1,'Add your recipient’s name'), senderName:text(80).min(1,'Add your name'),
  nickname:text(80), anniversary:z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/), introMessage:text(500),
  letter:text(10000).min(1,'Write a little letter'), letterHeading:text(150), closingLine:text(300), signature:text(150),
  finalIntro:text(200), finalMessage:text(300), finalSubtitle:text(300),
  questions:z.array(z.object({id:z.string(),title:text(300).min(1),note:text(300),answers:z.array(text(150).min(1)).min(2).max(6),preferred:z.number().int().min(0)}).refine(q=>q.preferred<q.answers.length)).max(20),
  bouquetMessages:z.array(text(300).min(1)).min(1).max(12),
  loveMeter:z.object({question:text(300).min(1),messages:z.array(text(300)).length(11),leftLabel:text(100),rightLabel:text(100),completionMessage:text(300),continueText:text(100),minimum:z.number().int().min(0).max(100)}),
  photos:z.array(mediaSchema).max(20),video:mediaSchema.nullable(),music:mediaSchema.nullable(),
  theme:z.object({name:text(60),primary:color,background:color,accent:color}),secretEnabled:z.boolean(),
});
export type ExperienceConfig=z.infer<typeof experienceSchema>;
export const themes=[
  {name:'Soft Pink',primary:'#ad435e',background:'#f7e9e9',accent:'#c4778d'},
  {name:'Romantic Red',primary:'#9f233d',background:'#fae7e2',accent:'#bc5864'},
  {name:'Lavender Love',primary:'#77529a',background:'#f0e9f7',accent:'#a782c3'},
  {name:'Midnight Love',primary:'#d393b1',background:'#251f35',accent:'#b396cf'},
  {name:'Minimal Cream',primary:'#82614a',background:'#f5f0e6',accent:'#b29470'},
];
export function newExperience():ExperienceConfig {return {
  version:2,recipientName:'',senderName:'',nickname:'My Love',anniversary:'',introMessage:'I made a little something for you...',
  letter:'My love,\n\nYou make even the ordinary moments feel a little more magical. I feel so lucky to have you.\n\nNo matter what happens, I will always choose you.',
  letterHeading:'A Letter From My Heart',closingLine:'Always, forever. ❤️',signature:'',
  finalIntro:'One last thing...',finalMessage:'I LOVE YOU ❤️',finalSubtitle:'Today, tomorrow, always.',
  questions:questions.map((q,i)=>({id:`default-${i}`,title:q.title,note:q.note,answers:[...q.answers],preferred:0})),
  bouquetMessages:['You make my days better','I love your smile','You make everything more fun',"You’re my favorite person",'I love being around you','My favorite place is next to you'],
  loveMeter:{...defaultLoveMeter,messages:[...defaultLoveMeter.messages],minimum:80},photos:[],video:null,music:null,theme:{...themes[0]},secretEnabled:false,
};}
export function mediaItems(config:ExperienceConfig){return [...config.photos,...(config.video?[config.video]:[]),...(config.music?[config.music]:[])];}
export function mapMedia(config:ExperienceConfig,fn:(item:MediaItem)=>MediaItem):ExperienceConfig{return {...config,photos:config.photos.map(fn),video:config.video?fn(config.video):null,music:config.music?fn(config.music):null};}
export function withoutUrls(config:ExperienceConfig){return mapMedia(config,item=>{const copy={...item};delete copy.url;return copy;});}
export const mediaLimits={photo:8*1024*1024,video:25*1024*1024,music:15*1024*1024};
export const mediaTypes={photo:['image/jpeg','image/png','image/webp'],video:['video/mp4','video/webm'],music:['audio/mpeg','audio/wav','audio/x-wav','audio/mp4','audio/x-m4a']};
export function validateMedia(item:Pick<MediaItem,'kind'|'mime'|'size'>){if(!mediaTypes[item.kind].includes(item.mime))throw new Error('Please choose a supported file type.');if(item.size>mediaLimits[item.kind])throw new Error(`${item.kind} files must be under ${mediaLimits[item.kind]/1024/1024} MB.`);}
