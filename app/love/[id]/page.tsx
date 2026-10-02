import { Recipient } from '@/components/Recipient';
export const metadata={title:'A little something for you ♡',robots:{index:false,follow:false}};
export default async function LovePage({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Recipient id={id}/>;}
