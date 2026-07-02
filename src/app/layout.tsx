import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import EdyWidget from '@/components/EdyWidget';

export const metadata: Metadata = {
  title: 'EdTech Platform',
  description: 'EdTech learning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <EdyWidget />
      </body>
    </html>
  );
}
