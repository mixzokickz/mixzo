'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ScanForm from '@/components/admin/scan-form'
import { useRouter } from 'next/navigation'

export default function NewProductPage() {
  const router = useRouter()

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
        <ArrowLeft size={16} /> Products
      </Link>

      <h1 className="text-2xl font-bold text-white">Add Product</h1>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <ScanForm onSuccess={() => router.push('/admin/products')} />
      </div>
    </div>
  )
}
