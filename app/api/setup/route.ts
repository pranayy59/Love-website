import { configured,json } from '@/lib/server/security';
export async function GET(){return json({configured:configured()});}
