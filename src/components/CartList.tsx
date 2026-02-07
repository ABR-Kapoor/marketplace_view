'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import type { Cart, CartItem } from '@/types'

export function CartList({ initialCart }: { initialCart: Cart | null }) {
    const [cart, setCart] = useState<Cart | null>(initialCart)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const updateQuantity = async (itemId: string, newQty: number) => {
        // Optimistic update
        const oldCart = cart
        if (!cart) return

        const newItems = cart.items.map(item =>
            item.id === itemId ? { ...item, quantity: newQty } : item
        ).filter(item => item.quantity > 0)

        setCart({ ...cart, items: newItems })

        try {
            await fetch('/api/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, quantity: newQty }),
            })
            router.refresh()
        } catch (e) {
            setCart(oldCart) // revert
            alert('Failed to update quantity')
        }
    }

    const subtotal = cart?.items.reduce((acc, item) => acc + (item.medicine?.price || 0) * item.quantity, 0) || 0
    const tax = subtotal * 0.05
    const total = subtotal + tax

    if (!cart || cart.items.length === 0) {
        return (
            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
                <div className="relative w-40 h-40 mx-auto mb-6 opacity-80 mix-blend-multiply">
                    <Image src="https://placehold.co/400?text=Empty+Cart" alt="Empty" fill className="object-contain" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any medicines yet.</p>
                <Link href="/marketplace" className="inline-flex items-center px-6 py-3 rounded-xl btn-primary shadow-green-lg">
                    Browse Medicines
                </Link>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8 animate-fadeIn">
            <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => (
                    <div key={item.id} className="glass-card p-4 rounded-2xl flex gap-4 items-center">
                        <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                            <Image
                                src={item.medicine?.image_url || 'https://placehold.co/200'}
                                alt={item.medicine?.name || 'Medicine'}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <Link href={`/marketplace/${item.medicine_id}`} className="font-bold text-gray-900 hover:text-emerald-600 text-lg transition-colors">
                                {item.medicine?.name}
                            </Link>
                            <div className="text-sm text-gray-500">{item.medicine?.manufacturer}</div>
                            <div className="font-semibold text-emerald-600 mt-1">₹{item.medicine?.price}</div>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50/80 rounded-xl p-1.5 border border-gray-100">
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm hover:text-emerald-600 disabled:opacity-50 transition-colors"
                                disabled={loading}
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-5 text-center font-bold text-sm text-gray-700">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm hover:text-emerald-600 disabled:opacity-50 transition-colors"
                                disabled={loading || item.quantity >= (item.medicine?.stock_quantity || 0)}
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="lg:col-span-1">
                <div className="glass-card p-6 rounded-2xl sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax (5%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-gray-100 my-4"></div>
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                            <span>Total</span>
                            <span className="text-emerald-600">₹{total.toFixed(2)}</span>
                        </div>
                    </div>

                    <Link href="/marketplace/checkout" className="w-full py-4 btn-primary rounded-xl flex items-center justify-center gap-2 group">
                        Proceed to Checkout <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
