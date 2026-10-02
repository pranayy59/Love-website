import type { Metadata } from 'next';
import { Nunito, Caveat, Playfair_Display } from 'next/font/google';
import './globals.css';
const rounded = Nunito({ subsets: ['latin'], variable: '--font-rounded' });
const handwritten = Caveat({ subsets: ['latin'], variable: '--font-hand' });
const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });
export const metadata: Metadata = { title: 'A little love test ♡', description: 'A little adventure, made with a whole lot of love.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body className={`${rounded.variable} ${handwritten.variable} ${display.variable}`}>{children}</body></html>; }
