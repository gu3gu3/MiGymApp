'use client'

import { useState, useEffect } from 'react'

export function useNetworkState() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Definimos el estado inicial en el cliente
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}
