'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a login_estudiante como predeterminado
    router.push('/auth/login_estudiante');
  }, [router]);

  return null;
}
