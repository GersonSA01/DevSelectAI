import './globals.css';
import ToasterAlert from './components/alerts/toastAlert.jsx';
import { ScreenProvider } from '../context/ScreenContext';

export const metadata = {
  title: 'DevSelectAI',
  description: 'Sistema inteligente de reclutamiento técnico para prácticas preprofesionales en UNEMI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0A0A23] font-sans text-white">
        <ScreenProvider>
          <ToasterAlert />
          {children}
        </ScreenProvider>
      </body>
    </html>
  );
}
