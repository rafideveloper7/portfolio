// frontend/src/app/layout.js
import './global.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Rafi Ullah - Full Stack Developer',
  description: 'Portfolio of Rafi Ullah - Full Stack Developer specializing in MERN Stack',
  keywords: 'Rafi Ullah, Full Stack Developer, MERN Stack, Portfolio, React, Node.js',
  authors: [{ name: 'Rafi Ullah' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#07090f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1f2e',
              color: '#e8eaf0',
              border: '0.5px solid rgba(79,156,249,0.2)',
              fontSize: '13px',
              maxWidth: '90vw',
            },
          }}
        />
      </body>
    </html>
  );
}
