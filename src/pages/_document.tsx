import { Html, Head, Main, NextScript } from 'next/document';
import { display, body, mono } from '@/lib/fonts';

export default function Document() {
  return (
    <Html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <Head />
      <body className="font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
