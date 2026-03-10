'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react'

export interface SpinWheelEntry {
  id: string
  customer_name: string
  customer_email: string
  entry_number: number
}

type Entry = SpinWheelEntry

interface SpinWheelProps {
  entries: Entry[]
  onWinnerSelected: (entry: Entry) => void
  disabled?: boolean
}

const COLORS = ['#FF2E88', '#00C2D6', '#FF2E88', '#00C2D6']

export function SpinWheel({ entries, onWinnerSelected, disabled }: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Entry | null>(null)
  const [rotation, setRotation] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const rotRef = useRef(0)

  const segmentAngle = entries.length > 0 ? (2 * Math.PI) / entries.length : 0

  const drawWheel = useCallback((ctx: CanvasRenderingContext2D, size: number, currentRotation: number) => {
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 8

    ctx.clearRect(0, 0, size, size)

    if (entries.length === 0) {
      ctx.fillStyle = '#141418'
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.fillStyle = '#6A6A80'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No entries yet', cx, cy)
      return
    }

    entries.forEach((entry, i) => {
      const startAngle = currentRotation + i * segmentAngle
      const endAngle = startAngle + segmentAngle

      // Segment
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()

      const colorIdx = i % COLORS.length
      ctx.fillStyle = COLORS[colorIdx]
      ctx.globalAlpha = i % 2 === 0 ? 1 : 0.7
      ctx.fill()
      ctx.globalAlpha = 1

      // Border
      ctx.strokeStyle = '#0C0C0C'
      ctx.lineWidth = 2
      ctx.stroke()

      // Text
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + segmentAngle / 2)

      const name = entry.customer_name.length > 12
        ? entry.customer_name.slice(0, 11) + '...'
        : entry.customer_name

      ctx.fillStyle = '#FFFFFF'
      const fontSize = entries.length > 20 ? 10 : entries.length > 10 ? 12 : 14
      ctx.font = `bold ${fontSize}px -apple-system, sans-serif`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(name, radius - 16, 0)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 30, 0, 2 * Math.PI)
    ctx.fillStyle = '#0C0C0C'
    ctx.fill()
    ctx.strokeStyle = '#FF2E88'
    ctx.lineWidth = 3
    ctx.stroke()

    // Pointer (top)
    ctx.beginPath()
    ctx.moveTo(cx - 14, 4)
    ctx.lineTo(cx + 14, 4)
    ctx.lineTo(cx, 28)
    ctx.closePath()
    ctx.fillStyle = '#FF2E88'
    ctx.fill()
    ctx.strokeStyle = '#0C0C0C'
    ctx.lineWidth = 2
    ctx.stroke()
  }, [entries, segmentAngle])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    drawWheel(ctx, size, rotation)
  }, [rotation, entries, drawWheel])

  function spin() {
    if (spinning || entries.length === 0 || disabled) return

    setSpinning(true)
    setWinner(null)

    // Pick a random winner
    const winnerIndex = Math.floor(Math.random() * entries.length)
    const selectedEntry = entries[winnerIndex]

    // Calculate final rotation:
    // The pointer is at the top (270 degrees / -PI/2 from standard position)
    // We need the winner segment centered at the top
    const spins = 5 + Math.random() * 5 // 5-10 full spins
    const winnerMidAngle = winnerIndex * segmentAngle + segmentAngle / 2
    // Pointer is at top = -PI/2 (or 3PI/2)
    // We want -rotation + 3PI/2 = winnerMidAngle
    // rotation = 3PI/2 - winnerMidAngle + spins * 2PI
    const targetRotation = -(winnerMidAngle - (3 * Math.PI / 2)) + spins * 2 * Math.PI

    const startRotation = rotRef.current
    const totalRotation = targetRotation - startRotation
    const duration = 5000 + Math.random() * 3000 // 5-8 seconds
    const startTime = performance.now()

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3)
    }

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      const currentRot = startRotation + totalRotation * eased

      rotRef.current = currentRot
      setRotation(currentRot)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setSpinning(false)
        setWinner(selectedEntry)
        onWinnerSelected(selectedEntry)
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }

  function reset() {
    setWinner(null)
    setSpinning(false)
    if (animRef.current) cancelAnimationFrame(animRef.current)
  }

  function toggleFullscreen() {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.()
      setFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setFullscreen(false)
    }
  }

  useEffect(() => {
    function onFsChange() {
      setFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const canvasSize = fullscreen ? 600 : 400

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center gap-6 ${
        fullscreen ? 'fixed inset-0 z-50 bg-[#0C0C0C] flex items-center justify-center p-8' : ''
      }`}
    >
      <div className="flex items-center gap-2 self-end">
        <button
          onClick={reset}
          className="p-2 rounded-lg bg-[#141418] border border-[#1E1E26] text-[#6A6A80] hover:text-white hover:border-[#FF2E88]/30 transition-colors cursor-pointer"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-[#141418] border border-[#1E1E26] text-[#6A6A80] hover:text-white hover:border-[#FF2E88]/30 transition-colors cursor-pointer"
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="max-w-full"
          style={{ width: canvasSize, height: canvasSize }}
        />

        {/* Center spin button */}
        {!spinning && !winner && entries.length > 0 && (
          <button
            onClick={spin}
            disabled={disabled}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed z-10"
          >
            SPIN
          </button>
        )}

        {spinning && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#0C0C0C] border-2 border-[#FF2E88] flex items-center justify-center z-10">
            <span className="text-[10px] font-bold text-[#FF2E88] animate-pulse">...</span>
          </div>
        )}
      </div>

      {winner && (
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <p className="text-sm text-[#6A6A80] mb-1">Winner</p>
          <p className="text-2xl font-black bg-gradient-to-r from-[#FF2E88] to-[#00C2D6] bg-clip-text text-transparent">
            {winner.customer_name}
          </p>
          <p className="text-sm text-[#A0A0B8]">{winner.customer_email}</p>
          <p className="text-xs text-[#6A6A80] mt-1">Entry #{winner.entry_number}</p>
        </div>
      )}
    </div>
  )
}
