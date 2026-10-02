export const meterRanges = [10,20,30,40,50,60,70,80,90,99,100];
export const defaultLoveMeter = {
  question: 'How much do you love me?',
  messages: ["That's all? 🥲", 'A little? Are you sure? 🤨', 'Hmm... I think you can do better 👀', "Okayyy... we're getting somewhere 💗", 'Halfway to my heart 💕', "Now we're talking 🥰", "Awww, that's more like it 💖", "Okay, I'm blushing now 🙈", 'You really love me that much? 🥹💗', 'Sooo close... keep going! 💞', 'TO THE MOON & BACK! ❤️'],
  leftLabel: 'A little', rightLabel: 'To the moon & back',
  completionMessage: "That's the correct answer 💗", continueText: 'Continue →',
};
export type LoveMeterConfig = typeof defaultLoveMeter;
export const messageIndex = (value: number) => meterRanges.findIndex(max => value <= max);
export const activeSegments = (value: number) => value === 100 ? 6 : Math.max(1, Math.ceil(value / 20));
export function parseMeter(value: unknown, defaults: LoveMeterConfig): LoveMeterConfig {
  if (!value || typeof value !== 'object') return defaults;
  const data = value as Record<string, unknown>;
  const text = (key: keyof LoveMeterConfig) => typeof data[key] === 'string' && (data[key] as string).trim() ? (data[key] as string).slice(0,300) : defaults[key] as string;
  return { question:text('question'), leftLabel:text('leftLabel'), rightLabel:text('rightLabel'), completionMessage:text('completionMessage'), continueText:text('continueText'),
    messages: defaults.messages.map((fallback,i) => Array.isArray(data.messages) && typeof data.messages[i] === 'string' && data.messages[i].trim() ? data.messages[i].slice(0,300) : fallback) };
}
