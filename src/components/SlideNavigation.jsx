import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * SlideNavigation — arrow buttons, dot indicators, slide counter.
 * Auto-hides after 3s of inactivity. Shows on tap/hover.
 * Touch-friendly with 48px minimum targets.
 */
export default function SlideNavigation({
  current,
  total,
  onPrev,
  onNext,
  onGoTo,
}) {
  const [visible, setVisible] = useState(true)
  const hideTimer = useRef(null)

  const resetHideTimer = useCallback(() => {
    setVisible(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setVisible(false), 3500)
  }, [])

  useEffect(() => {
    resetHideTimer()
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [current, resetHideTimer])

  // Show on any interaction
  useEffect(() => {
    const show = () => resetHideTimer()
    window.addEventListener('pointerdown', show, { passive: true })
    window.addEventListener('pointermove', show, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', show)
      window.removeEventListener('pointermove', show)
    }
  }, [resetHideTimer])

  const isFirst = current === 0
  const isLast = current === total - 1

  return (
    <motion.div
      className={`slide-nav ${!visible ? 'slide-nav--hidden' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {/* Left arrow */}
      <motion.button
        className={`slide-nav-arrow slide-nav-arrow--left ${isFirst ? 'slide-nav-arrow--disabled' : ''}`}
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        disabled={isFirst}
        whileTap={!isFirst ? { scale: 0.9 } : {}}
        aria-label="Slide sebelumnya"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </motion.button>

      {/* Right arrow */}
      <motion.button
        className={`slide-nav-arrow slide-nav-arrow--right ${isLast ? 'slide-nav-arrow--disabled' : ''}`}
        onClick={(e) => { e.stopPropagation(); onNext() }}
        disabled={isLast}
        whileTap={!isLast ? { scale: 0.9 } : {}}
        aria-label="Slide berikutnya"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </motion.button>

      {/* Bottom bar: dots + counter */}
      <div className="slide-nav-bottom">
        {/* Dot indicators */}
        <div className="slide-nav-dots">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              className={`slide-nav-dot ${i === current ? 'slide-nav-dot--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onGoTo(i) }}
              aria-label={`Ke slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Counter */}
        <AnimatePresence mode="wait">
          <motion.span
            key={current}
            className="slide-nav-counter"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {current + 1} / {total}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
