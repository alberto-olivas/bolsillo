'use client'

import { useEffect, useState } from 'react'

const COINS = [
  { left: '7%',  size: 18, duration: 13, delay: 0   },
  { left: '21%', size: 14, duration: 11, delay: 2.5 },
  { left: '40%', size: 22, duration: 15, delay: 1   },
  { left: '57%', size: 16, duration: 12, delay: 4   },
  { left: '73%', size: 26, duration: 14, delay: 0.5 },
  { left: '88%', size: 20, duration: 10, delay: 3   },
]

export default function CoinRain() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {COINS.map((c, i) => (
        <span
          key={i}
          className="opacity-[0.12] dark:opacity-[0.08]"
          style={{
            position: 'absolute',
            left: c.left,
            top: '-5%',
            fontSize: c.size,
            color: '#EF9F27',
            willChange: 'transform',
            animation: `coinFall ${c.duration}s ${c.delay}s linear infinite`,
          }}
        >
          €
        </span>
      ))}
    </div>
  )
}
