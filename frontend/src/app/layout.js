// frontend/src/app/layout.js
import './global.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Rafi Ullah - Full Stack Developer',
  description: 'Portfolio of Rafi Ullah - Full Stack Developer specializing in MERN Stack',
  keywords: 'Rafi Ullah, Full Stack Developer, MERN Stack, Portfolio, Web Developer, Software Engineer, React, Node.js, Express, MongoDB, JavaScript, Projects, Skills, Contact, custom solutions, problem-solving, innovative web applications, figma designs, responsive design, clean code, best practices, design to code, user experience, performance optimization, security, scalability, maintainability',
  authors: [{ name: 'Rafi Ullah' }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1f2e',
              color: '#e8eaf0',
              border: '0.5px solid rgba(79,156,249,0.2)',
            },
          }}
        />
      </body>
    </html>
  );
}