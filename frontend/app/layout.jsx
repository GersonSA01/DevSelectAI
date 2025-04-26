import './globals.css';

export const metadata = {
  title: 'DevSelectAI',
  description: 'Sistema inteligente de reclutamiento técnico para prácticas preprofesionales en UNEMI.',
  applicationName: 'DevSelectAI',
  keywords: ['reclutamiento', 'evaluación técnica', 'prácticas preprofesionales', 'UNEMI', 'DevSelectAI'],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0055a5',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-100 font-sans">
        {children}
      </body>
    </html>
  );
}
