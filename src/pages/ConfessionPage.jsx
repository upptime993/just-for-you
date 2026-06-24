import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ENGGA_TEXTS = ['ENGGA', 'YAKIN ENGGA NIH?', 'BENERAN BANGET ENGGA NIH?']

const ROMANTIC_MSGS = [
  'Aku tau kamu bakal pilih ini 💕',
  'Karena kita memang ditakdirkan bersama...',
  'Setiap detik bersamamu adalah hadiah terindah 🌹',
  'Aku janji, akan selalu menjaga hatimu ❤️',
]

/* ── Broken Heart Rain (rejection) ── */
function BrokenHeartRain() {
  const hearts = Array.from({ length: 35 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 4,
    size: 14 + Math.random() * 18,
    sway: (Math.random() - 0.5) * 80,
  }))

  return (
    <div className="confession-rain">
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="rain-heart"
          style={{ left: h.left, fontSize: h.size }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: [0, 0.9, 0.9, 0],
            x: [0, h.sway, -h.sway * 0.5],
            rotate: [0, 20, -15, 10],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          💔
        </motion.span>
      ))}
    </div>
  )
}

/* ── Celebration Hearts (acceptance) ── */
function CelebrationHearts() {
  const emojis = ['💕', '❤️', '💖', '✨', '🌹', '💗']
  const items = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 3,
    size: 16 + Math.random() * 16,
  }))

  return (
    <div className="confession-rain">
      {items.map((h) => (
        <motion.span
          key={h.id}
          className="rain-heart"
          style={{ left: h.left, fontSize: h.size }}
          initial={{ y: '110vh', opacity: 0 }}
          animate={{
            y: -60,
            opacity: [0, 1, 1, 0],
            x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          {h.emoji}
        </motion.span>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════ */
/*            CONFESSION PAGE                */
/* ══════════════════════════════════════════ */
export default function ConfessionPage({ isActive }) {
  // Phases: asking | rejected | accepted | writing
  const [phase, setPhase] = useState('asking')
  const [enggaCount, setEnggaCount] = useState(0)
  const [enggaPos, setEnggaPos] = useState(null)
  const [msgIndex, setMsgIndex] = useState(0)
  const [showWriting, setShowWriting] = useState(false)
  const [letter, setLetter] = useState('')
  const [showRetry, setShowRetry] = useState(false)
  const containerRef = useRef(null)

  // Reset when navigating back
  useEffect(() => {
    if (!isActive) {
      setPhase('asking')
      setEnggaCount(0)
      setEnggaPos(null)
      setMsgIndex(0)
      setShowWriting(false)
      setLetter('')
      setShowRetry(false)
    }
  }, [isActive])

  /* ── ENGGA dodge logic ── */
  const dodgeEngga = useCallback(() => {
    const next = enggaCount + 1
    if (next >= 3) {
      setPhase('rejected')
      setTimeout(() => setShowRetry(true), 4000)
      return
    }
    setEnggaCount(next)
    // Random position within safe bounds
    const vw = window.innerWidth
    const vh = window.innerHeight
    const bw = 200, bh = 56
    const x = 40 + Math.random() * (vw - bw - 80)
    const y = 80 + Math.random() * (vh - bh - 160)
    setEnggaPos({ x, y })
  }, [enggaCount])

  /* ── MAU accepted logic ── */
  const handleMau = useCallback(() => {
    setPhase('accepted')
    setMsgIndex(0)
  }, [])

  // Cascade romantic messages then show writing
  useEffect(() => {
    if (phase !== 'accepted') return
    if (msgIndex < ROMANTIC_MSGS.length) {
      const t = setTimeout(() => setMsgIndex((i) => i + 1), 2200)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setShowWriting(true), 1200)
      return () => clearTimeout(t)
    }
  }, [phase, msgIndex])

  /* ── WhatsApp redirect ── */
  const sendToWhatsApp = () => {
    const text = `Hai sayang 💕\n\nAku MAU jadi pacar kamu!\n\nKenapa aku mau sama kamu:\n${letter}\n\n— from "Just For You" 💌`
    const url = `https://wa.me/6281774954859?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const retryAsk = () => {
    setPhase('asking')
    setEnggaCount(0)
    setEnggaPos(null)
    setShowRetry(false)
  }

  /* ══════ RENDER ══════ */
  return (
    <div ref={containerRef} className="confession-page">
      {/* ─── ASKING PHASE ─── */}
      <AnimatePresence mode="wait">
        {phase === 'asking' && (
          <motion.div
            key="asking"
            className="confession-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            <motion.p
              className="confession-question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Jadi, kamu mau gak
              <br />
              jadi pacar aku? 🥺
            </motion.p>

            <div className="confession-buttons">
              {/* MAU button */}
              <motion.button
                className="confession-btn confession-btn--mau"
                onClick={handleMau}
                whileHover={{ scale: 1.06, boxShadow: '0 8px 30px rgba(201,72,91,0.5)' }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 120 }}
              >
                MAU 💕
              </motion.button>

              {/* ENGGA button — dodges */}
              <motion.button
                className="confession-btn confession-btn--engga"
                onClick={(e) => { e.stopPropagation(); dodgeEngga() }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 30 }}
                animate={{
                  opacity: 1,
                  x: enggaPos ? enggaPos.x - window.innerWidth / 2 + 100 : 0,
                  y: enggaPos ? enggaPos.y - window.innerHeight / 2 + 28 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ position: enggaPos ? 'fixed' : 'relative', left: enggaPos ? 0 : undefined, top: enggaPos ? 0 : undefined, zIndex: 60 }}
              >
                {ENGGA_TEXTS[Math.min(enggaCount, ENGGA_TEXTS.length - 1)]}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── REJECTED PHASE ─── */}
        {phase === 'rejected' && (
          <motion.div
            key="rejected"
            className="confession-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BrokenHeartRain />
            <motion.p
              className="confession-sad-msg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              yaudah deh gak papa
              <br />
              aku gak maksa....
            </motion.p>
            <motion.span
              className="confession-sad-emoji"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: 'spring' }}
            >
              😢
            </motion.span>

            <AnimatePresence>
              {showRetry && (
                <motion.button
                  className="confession-retry"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={retryAsk}
                >
                  tapi... kalau berubah pikiran, klik di sini 💕
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── ACCEPTED PHASE ─── */}
        {phase === 'accepted' && !showWriting && (
          <motion.div
            key="accepted"
            className="confession-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CelebrationHearts />
            <div className="confession-msgs">
              {ROMANTIC_MSGS.slice(0, msgIndex).map((msg, i) => (
                <motion.p
                  key={i}
                  className="confession-romantic-msg"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {msg}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* ─── WRITING PHASE ─── */}
        {showWriting && (
          <motion.div
            key="writing"
            className="confession-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              className="confession-envelope"
              initial={{ rotateX: 90 }}
              animate={{ rotateX: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
            >
              <div className="envelope-flap" />
              <div className="envelope-body">
                <p className="envelope-label">
                  Ceritain, kenapa kamu mau sama aku? 💌
                </p>
                <textarea
                  className="envelope-textarea"
                  placeholder="Tulis di sini..."
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <div className="envelope-footer">
                  <span className="envelope-charcount">
                    {letter.length}/500
                  </span>
                  <motion.button
                    className="confession-btn confession-btn--send"
                    onClick={sendToWhatsApp}
                    disabled={letter.trim().length === 0}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Kirim ke WhatsApp 💌
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
