import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yasir Fest • Super Admin Portal',
  description: 'Master Culinary Command Center for Yasir Fest',
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
