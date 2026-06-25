import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * MobileGate — fullscreen + landscape prompt for mobile users.
 * Only appears on mobile devices. Detects orientation changes.
 * Provides beautiful overlay with animated instructions.
 */
export default function MobileGate({ onDismiss }) {
  const [isMobile, setIsMobile] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [step, setStep] = useState(1) // 1 = fullscreen, 2 = landscape

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent || ''
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 1024
      const isMobileUA = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      return (isMobileUA || isTouchDevice) && isSmallScreen
    }
    setIsMobile(checkMobile())
  }, [])

  // Detect orientation
  useEffect(() => {
    const checkOrientation = () => {
      const landscape = window.innerWidth > window.innerHeight
      setIsLandscape(landscape)
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100) // delay for resize to settle
    })
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  // Detect fullscreen
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement)
    }
    checkFullscreen()
    document.addEventListener('fullscreenchange', checkFullscreen)
    document.addEventListener('webkitfullscreenchange', checkFullscreen)
    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen)
      document.removeEventListener('webkitfullscreenchange', checkFullscreen)
    }
  }, [])

  // Auto-advance steps
  useEffect(() => {
    if (isFullscreen && step === 1) {
      setStep(2)
    }
  }, [isFullscreen, step])

  // Auto-dismiss when both conditions met
  useEffect(() => {
    if (isFullscreen && isLandscape && !dismissed) {
      const timer = setTimeout(() => {
        setDismissed(true)
        onDismiss()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isFullscreen, isLandscape, dismissed, onDismiss])

  const requestFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement
      if (el.requestFullscreen) {
        await el.requestFullscreen()
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen()
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err)
      // Skip to landscape step
      setStep(2)
    }
  }, [])

  const handleSkip = useCallback(() => {
    setDismissed(true)
    onDismiss()
  }, [onDismiss])

  // Don't show on desktop
  if (!isMobile || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        className="mobile-gate"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mobile-gate-content">
          {/* Animated phone icon */}
          <motion.div
            className="mobile-gate-icon"
            animate={
              step === 2 && !isLandscape
                ? { rotate: [0, -90, -90, 0] }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {step === 1 ? (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12" y2="18.01" />
                <motion.path
                  d="M9 7 L12 4 L15 7"
                  animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </svg>
            ) : (
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12" y2="18.01" />
              </svg>
            )}
          </motion.div>

          {/* Instructions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="mobile-gate-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {step === 1 ? (
                <>
                  <h2 className="mobile-gate-title">Untuk pengalaman terbaik</h2>
                  <p className="mobile-gate-subtitle">
                    Buka dalam mode layar penuh untuk menikmati setiap momen
                  </p>
                  <motion.button
                    className="mobile-gate-btn"
                    onClick={requestFullscreen}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                    Masuk Layar Penuh
                  </motion.button>
                </>
              ) : (
                <>
                  <h2 className="mobile-gate-title">Putar HP-mu ke landscape</h2>
                  <p className="mobile-gate-subtitle">
                    Miringkan HP-mu agar tampilan lebih sempurna
                  </p>
                  {isLandscape && (
                    <motion.div
                      className="mobile-gate-check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      ✓ Sempurna!
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Skip button */}
          <motion.button
            className="mobile-gate-skip"
            onClick={handleSkip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 2 }}
            whileHover={{ opacity: 1 }}
          >
            Lewati →
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
