'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endDate: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

function getTimeLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  }
}

export function CountdownTimer({ endDate, className = '', size = 'md' }: CountdownTimerProps) {
  const [time, setTime] = useState(getTimeLeft(endDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft(endDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [endDate])

  if (time.ended) {
    return (
      <span className={`font-bold text-[#FF2E88] ${className}`}>
        Ended
      </span>
    )
  }

  const sizeClasses = {
    sm: { box: 'w-10 h-10', num: 'text-sm', label: 'text-[8px]', gap: 'gap-1.5' },
    md: { box: 'w-14 h-14', num: 'text-lg', label: 'text-[9px]', gap: 'gap-2' },
    lg: { box: 'w-18 h-18', num: 'text-2xl', label: 'text-[10px]', gap: 'gap-3' },
  }

  const s = sizeClasses[size]

  const blocks = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hrs' },
    { value: time.minutes, label: 'Min' },
    { value: time.seconds, label: 'Sec' },
  ]

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {blocks.map((block) => (
        <div key={block.label} className="flex flex-col items-center">
          <div className={`${s.box} rounded-xl bg-[#141418] border border-[#1E1E26] flex items-center justify-center`}>
            <span className={`${s.num} font-bold bg-gradient-to-b from-[#FF2E88] to-[#00C2D6] bg-clip-text text-transparent tabular-nums`}>
              {String(block.value).padStart(2, '0')}
            </span>
          </div>
          <span className={`${s.label} font-semibold uppercase tracking-wider text-[#6A6A80] mt-1`}>
            {block.label}
          </span>
        </div>
      ))}
    </div>
  )
}
