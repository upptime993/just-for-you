import { useRef, useState, useEffect, useCallback, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BacksoundContext } from '../App'

export default function VoiceNotePlayer({ isActive, onEnded, audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bars, setBars] = useState(new Array(50).fill(4))

  const { pauseBacksound, resumeBacksound } = useContext(BacksoundContext)

  const audioRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const animFrameRef = useRef(null)
  const progressRef = useRef(null)
  const connectedRef = useRef(false)

  const onEndedRef = useRef(onEnded)
  useEffect(() => {
    onEndedRef.current = onEnded
  }, [onEnded])

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(audioUrl || '/assets/voice-note.mp3')
    audio.preload = 'auto'
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setCurrentTime(0)
      audio.currentTime = 0
      resumeBacksound()
      if (onEndedRef.current) {
        onEndedRef.current()
      }
    })

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })

    return () => {
      audio.pause()
      audio.src = ''
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  // Setup Web Audio API analyzer (optional — audio plays even if this fails)
  const setupAnalyser = useCallback(() => {
    if (connectedRef.current || !audioRef.current) return

    try {
      // crossOrigin needed for Web Audio API analyzer
      audioRef.current.crossOrigin = 'anonymous'

      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.75

      const source = ctx.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(ctx.destination)

      audioContextRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = source
      connectedRef.current = true
    } catch (err) {
      // Analyzer failed — audio will still play, just no waveform
      console.warn('Waveform analyzer unavailable:', err)
      connectedRef.current = true // prevent retry
    }
  }, [])

  // Animate waveform bars
  const animateBars = useCallback(() => {
    if (!analyserRef.current) {
      const idle = Array.from({ length: 50 }).map((_, i) => {
        const wave = Math.sin(Date.now() / 600 + i * 0.3) * 8 + 10
        return Math.max(3, wave)
      })
      setBars(idle)
    } else {
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyserRef.current.getByteFrequencyData(dataArray)

      const barCount = 50
      const step = Math.floor(bufferLength / barCount)
      const newBars = []

      for (let i = 0; i < barCount; i++) {
        const idx = Math.min(i * step, bufferLength - 1)
        const value = dataArray[idx]
        const height = Math.max(3, (value / 255) * 56)
        newBars.push(height)
      }
      setBars(newBars)
    }

    animFrameRef.current = requestAnimationFrame(animateBars)
  }, [])

  // Start/stop animation loop
  useEffect(() => {
    if (isPlaying) {
      animateBars()
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      const idle = Array.from({ length: 50 }).map((_, i) => {
        const center = 25
        const dist = Math.abs(i - center)
        return Math.max(3, 14 - dist * 0.4)
      })
      setBars(idle)
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPlaying, animateBars])

  const togglePlay = async () => {
    if (!audioRef.current) return

    try {
      // Setup analyzer on first play (optional, won't block playback)
      if (!connectedRef.current) {
        setupAnalyser()
      }

      // Resume suspended AudioContext (required by browser autoplay policy)
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume().catch(() => {})
      }

      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        resumeBacksound()
      } else {
        pauseBacksound()
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.warn('Playback failed:', err)
      // Last resort: try playing without analyzer
      try {
        pauseBacksound()
        audioRef.current.play()
        setIsPlaying(true)
      } catch (_) {}
    }
  }

  const handleProgressClick = (e) => {
    if (!progressRef.current || !audioRef.current || !duration) return
    const rect = progressRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    audioRef.current.currentTime = pct * duration
    setCurrentTime(pct * duration)
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      {/* Couple Photo */}
      <motion.div
        className="voice-note-photo-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={isActive ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 100 }}
      >
        <div className="voice-note-photo">
          <img
            src="/assets/couple-photo.jpg"
            alt="Us"
          />
        </div>
        {/* Ring glow when playing */}
        <AnimatePresence>
          {isPlaying && (
            <motion.div
              className="voice-note-ring"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1.25, opacity: [0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Title */}
      <motion.h2
        className="voice-note-title"
        initial={{ opacity: 0, y: 15 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        a voice note, just for you 🎙️
      </motion.h2>

      {/* Waveform Visualizer */}
      <motion.div
        className="voice-note-waveform"
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        {bars.map((height, i) => (
          <div
            key={i}
            className="waveform-bar"
            style={{
              height: `${height}px`,
              opacity: isPlaying ? 0.85 : 0.35,
              transition: 'height 0.1s ease, opacity 0.3s ease',
            }}
          />
        ))}
      </motion.div>

      {/* Play/Pause Button */}
      <motion.button
        onClick={togglePlay}
        className="voice-note-play-btn"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={isActive ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.9, type: 'spring', stiffness: 200 }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
            <rect x="4" y="3" width="4" height="14" rx="1" />
            <rect x="12" y="3" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
            <polygon points="5,2 18,10 5,18" />
          </svg>
        )}
      </motion.button>

      {/* Progress Bar */}
      <motion.div
        className="voice-note-progress"
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 1.1 }}
      >
        <span className="voice-note-time">
          {formatTime(currentTime)}
        </span>
        <div
          ref={progressRef}
          className="voice-note-track"
          onClick={handleProgressClick}
        >
          <div className="voice-note-track-inner">
            <div
              className="voice-note-track-fill"
              style={{ width: `${progress}%` }}
            >
              <div className="voice-note-track-thumb" />
            </div>
          </div>
        </div>
        <span className="voice-note-time">
          {formatTime(duration)}
        </span>
      </motion.div>
    </div>
  )
}
