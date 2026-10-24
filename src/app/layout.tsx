import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/core/components/providers';
import { APP_DESCRIPTION, APP_NAME } from '@/core/config/app';
import './globals.css';

const karolSans = localFont({
  src: [
    { path: '../../public/fonts/fonnts.com-Karol_Sans_Regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/KarolSans-SemiBold.otf', weight: '600', style: 'normal' },
    { path: '../../public/fonts/fonnts.com-Karol_Sans_Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-karol-sans',
  display: 'swap',
  fallback: ['sans-serif'],
});

const twogetherSans = localFont({
  src: [
    { path: '../../public/fonts/TwogetherSans-ExtraLight.otf', weight: '200', style: 'normal' },
    { path: '../../public/fonts/TwogetherSans-Light.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/TwogetherSans-Regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/TwogetherSans-Medium.otf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/TwogetherSans-Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-twogether-sans',
  display: 'swap',
  fallback: ['sans-serif'],
});

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="light" className={`${karolSans.variable} ${twogetherSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
