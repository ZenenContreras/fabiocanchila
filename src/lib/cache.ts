const CACHE_PREFIX = 'fc_cache_'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CacheItem<T> {
  data: T
  timestamp: number
}

export function setupCache() {
  // Clean up expired cache items
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      const item = getFromCache(key.replace(CACHE_PREFIX, ''))
      if (!item) {
        localStorage.removeItem(key)
      }
    }
  })
}

export function setCache<T>(key: string, data: T): void {
  const item: CacheItem<T> = {
    data,
    timestamp: Date.now()
  }
  localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item))
}

export function getFromCache<T>(key: string): T | null {
  const item = localStorage.getItem(CACHE_PREFIX + key)
  if (!item) return null

  const cachedItem: CacheItem<T> = JSON.parse(item)
  const now = Date.now()

  if (now - cachedItem.timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_PREFIX + key)
    return null
  }

  return cachedItem.data
}

export function clearCache(): void {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}