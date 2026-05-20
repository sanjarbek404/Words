import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'LinguaMaster - Ingliz tili lug\'ati',
  description: 'Zamonaviy aqlli lug\'at va so\'zlarni interaktiv yodlash platformasi.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="uz" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen pb-20 md:pb-0 transition-colors duration-300" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
