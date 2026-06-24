import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import useVideoPreloader from './hooks/useVideoPreloader'
import LoadingScreen from './components/LoadingScreen'
import MobileGate from './components/MobileGate'
import SlideNavigation from './components/SlideNavigation'
import VoiceNotePage from './pages/VoiceNotePage'

/* ─── Slide Configuration ─── */
const SLIDES = [
  { type: 'video', src: '/assets/videos/slide-1-cover.mp4', label: 'Just For You' },
  { type: 'video', src: '/assets/videos/slide-2-intro.mp4', label: 'Hey, buka ini' },
  { type: 'video', src: '/assets/videos/slide-3-about-you.mp4', label: 'Tentang Kamu' },
  { type: 'video', src: '/assets/videos/slide-4-memory-lane.mp4', label: 'Memory Lane' },
  { type: 'video', src: '/assets/videos/slide-5-cherished.mp4', label: 'Kenangan Indah' },
  { type: 'video', src: '/assets/videos/slide-6-special.mp4', label: 'Yang Spesial' },
  { type: 'video', src: '/assets/videos/slide-7-celebrating.mp4', label: 'Merayakan' },
  { type: 'component', component: VoiceNotePage, label: 'Voice Note' },
]

const VIDEO_SOURCES = SLIDES
  .filter((s) => s.type === 'video')
  .map((s) => s.src)

/* ─── App States ─── */
const STATE = {
  LOADING: 'loading',
  MOBILE_GATE: 'mobile_gate',
  READY: 'ready',
}

function App() {
  const [appState, setAppState] = useState(STATE.LOADING)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const videoRefs = useRef({})
  const touchStartRef = useRef({ x: 0, y: 0 })
  const containerRef = useRef(null)

  // Preload all videos
  const { progress, isLoaded, blobUrls } = useVideoPreloader(VIDEO_SOURCES)

  // Check if device is mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false
    const ua = navigator.userAgent || ''
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const isSmallScreen = window.innerWidth <= 1024
    const isMobileUA = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    return (isMobileUA || isTouchDevice) && isSmallScreen
  }, [])

  /* ─── Navigation ─── */
  const goToSlide = useCallback((index) => {
    if (index < 0 || index >= SLIDES.length || isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  const goNext = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide])
  const goPrev = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide])

  /* ─── Keyboard Navigation ─── */
  useEffect(() => {
    if (appState !== STATE.READY) return
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [appState, goNext, goPrev])

  /* ─── Touch Swipe Navigation ─── */
  useEffect(() => {
    if (appState !== STATE.READY) return
    const handleTouchStart = (e) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
    }
    const handleTouchEnd = (e) => {
      const dx = touchStartRef.current.x - e.changedTouches[0].clientX
      const dy = touchStartRef.current.y - e.changedTouches[0].clientY
      // Horizontal swipe preferred, min 60px
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
        if (dx > 0) goNext()
        else goPrev()
      }
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [appState, goNext, goPrev])

  /* ─── Mouse Wheel Navigation ─── */
  useEffect(() => {
    if (appState !== STATE.READY) return
    let lastWheel = 0
    const handleWheel = (e) => {
      e.preventDefault()
      const now = Date.now()
      if (now - lastWheel < 800) return
      lastWheel = now
      if (e.deltaY > 0 || e.deltaX > 0) goNext()
      else if (e.deltaY < 0 || e.deltaX < 0) goPrev()
    }
    const el = containerRef.current
    if (el) el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      if (el) el.removeEventListener('wheel', handleWheel)
    }
  }, [appState, goNext, goPrev])

  /* ─── Video Playback Control ─── */
  useEffect(() => {
    // Pause all videos, play current one
    Object.entries(videoRefs.current).forEach(([idx, video]) => {
      if (!video) return
      if (parseInt(idx) === currentSlide) {
        video.currentTime = 0
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    })
  }, [currentSlide, appState])

  /* ─── State Machine ─── */
  const handleLoadingReady = useCallback(() => {
    if (isMobile) {
      setAppState(STATE.MOBILE_GATE)
    } else {
      setAppState(STATE.READY)
    }
  }, [isMobile])

  const handleGateDismiss = useCallback(() => {
    setAppState(STATE.READY)
  }, [])

  /* ─── Render ─── */
  if (appState === STATE.LOADING) {
    return (
      <LoadingScreen
        progress={progress}
        isLoaded={isLoaded}
        onReady={handleLoadingReady}
      />
    )
  }

  if (appState === STATE.MOBILE_GATE) {
    return <MobileGate onDismiss={handleGateDismiss} />
  }

  const slide = SLIDES[currentSlide]

  return (
    <div ref={containerRef} className="app-container">
      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="slide-viewport"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          {slide.type === 'video' ? (
            <video
              ref={(el) => { videoRefs.current[currentSlide] = el }}
              className="slide-video"
              src={blobUrls[slide.src] || slide.src}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={(e) => { e.target.pause() }}
            />
          ) : (
            <slide.component
              isActive={true}
              goToSlide={goToSlide}
              currentSlide={currentSlide}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Overlay */}
      <SlideNavigation
        current={currentSlide}
        total={SLIDES.length}
        onPrev={goPrev}
        onNext={goNext}
        onGoTo={goToSlide}
      />
    </div>
  )
}

export default App
