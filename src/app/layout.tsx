import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ModelProvider } from '@/context/ModelContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Data Modeler - ERD Generator',
  description: 'AI-powered data modeling tool. Describe your database in natural language and generate professional ER diagrams.',
  keywords: ['data modeling', 'ERD', 'entity relationship diagram', 'AI', 'database design'],
  openGraph: {
    title: 'AI Data Modeler',
    description: 'Design databases with natural language. AI-powered ERD generation.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-dark-bg text-gray-900 dark:text-white min-h-screen transition-colors duration-200`}>
        <ThemeProvider>
          <ModelProvider>
            {children}
          </ModelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
