'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, ShoppingCart, Info } from 'lucide-react'
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
                    router.push('/api/auth/login')
                    return
                } else {
                    throw new Error('Failed to add to cart')
                }
            }

            router.push('/marketplace/cart')
        } catch (error) {
            console.error(error)
            alert('Something went wrong. Please try again.')
            setBuying(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100">
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                <Image
                    src={medicine.image_url || 'https://placehold.co/400'}
                    alt={medicine.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Stock Badge */}
                {medicine.stock_quantity <= 5 && medicine.stock_quantity > 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        Only {medicine.stock_quantity} left
                    </div>
                )}
                {medicine.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">Out of Stock</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col h-full">
                {/* Category */}
                <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1">
                    {medicine.category}
                </div>

                {/* Name */}
                <Link href={`/marketplace/${medicine.id}`}>
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1 hover:text-emerald-600 transition-colors">
                        {medicine.name}
                    </h3>
                </Link>

                {/* Manufacturer */}
                <p className="text-xs text-gray-500 line-clamp-1 mb-2 font-medium">
                    by {medicine.manufacturer}
                </p>

                {/* Price and Actions */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-lg font-bold text-gray-900">₹{Number(medicine.price).toFixed(2)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {medicine.stock_quantity > 0 ? (
                            <>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={buying}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
                                >
                                    {buying ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-4 w-4" />
                                            Buy
                                        </>
                                    )}
                                </button>
                                <Link
                                    href={`/marketplace/${medicine.id}`}
                                    className="flex items-center justify-center px-2 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                    title="View Details"
                                >
                                    <Info className="h-4 w-4" />
                                </Link>
                            </>
                        ) : (
                            <button
                                disabled
                                className="flex-1 px-3 py-2.5 rounded-lg bg-gray-100 text-gray-400 text-sm font-bold cursor-not-allowed"
                            >
                                Out of Stock
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
