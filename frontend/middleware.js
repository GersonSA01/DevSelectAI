import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  console.log("🔎 Pathname:", pathname);
  console.log("🔎 Token:", token);

  const clearAndRedirect = (destination) => {
    const res = NextResponse.redirect(new URL(destination, req.url));
    res.cookies.delete('token');
    return res;
  };

  // Sin token → redirige a login general
  if (!token) {
    console.log("🚫 No token encontrado, redirigiendo a /auth/login");
    return clearAndRedirect('/auth/login');
  }

  try {
    const decoded = jwtDecode(token);
    console.log("🎫 Token decodificado:", decoded);

    if (decoded.exp * 1000 < Date.now()) {
      console.log("🚫 Token expirado.");
      return clearAndRedirect('/auth/login');
    }

    if (decoded.rol !== 'reclutador') {
      console.log(`🚫 Rol no autorizado (${decoded.rol}), se esperaba 'reclutador'`);
      return clearAndRedirect('/auth/login-reclutador');
    }

    console.log("✅ Acceso PERMITIDO para RECLUTADOR.");
    return NextResponse.next();

  } catch (err) {
    console.error("🚫 Error al decodificar token:", err);
    return clearAndRedirect('/auth/login');
  }
}

export const config = {
  matcher: [
    '/reclutador/:path*',
  ],
};
