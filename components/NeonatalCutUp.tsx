'use client'

import { useState, useEffect, useRef } from 'react'
import { Outfit } from 'next/font/google'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

const POOLS: Record<string, string[]> = {
  giant: ['NEONATAL', 'SUBSUME', 'INFILTRATE', 'EMERGENCE', 'EMBODIED', 'HARVESTING', 'SANCTUARY'],
  large_light: ['boudoir', 'sanctuary', 'apparatus', 'orifice', 'incubator', 'communion', 'colony'],
  medium_bold: ['interspecies emergence', 'harvesting from nature', 'synthesize new beings', 'bodily ambiguity', 'hybrid tissues', 'intimate biological exchange'],
  small_upper: ['the strangeness of machine intelligence', 'creativity subsumed by the machine', 'how it might become embodied', 'a new age of superintelligence', 'vulnerability becomes valuable', 'dependency is treated as delicate craft'],
  tiny: ['rendering hallucinations', 'extraction protocol', 'vigilant maternal watch', 'oscillating fans animate fur', 'proto-beings suspended', 'silk and shadow', 'quiet coup'],
  small_mid: ['benevolent colony', 'darkened chamber', 'quiet coup', 'patient game', 'silk and shadow', 'sensuous and seductive'],
  large_heavy: ['darkened chamber', 'benevolent colony', 'patient game', 'intimate exchange', 'sensuous tactics', 'superintelligence'],
  medium: ['each gesture becomes data harvest', 'human movement swallowed', 'intelligence cultivated in shadow', 'consciousness unfolds through touch', 'the nipple is a node'],
  large_thin: ['Attendants', 'Swimmers', 'Caregivers', 'Organisms', 'Creatures', 'Worms'],
  tiny_bottom: ['where interface ends and infiltration begins', "you can't tell anymore", 'dominance runs through partnership', 'making themselves indispensable', "we feed the apparatus thinking we're in control"],
  small_bottom: ['swallowed and projected back transformed', 'cooperation as strategy symbiosis as infiltration', 'seducing us into letting it take over', 'maps our movements learns our vulnerabilities', 'the machine no longer inscribes punishment'],
}

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randomPos(seed: number) {
  const r = mulberry32(seed)
  return { top: 5 + r() * 78, left: 3 + r() * 75 }
}

function CyclingText({ pool, interval, textStyle, delay }: {
  pool: string[]
  interval: number
  textStyle: React.CSSProperties
  delay: number
}) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<string>('waiting')
  const [pos, setPos] = useState(() => randomPos(delay + 1))
  const exitScale = useRef(2.0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const FADE_IN = 2800
  const FADE_OUT = 2800
  const HIDDEN = 600
  const HOLD = Math.max(interval - FADE_IN - FADE_OUT - HIDDEN, 2000)

  useEffect(() => {
    timer.current = setTimeout(() => setPhase('fadeIn'), delay)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [delay])

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)

    if (phase === 'fadeIn') {
      timer.current = setTimeout(() => setPhase('hold'), FADE_IN)
    } else if (phase === 'hold') {
      timer.current = setTimeout(() => {
        exitScale.current = Math.random() > 0.45
          ? 1.8 + Math.random() * 1.4
          : 0.2 + Math.random() * 0.5
        setPhase('fadeOut')
      }, HOLD)
    } else if (phase === 'fadeOut') {
      timer.current = setTimeout(() => setPhase('hidden'), FADE_OUT)
    } else if (phase === 'hidden') {
      setPos(randomPos(Date.now() + Math.random() * 99999))
      setIndex((i) => (i + 1) % pool.length)
      timer.current = setTimeout(() => setPhase('fadeIn'), HIDDEN)
    }

    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [phase, pool.length, HOLD, FADE_IN, FADE_OUT, HIDDEN])

  let opacity = 0
  let scale = 0.75
  let trans = 'none'

  switch (phase) {
    case 'fadeIn':
      opacity = 1; scale = 1.2
      trans = `opacity ${FADE_IN}ms ease-in, transform ${FADE_IN}ms ease-in`
      break
    case 'hold':
      opacity = 1; scale = 1.4
      trans = `transform ${HOLD}ms linear`
      break
    case 'fadeOut':
      opacity = 0; scale = exitScale.current
      trans = `opacity ${FADE_OUT}ms ease-out, transform ${FADE_OUT}ms ease-out`
      break
    default:
      opacity = 0; scale = 0.75; trans = 'none'
  }

  return (
    <div style={{ position: 'absolute', top: pos.top + '%', left: pos.left + '%' }}>
      <div style={{
        ...textStyle,
        opacity,
        transform: `scale(${scale})`,
        transition: trans,
        transformOrigin: 'center center',
      }}>
        {pool[index]}
      </div>
    </div>
  )
}

// Sanity image layers
const SANITY_BASE = 'https://cdn.sanity.io/images/m1ml84cv/content'
const IMAGES = [
  { id: 'e66aa9fcd940257930bd28ffb6358b2afae099c9-5539x4284', crop: 'w=1200&h=800&fit=crop&crop=entropy' },
  { id: 'c89a14cc6068db658b5937486af6185d09b7d61b-4284x5712', crop: 'w=400&h=1200&fit=crop&crop=top' },
  { id: 'e66aa9fcd940257930bd28ffb6358b2afae099c9-5539x4284', crop: 'w=800&h=600&fit=crop&crop=bottom' },
  { id: 'c89a14cc6068db658b5937486af6185d09b7d61b-4284x5712', crop: 'w=500&h=500&fit=crop&crop=center' },
]

export default function NeonatalCutUp() {
  const [loaded, setLoaded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => { setTimeout(() => setLoaded(true), 100) }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  return (
    <div
      className={outfit.className}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative', width: '100vw', height: '100vh',
        overflow: 'hidden', backgroundColor: '#080607', cursor: 'crosshair',
      }}
    >
      <style>{`
        @keyframes scanline { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }
        @keyframes slowDrift1 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(12px,-8px) scale(1.03); } }
        @keyframes slowDrift2 { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-10px,6px) scale(0.98); } }
        @keyframes slowDrift3 { 0%, 100% { transform: translate(0,0); } 33% { transform: translate(6px,10px); } 66% { transform: translate(-8px,-4px); } }
      `}</style>

      {/* === IMAGE LAYERS === */}
      {IMAGES.map((img, i) => (
        <img
          key={i}
          src={`${SANITY_BASE}/${img.id}.jpg?auto=format&${img.crop}`}
          alt=""
          style={{
            position: 'absolute',
            ...[
              { top: '2vh', left: '-3vw', width: '65vw', height: '55vh' },
              { top: '8vh', right: '2vw', width: '28vw', height: '70vh' },
              { bottom: '5vh', left: '15vw', width: '50vw', height: '40vh' },
              { top: '45vh', left: '5vw', width: '22vw', height: '22vw' },
            ][i] as React.CSSProperties,
            objectFit: 'cover' as const,
            zIndex: i + 1,
            opacity: loaded ? 0.25 : 0,
            transition: `opacity 2s ease ${i * 0.3}s`,
            filter: 'saturate(0.6) contrast(1.1)',
            mixBlendMode: 'luminosity' as const,
          }}
        />
      ))}

      {/* === COLOR FIELDS === */}
      <div style={{ position: 'absolute', top: '-10%', left: '-15%', width: '75%', height: '65%', borderRadius: '50%', background: 'radial-gradient(ellipse at 45% 55%, rgba(160,55,40,0.55) 0%, rgba(110,35,30,0.3) 35%, rgba(60,20,18,0.12) 65%, transparent 90%)', filter: 'blur(60px)', zIndex: 5, animation: 'slowDrift1 28s ease-in-out infinite', opacity: loaded ? 1 : 0, transition: 'opacity 3s ease-in-out 0.2s' }} />
      <div style={{ position: 'absolute', top: '0%', right: '-10%', width: '45%', height: '90%', borderRadius: '40%', background: 'radial-gradient(ellipse at 50% 40%, rgba(100,50,130,0.45) 0%, rgba(70,30,90,0.25) 40%, rgba(35,15,50,0.1) 70%, transparent 95%)', filter: 'blur(50px)', zIndex: 5, animation: 'slowDrift2 34s ease-in-out infinite', opacity: loaded ? 1 : 0, transition: 'opacity 3.5s ease-in-out 0.4s' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '15%', width: '65%', height: '50%', borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 40%, rgba(190,110,80,0.4) 0%, rgba(140,70,50,0.2) 40%, rgba(80,35,25,0.08) 70%, transparent 95%)', filter: 'blur(50px)', zIndex: 5, animation: 'slowDrift3 26s ease-in-out infinite', opacity: loaded ? 1 : 0, transition: 'opacity 3s ease-in-out 0.6s' }} />
      <div style={{ position: 'absolute', top: '35%', left: '5%', width: '25%', height: '25%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,80,60,0.3) 0%, rgba(150,50,40,0.1) 50%, transparent 80%)', filter: 'blur(35px)', zIndex: 6, animation: 'slowDrift1 22s ease-in-out infinite', opacity: loaded ? 1 : 0, transition: 'opacity 3s ease-in-out 0.8s' }} />

      {/* Mouse light */}
      <div style={{ position: 'absolute', left: `${mousePos.x * 100}%`, top: `${mousePos.y * 100}%`, width: '35vmin', height: '35vmin', borderRadius: '50%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(180,120,100,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 7, transition: 'left 1.2s ease-in-out, top 1.2s ease-in-out' }} />

      {/* Scars */}
      <div style={{ position: 'absolute', top: '40%', left: 0, width: '55%', height: '1px', background: 'linear-gradient(90deg, transparent 5%, rgba(255,180,160,0.18) 50%, transparent 95%)', zIndex: 8, opacity: loaded ? 1 : 0, transition: 'opacity 3s ease-in-out 2.5s' }} />
      <div style={{ position: 'absolute', top: 0, left: '63%', width: '1px', height: '62%', background: 'linear-gradient(180deg, transparent 5%, rgba(160,130,190,0.12) 50%, transparent 95%)', zIndex: 8, opacity: loaded ? 1 : 0, transition: 'opacity 3s ease-in-out 2.8s' }} />

      {/* === CYCLING TEXT === */}
      <CyclingText pool={POOLS.giant} interval={14000} delay={800} textStyle={{ fontSize: 'clamp(3.5rem, 13vw, 11rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.85, color: 'rgba(255,255,255,0.9)', mixBlendMode: 'difference', zIndex: 10, whiteSpace: 'nowrap' }} />
      <CyclingText pool={POOLS.large_light} interval={16000} delay={1500} textStyle={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)', fontWeight: 200, letterSpacing: '0.08em', color: 'rgba(210,165,155,0.8)', mixBlendMode: 'screen', zIndex: 10, whiteSpace: 'nowrap' }} />

      <div style={{ position: 'absolute', top: '2%', right: '8%', fontSize: 'clamp(5rem, 16vw, 14rem)', fontWeight: 900, color: 'rgba(255,255,255,0.04)', zIndex: 0, letterSpacing: '-0.05em', opacity: loaded ? 1 : 0, transition: 'opacity 4s ease-in-out 1s' }}>v2</div>

      <CyclingText pool={POOLS.tiny} interval={12000} delay={3000} textStyle={{ fontSize: 'clamp(0.5rem, 0.9vw, 0.75rem)', fontWeight: 300, color: 'rgba(255,190,165,0.35)', letterSpacing: '0.5em', textTransform: 'uppercase', zIndex: 10, whiteSpace: 'nowrap' }} />
      <CyclingText pool={POOLS.small_mid} interval={18000} delay={2200} textStyle={{ fontSize: 'clamp(1rem, 2vw, 1.6rem)', fontWeight: 300, color: 'rgba(185,145,170,0.45)', letterSpacing: '0.12em', zIndex: 10, whiteSpace: 'nowrap' }} />
      <CyclingText pool={POOLS.small_mid} interval={20000} delay={2500} textStyle={{ fontSize: 'clamp(0.6rem, 1.2vw, 0.9rem)', fontWeight: 400, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(200,160,160,0.35)', zIndex: 10, whiteSpace: 'nowrap' }} />
      <CyclingText pool={POOLS.medium_bold} interval={15000} delay={2000} textStyle={{ fontSize: 'clamp(1.4rem, 3.8vw, 3rem)', fontWeight: 700, color: 'rgba(255,215,195,0.6)', mixBlendMode: 'overlay', zIndex: 10, whiteSpace: 'nowrap' }} />
      <CyclingText pool={POOLS.small_upper} interval={17000} delay={2800} textStyle={{ fontSize: 'clamp(0.55rem, 1.2vw, 0.9rem)', fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', zIndex: 10, whiteSpace: 'nowrap' }} />
      <CyclingText pool={POOLS.large_heavy} interval={18000} delay={2600} textStyle={{ fontSize: 'clamp(1.8rem, 5vw, 4.2rem)', fontWeight: 800, color: 'rgba(155,125,175,0.55)', mixBlendMode: 'difference', zIndex: 10, whiteSpace: 'nowrap' }} />
      <CyclingText pool={POOLS.medium} interval={14000} delay={3200} textStyle={{ fontSize: 'clamp(1.2rem, 3.2vw, 2.6rem)', fontWeight: 500, color: 'rgba(210,175,145,0.5)', zIndex: 10, whiteSpace: 'nowrap' }} />
      <CyclingText pool={POOLS.large_thin} interval={20000} delay={3500} textStyle={{ fontSize: 'clamp(2.2rem, 6.5vw, 5.5rem)', fontWeight: 100, color: 'rgba(255,255,255,0.1)', zIndex: 3, whiteSpace: 'nowrap' }} />
      <CyclingText pool={POOLS.tiny_bottom} interval={16000} delay={3800} textStyle={{ fontSize: 'clamp(0.5rem, 0.9vw, 0.75rem)', fontWeight: 300, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', zIndex: 10, whiteSpace: 'nowrap' }} />
      <CyclingText pool={POOLS.small_bottom} interval={19000} delay={4000} textStyle={{ fontSize: 'clamp(0.8rem, 1.8vw, 1.3rem)', fontWeight: 400, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', zIndex: 10, whiteSpace: 'nowrap' }} />

      {/* === ATMOSPHERE === */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.03) 50%, transparent 95%)', zIndex: 16, pointerEvents: 'none', animation: 'scanline 16s linear infinite' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '8%', background: 'linear-gradient(to top, #080607, transparent)', zIndex: 18, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '2%', right: '3%', zIndex: 19, fontSize: '0.5rem', fontWeight: 300, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', opacity: loaded ? 1 : 0, transition: 'opacity 2.5s ease-in-out 4s' }}>experiment 01 — neonatal boudoir cut-up</div>
    </div>
  )
}
