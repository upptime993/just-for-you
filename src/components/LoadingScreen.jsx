import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ROMANTIC_MESSAGES = [
  { text: 'Sedang menyiapkan sesuatu yang berharga untukmu...', emoji: '💌' },
  { text: 'Sebentar lagi, hal-hal indah akan muncul...', emoji: '✨' },
  { text: 'Memuat kenangan indah kita...', emoji: '📸' },
  { text: 'Merangkai cerita cinta kita...', emoji: '🌹' },
  { text: 'Hampir siap, sayang...', emoji: '💕' },
]

export default function LoadingScreen({ progress, onReady, isLoaded }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [showEnvelope, setShowEnvelope] = useState(true)
  const [exitAnimation, setExitAnimation] = useState(false)
  const timerRef = useRef(null)
  const minTimeRef = useRef(false)

  // Rotate messages
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ROMANTIC_MESSAGES.length)
    }, 3000)
    return () => clearInterval(timerRef.current)
  }, [])

  // Minimum display time
  useEffect(() => {
    const timer = setTimeout(() => {
      minTimeRef.current = true
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  // Trigger exit when loaded + min time passed
  useEffect(() => {
    if (isLoaded && minTimeRef.current && !exitAnimation) {
      setExitAnimation(true)
      setTimeout(() => onReady(), 800)
    } else if (isLoaded && !minTimeRef.current) {
      const check = setInterval(() => {
        if (minTimeRef.current) {
          setExitAnimation(true)
          setTimeout(() => onReady(), 800)
          clearInterval(check)
        }
      }, 100)
      return () => clearInterval(check)
    }
  }, [isLoaded, exitAnimation, onReady])

  const pct = Math.round(progress * 100)
  const currentMessage = ROMANTIC_MESSAGES[messageIndex]

  return (
    <motion.div
      className="loading-screen"
      animate={exitAnimation ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Ambient glow particles */}
      <div className="loading-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="loading-particle"
            style={{
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--delay': `${Math.random() * 5}s`,
              '--duration': `${4 + Math.random() * 4}s`,
              '--size': `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      {/* Envelope animation */}
      <motion.div
        className="loading-envelope"
        initial={{ scale: 0, rotate: -10 }}
        animate={{
          scale: [0, 1.1, 1],
          rotate: [-10, 5, 0],
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.span
          className="loading-envelope-icon"
          animate={{
            y: [0, -6, 0],
            rotate: [0, -3, 3, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          💌
        </motion.span>

        {/* Glow ring */}
        <motion.div
          className="loading-glow-ring"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.08, 0.3],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Rotating messages */}
      <div className="loading-message-container">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            className="loading-message"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            {currentMessage.text} {currentMessage.emoji}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="loading-progress-container">
        <div className="loading-progress-track">
          <motion.div
            className="loading-progress-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
          <div className="loading-progress-shimmer" />
        </div>
        <motion.span
          className="loading-progress-text"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {pct}%
        </motion.span>
      </div>

      {/* Decorative dots */}
      <div className="loading-dots">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="loading-dot"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
