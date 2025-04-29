'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EntrevistaIndex() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/postulador/entrevista/inicio')
  }, [])
  return null
}
