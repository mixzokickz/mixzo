'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { Shield, MapPin, Sparkles, Package } from 'lucide-react'

// ─── Floating badge data ───
const FLOATING_BADGES = [
  {
    icon: Shield,
    label: 'Verified Authentic',
    color: '#10B981',
    // Position relative to container (percentage-based)
    x: -12,
    y: 15,
    delay: 0.6,
    orbitRadius: 8,
    orbitSpeed: 25,
  },
  {
    icon: Package,
    label: '200+ Pairs',
    color: '#FF2E88',
    x: 85,
    y: 10,
    delay: 0.8,
    orbitRadius: 6,
    orbitSpeed: 30,
  },
  {
    icon: MapPin,
    label: 'Denver, CO',
    color: '#00C2D6',
    x: 88,
    y: 72,
    delay: 1.0,
    orbitRadius: 7,
    orbitSpeed: 22,
  },
  {
    icon: Sparkles,
    label: '$20 Cleaning',
    color: '#A855F7',
    x: -8,
    y: 75,
    delay: 1.2,
    orbitRadius: 5,
    orbitSpeed: 28,
  },
]

// ─── Particle component ───
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.4 + 0.1,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 2 === 0 ? '#FF2E88' : '#00C2D6',
          }}
          animate={{
            y: [0, -60, -120],
            opacity: [0, p.opacity, 0],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Glow ring component ───
function GlowRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Outer pink ring */}
      <div
        className="absolute w-[85%] h-[85%] rounded-full animate-[spin_25s_linear_infinite]"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, #FF2E88 10%, transparent 20%, transparent 50%, #FF2E88 60%, transparent 70%)',
          opacity: 0.15,
          filter: 'blur(2px)',
        }}
      />
      {/* Middle mixed ring */}
      <div
        className="absolute w-[70%] h-[70%] rounded-full animate-[spin_20s_linear_infinite_reverse]"
        style={{
          background: 'conic-gradient(from 90deg, transparent 0%, #00C2D6 15%, transparent 30%, transparent 55%, #FF2E88 70%, transparent 85%)',
          opacity: 0.12,
          filter: 'blur(3px)',
        }}
      />
      {/* Inner cyan ring */}
      <div
        className="absolute w-[55%] h-[55%] rounded-full animate-[spin_18s_linear_infinite]"
        style={{
          background: 'conic-gradient(from 180deg, transparent 0%, #00C2D6 12%, transparent 25%, transparent 60%, #00C2D6 75%, transparent 88%)',
          opacity: 0.1,
          filter: 'blur(2px)',
        }}
      />
      {/* Static radial glow */}
      <div
        className="absolute w-[60%] h-[60%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,46,136,0.06) 0%, rgba(0,194,214,0.04) 50%, transparent 70%)',
        }}
      />
    </div>
  )
}

// ─── Floating badge component ───
function FloatingBadge({
  badge,
  index,
}: {
  badge: typeof FLOATING_BADGES[0]
  index: number
}) {
  const Icon = badge.icon

  return (
    <motion.div
      className="absolute z-20"
      style={{
        left: `${badge.x}%`,
        top: `${badge.y}%`,
      }}
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: badge.delay,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        animate={{
          y: [0, -badge.orbitRadius, 0, badge.orbitRadius, 0],
          x: [0, badge.orbitRadius * 0.5, 0, -badge.orbitRadius * 0.5, 0],
        }}
        transition={{
          duration: badge.orbitSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40"
        style={{
          background: 'rgba(20, 20, 24, 0.75)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0 animate-pulse"
          style={{ backgroundColor: badge.color, boxShadow: `0 0 8px ${badge.color}60` }}
        />
        <span className="text-[11px] font-semibold text-white/80 whitespace-nowrap tracking-wide">
          {badge.label}
        </span>
      </motion.div>
    </motion.div>
  )
}

// ─── Main showcase component ───
export function HeroShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  // Mouse tracking for 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovering(false)
  }, [mouseX, mouseY])

  return (
    <div className="hidden lg:flex items-center justify-center relative">
      <div
        ref={containerRef}
        className="relative w-full max-w-lg aspect-square cursor-default"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: '1200px' }}
      >
        {/* Glow rings behind everything */}
        <GlowRings />

        {/* Particles */}
        <Particles />

        {/* The sneaker image with 3D tilt */}
        <motion.div
          className="relative w-full h-full flex items-center justify-center z-10"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Sneaker float animation */}
          <motion.div
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-[80%] h-[80%]"
          >
            {/* Glow underneath sneaker (ground reflection) */}
            <div
              className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[70%] h-[15%] rounded-[50%]"
              style={{
                background: 'radial-gradient(ellipse, rgba(255,46,136,0.15) 0%, rgba(0,194,214,0.08) 40%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />

            {/* The sneaker image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.3,
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-full h-full"
            >
              <Image
                src="/images/library/hero-sneaker-v2.webp"
                alt="Premium sneaker with neon lighting"
                fill
                className="object-contain drop-shadow-2xl"
                priority
                sizes="(min-width: 1024px) 500px, 0px"
              />
              {/* Overlay neon sheen on hover */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle at 30% 40%, rgba(255,46,136,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(0,194,214,0.06) 0%, transparent 50%)',
                  opacity: isHovering ? 1 : 0,
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Floating badges */}
        {FLOATING_BADGES.map((badge, i) => (
          <FloatingBadge key={badge.label} badge={badge} index={i} />
        ))}

        {/* Subtle scan line / noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-30 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </div>
  )
}
