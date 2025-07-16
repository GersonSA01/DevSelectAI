'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUsuario = async () => {
    try {
      const res = await fetch('/api/me', {
        credentials: 'include'
      });
      if (!res.ok) {
        setUsuario(null);
        return;
      }
      const data = await res.json();
      setUsuario(data.usuario);
    } catch (err) {
      console.error("Error al validar sesión:", err);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setUsuario(null);
    router.push('/');
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
