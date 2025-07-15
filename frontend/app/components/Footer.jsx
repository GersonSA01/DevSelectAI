'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm text-center py-3">
      Desarrollado por{' '}
      <a
        href="/cv-gerson.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:underline"
      >
        Suarez Gerson
      </a>{' '}
      y{' '}
      <a
        href="/cv-angeles.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:underline"
      >
        Valdospin Angeles
      </a>
    </footer>
  );
}
