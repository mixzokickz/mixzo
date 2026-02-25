'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  max?: number
}

export default function ImageUpload({ images, onChange, max = 5 }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (images.length >= max) return
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        if (!images.includes(result)) {
          onChange([...images, result])
        }
      }
      reader.readAsDataURL(file)
    })
    if (fileRef.current) fileRef.current.value = ''
  }

  const remove = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)] group">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-lg border border-dashed border-[var(--border-light)] flex flex-col items-center justify-center gap-1 text-[var(--text-muted)] hover:border-[var(--pink)] hover:text-[var(--pink)] transition-colors"
          >
            <Upload size={18} />
            <span className="text-[10px]">Upload</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <p className="text-xs text-[var(--text-muted)] mt-2">{images.length}/{max} photos</p>
    </div>
  )
}
