import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook that preloads all video files as blobs.
 * Returns progress (0-1), loaded state, and a map of src → blob URL.
 * 
 * Videos are fetched in parallel, progress is tracked by bytes received.
 * Blob URLs are created for instant playback after loading screen.
 */
export default function useVideoPreloader(videoSources) {
  const [progress, setProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [blobUrls, setBlobUrls] = useState({})
  const blobUrlsRef = useRef({})
  const abortRef = useRef(null)

  const preload = useCallback(async (sources) => {
    if (!sources || sources.length === 0) {
      setIsLoaded(true)
      setProgress(1)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    // Phase 1: HEAD requests to get total sizes
    let totalBytes = 0
    const sizes = await Promise.all(
      sources.map(async (src) => {
        try {
          const res = await fetch(src, { method: 'HEAD', signal: controller.signal })
          const len = parseInt(res.headers.get('content-length') || '0', 10)
          return len
        } catch {
          return 5 * 1024 * 1024 // estimate 5MB if HEAD fails
        }
      })
    )
    totalBytes = sizes.reduce((sum, s) => sum + s, 0) || 1

    // Phase 2: Fetch all videos with progress tracking
    let loadedBytes = 0
    const results = {}

    await Promise.all(
      sources.map(async (src, idx) => {
        try {
          const res = await fetch(src, { signal: controller.signal })

          if (!res.body) {
            // Fallback if ReadableStream not supported
            const blob = await res.blob()
            loadedBytes += sizes[idx] || blob.size
            setProgress(Math.min(loadedBytes / totalBytes, 1))
            results[src] = URL.createObjectURL(blob)
            return
          }

          const reader = res.body.getReader()
          const chunks = []
          let received = 0

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
            received += value.length
            loadedBytes += value.length
            setProgress(Math.min(loadedBytes / totalBytes, 1))
          }

          const mimeType = src.endsWith('.mp3') ? 'audio/mpeg' : 'video/mp4'
          const blob = new Blob(chunks, { type: mimeType })
          results[src] = URL.createObjectURL(blob)
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.warn(`Failed to preload ${src}:`, err)
            // Use original URL as fallback
            results[src] = src
          }
        }
      })
    )

    blobUrlsRef.current = results
    setBlobUrls(results)
    setProgress(1)

    // Small delay for smooth transition
    await new Promise(r => setTimeout(r, 400))
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    preload(videoSources)

    return () => {
      // Abort any ongoing fetches
      if (abortRef.current) {
        abortRef.current.abort()
      }
      // Revoke blob URLs
      Object.values(blobUrlsRef.current).forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, []) // Only run once on mount

  return { progress, isLoaded, blobUrls }
}
