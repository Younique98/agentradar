import { Archivo, Source_Sans_3, JetBrains_Mono } from 'next/font/google';

// display: tool names, headlines - a confident grotesk with real weight range.
export const display = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

// body: review text, descriptions - built for long-form legibility.
export const body = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

// mono: ratings, category tags, counts - a "terminal readout" register
// that fits a tool built for developers.
export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});
