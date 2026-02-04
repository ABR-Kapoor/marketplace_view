'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Zap } from 'lucide-react'
import type { Medicine } from '@/types'

export function MedicineCard({ medicine }: { medicine: Medicine }) {
    const router = useRouter()
    const [buying, setBuying] = useState(false)

    const handleBuyNow = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (buying || medicine.stock_quantity <= 0) return
        setBuying(true)

        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medicineId: medicine.id, quantity: 1 }),
            })

            if (!res.ok) {
                if (res.status === 401) {
                    // Redirect to Kinde login
                    router.push('/api/auth/login')
                    return
                } else {
                    throw new Error('Failed to add to cart')
                }
                setBuying(false)
                return
            }

            router.push('/marketplace/checkout')
        } catch (error) {
            console.error(error)
            alert('Something went wrong. Please try again.')
            setBuying(false)
        }
    }

    return (
        <div className="group glass-card-hover rounded-2xl p-4 flex flex-col h-full animate-fadeIn transition-all duration-300">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-50 mb-4 mix-blend-multiply border border-gray-100">
                <Image
                    src={medicine.image_url || 'https://placehold.co/400'}
                    alt={medicine.name}
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                {medicine.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider shadow-sm">Out of Stock</span>
                    </div>
                )}
            </div>
            <div className="flex-1">
                <div className="text-xs font-bold text-emerald-600 mb-1 uppercase tracking-wider">{medicine.category}</div>
                <Link href={`/marketplace/${medicine.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-emerald-700 transition-colors">{medicine.name}</h3>
                </Link>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 font-medium">{medicine.manufacturer}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-y-2 mt-auto pt-4 border-t border-gray-100">
                <span className="text-xl font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">₹{Number(medicine.price).toFixed(2)}</span>

                <div className="flex items-center gap-2">
                    {medicine.stock_quantity > 0 && (
                        <button
                            onClick={handleBuyNow}
                            disabled={buying}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl btn-primary text-xs font-bold shadow-green-md disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                            suppressHydrationWarning
                        >
                            {buying ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Zap className="h-3 w-3" /> Buy Now</>}
                        </button>
                    )}

                    {medicine.stock_quantity > 0 ? (
                        <Link
                            href={`/marketplace/${medicine.id}`}
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm hover:rotate-90"
                            title="View Details"
                        >
                            <Plus className="h-5 w-5" />
                        </Link>
                    ) : (
                        <button disabled className="w-9 h-9 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center cursor-not-allowed">
                            <Plus className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
