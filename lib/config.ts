import { defaultLoveMeter } from './love-meter';
// Personalize everything here. Line breaks in the letter are preserved.
export const loveConfig = {
  loveMeter: defaultLoveMeter,
  recipientName: 'Her Name',
  senderName: 'Pranay',
  introMessage: 'I made a little something for you...',
  finalMessage: 'I LOVE YOU ❤️',
  finalSubtitle: 'Today, tomorrow, always.',
  musicUrl: '', // Optional: add public/sounds/music.mp3 and set '/sounds/music.mp3'.
  letter: `My love,

You make my life feel more beautiful and meaningful. I feel so lucky to have you.

Thank you for being you and for filling my days with happiness. Even the ordinary moments feel a little more magical with you in them.

No matter what happens, I will always choose you.

Always, forever. ❤️`,
  bouquetMessages: ['You make my days better', 'I adore your crazy side', 'My day feels incomplete without you', 'You make every moment special', 'Life feels sweeter with you', 'My favorite place is next to you'],
};
