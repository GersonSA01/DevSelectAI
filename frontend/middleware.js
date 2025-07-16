import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  const redirectToLogin = (role) => {
    const path = role === 'postulante' ? '/auth/login_estudiante' : '/auth/login_docente';
    return NextResponse.redirect(new URL(path, req.url));
  };

  if (!token) {
    console.log("🚫 No token encontrado.");
    if (pathname.startsWith('/postulador')) return redirectToLogin('postulante');
    if (pathname.startsWith('/reclutador')) return redirectToLogin('reclutador');
    return redirectToLogin('reclutador');
  }

  try {
    const decoded = jwtDecode(token);
    console.log("🎫 Token decodificado:", decoded);

    if (decoded.exp * 1000 < Date.now()) {
      console.log("🚫 Token expirado.");
      if (pathname.startsWith('/postulador')) return redirectToLogin('postulante');
      if (pathname.startsWith('/reclutador')) return redirectToLogin('reclutador');
      return redirectToLogin('reclutador');
    }

    if (pathname.startsWith('/postulador')) {
      if (decoded.rol !== 'postulante') {
        console.log("🚫 Acceso denegado a POSTULANTE, rol actual:", decoded.rol);
        return redirectToLogin('postulante');
      }
      console.log("✅ Acceso permitido a POSTULANTE");
      return NextResponse.next();
    }

    if (pathname.startsWith('/reclutador')) {
      if (decoded.rol !== 'reclutador') {
        console.log("🚫 Acceso denegado a RECLUTADOR, rol actual:", decoded.rol);
        return redirectToLogin('reclutador');
      }
      console.log("✅ Acceso permitido a RECLUTADOR");
      return NextResponse.next();
    }

    console.log("✅ Ruta no protegida, acceso permitido.");
    return NextResponse.next();

  } catch (err) {
    console.error("🚫 Error al decodificar token:", err);
    if (pathname.startsWith('/postulador')) return redirectToLogin('postulante');
    if (pathname.startsWith('/reclutador')) return redirectToLogin('reclutador');
    return redirectToLogin('reclutador');
  }
}

export const config = {
  matcher: [
    '/postulador',
    '/postulador/:path((?!entrevista).*)',
    '/reclutador/:path*',
    '/reclutador',
  ],
};
