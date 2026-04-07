import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Hälsakoll',
  description: 'Din trygga hälsojournal',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hälsakoll',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="sv">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
