'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Loader2, Check } from 'lucide-react'

export function AddToCartButton({
    medicineId,
    maxQuantity,
    price
}: {
    medicineId: string
    maxQuantity: number
    price: number
}) {
    const [loading, setLoading] = useState(false)
    const [added, setAdded] = useState(false)
    const router = useRouter()

    const handleAddToCart = async () => {
        if (loading) return
        setLoading(true)

        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medicineId, quantity: 1 }),
            })

            if (!res.ok) throw new Error('Failed to add to cart')

            setAdded(true)
            router.refresh()
            setTimeout(() => setAdded(false), 2000)
        } catch (error) {
            alert('Error adding to cart')
        } finally {
            setLoading(false)
        }
    }

    if (maxQuantity <= 0) {
        return (
            <button
                disabled
                className="w-full py-4 rounded-xl bg-gray-100 text-gray-400 font-bold cursor-not-allowed flex items-center justify-center gap-2"
            >
                Out of Stock
            </button>
        )
    }

    return (
        <button
            onClick={handleAddToCart}
            disabled={loading || added}
            className={`
        w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/10
        ${added
                    ? 'bg-green-500 text-white'
                    : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-[0.98]'
                }
      `}
        >
            {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : added ? (
                <>
                    <Check className="h-6 w-6" /> Added
                </>
            ) : (
                <>
                    <ShoppingCart className="h-6 w-6" /> Add to Cart - ₹{price}
                </>
            )}
        </button>
    )
}
