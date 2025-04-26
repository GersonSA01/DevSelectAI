export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-center px-4">
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <p className="text-2xl mb-6">Página no encontrada</p>
      <a
        href="/"
        className="text-blue-400 hover:text-blue-600 underline text-lg transition"
      >
        Volver al inicio
      </a>
    </div>
  );
}
