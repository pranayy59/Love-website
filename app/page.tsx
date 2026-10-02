import { Suspense } from 'react';
import { HomePage } from '@/components/HomePage';
export default function Home(){return <Suspense fallback={<main className="gate-page">Opening a little love…</main>}><HomePage/></Suspense>;}
