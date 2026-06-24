import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceNotePlayer from '../components/VoiceNotePlayer'

function FloatingHeart({ id }) {
  const style = useMemo(() => ({
    left: `${10 + Math.random() * 80}%`,
    bottom: '-5%',
    fontSize: `${0.6 + Math.random() * 0.8}rem`,
  }), [])

  return (
    <motion.div
      className="floating-heart"
      style={style}
      initial={{ y: 0, opacity: 0.3 }}
      animate={{
        y: typeof window !== 'undefined' ? -window.innerHeight * 0.5 : -300,
        opacity: [0.3, 0.15, 0],
        x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 30],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        delay: Math.random() * 5,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    >
      ♥
    </motion.div>
  )
}

export default function VoiceNotePage({ isActive, goToSlide, currentSlide }) {
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    if (isActive) {
      setHearts(Array.from({ length: 8 }).map((_, i) => ({ id: i })))
    }
  }, [isActive])

  return (
    <div className="voice-note-page">
      {/* Floating hearts */}
      {hearts.map((h) => (
        <FloatingHeart key={h.id} id={h.id} />
      ))}

      {/* Main content */}
      <motion.div
        className="voice-note-content"
        initial={{ opacity: 0, y: 30 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Decorative corner accents */}
        <motion.div
          style={{
            position: 'absolute',
            top: '-8px',
            left: '-8px',
            width: '24px',
            height: '24px',
            borderTop: '2px solid rgba(201, 72, 91, 0.2)',
            borderLeft: '2px solid rgba(201, 72, 91, 0.2)',
            borderRadius: '4px 0 0 0',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isActive ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.5 }}
        />
        <motion.div
          style={{
            position: 'absolute',
            bottom: '-8px',
            right: '-8px',
            width: '24px',
            height: '24px',
            borderBottom: '2px solid rgba(201, 72, 91, 0.2)',
            borderRight: '2px solid rgba(201, 72, 91, 0.2)',
            borderRadius: '0 0 4px 0',
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isActive ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.4, duration: 0.5 }}
        />

        <VoiceNotePlayer isActive={isActive} onEnded={() => goToSlide(currentSlide + 1)} />
      </motion.div>

      {/* Footer */}
      <motion.p
        className="voice-note-footer"
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        made with love ♥
      </motion.p>
    </div>
  )
}
