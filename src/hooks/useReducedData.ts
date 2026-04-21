import { useEffect, useState } from 'react'

/**
 * SOTA Performance Hook
 * Detects if the user has enabled Data Saver or has a slow connection.
 */
export function useReducedData() {
  const [isReduced, setIsReduced] = useState(false)

  useEffect(() => {
    const nav = navigator as any
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection

    const checkConnection = () => {
      const saveData = connection?.saveData
      const slowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === '3g'
      setIsReduced(!!saveData || slowConnection)
    }

    if (connection) {
      connection.addEventListener('change', checkConnection)
      checkConnection()
    }

    return () => {
      if (connection) {
        connection.removeEventListener('change', checkConnection)
      }
    }
  }, [])

  return isReduced
}
