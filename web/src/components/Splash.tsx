import { useEffect } from 'react'
import { motion } from 'motion/react'

const INK = '#12181c'
const TEAL = '#2bc4a8'
const COPPER = '#f09550'

/** Welcome animation: the pump icon draws itself, a drop of fuel falls, then the name appears. Tap to skip. */
export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2900)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      role="presentation"
      onClick={onDone}
      className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center gap-6"
      style={{ background: INK }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 512 512" className="w-52 max-w-[60vw]" aria-hidden>
        <motion.circle cx="256" cy="256" r="244" fill="none" stroke={TEAL} strokeWidth="7" strokeLinecap="round" transform="rotate(-90 256 256)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeInOut' }} />
        <g transform="translate(268 247) scale(.9) translate(-268 -262)">
          <motion.rect x="150" y="100" width="150" height="300" rx="24" fill="#fff" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.55, ease: 'easeOut' }} />
          <motion.rect x="178" y="130" width="94" height="70" rx="10" fill={INK} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.3 }} />
          <motion.polyline points="190,184 214,160 232,172 258,146" fill="none" stroke={TEAL} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.05, duration: 0.5 }} />
          <motion.rect x="128" y="400" width="194" height="24" rx="12" fill="#fff" initial={{ opacity: 0, scaleX: 0.3 }} animate={{ opacity: 1, scaleX: 1 }} style={{ transformOrigin: '225px 412px' }} transition={{ delay: 0.7, duration: 0.45 }} />
          <motion.path d="M300 190 H340 Q360 190 360 210 V310 Q360 336 384 336 Q408 336 408 310 V232 L384 202" fill="none" stroke="#fff" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.0, duration: 0.6, ease: 'easeOut' }} />
          <motion.circle cx="384" cy="212" r="9" fill={COPPER} initial={{ opacity: 0, cy: 212 }} animate={{ opacity: [0, 1, 1, 0], cy: [212, 212, 330, 380] }} transition={{ delay: 1.7, duration: 0.8, times: [0, 0.2, 0.8, 1], ease: 'easeIn' }} />
        </g>
      </svg>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <motion.h1 className="font-display text-3xl font-semibold uppercase tracking-[.2em] text-white" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.9, duration: 0.5 }}>Mileage Log</motion.h1>
        <motion.p className="text-sm text-white/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.5 }}>Har fill-up ka hisaab, ek jagah</motion.p>
      </div>
    </motion.div>
  )
}
