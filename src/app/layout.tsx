import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ModelProvider } from '@/context/ModelContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Data Modeler - ERD Generator',
  description: 'AI-powered data modeling tool. Describe your database in natural language and generate professional ER diagrams.',
  keywords: ['data modeling', 'ERD', 'entity relationship diagram', 'AI', 'database design'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-bg text-white min-h-screen`}>
        <ModelProvider>
          {children}
        </ModelProvider>
      </body>
    </html>
  );
}
