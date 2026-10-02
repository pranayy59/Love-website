'use client';
import { Experience } from '@/components/Experience';
import { newExperience } from '@/lib/experience';
export default function Demo(){const config=newExperience();config.recipientName='You';config.senderName='Your favorite person';config.nickname='You';return <Experience config={config}/>;}
