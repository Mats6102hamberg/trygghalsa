import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Hälsakoll',
  description: 'Din trygga hälsojournal',
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
