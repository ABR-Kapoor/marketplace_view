'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CreditCard, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutForm({ total }: { total: number }) {
    const [loading, setLoading] = useState(false)
    const [address, setAddress] = useState('')
    const router = useRouter()

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const isLoaded = await loadRazorpay()
            if (!isLoaded) {
                throw new Error('Razorpay SDK failed to load')
            }

            // 1. Create Order
            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total,
                    description: `Payment for Order`,
                    // items: ... passed from cart if needed
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create order')

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
                amount: data.amount,
                currency: data.currency,
                name: "MediMarket",
                description: "Purchase Medicines",
                image: "/logo_transparent.png",
                order_id: data.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                order_id: data.dbOrderId // Pass the DB order ID
                            }),
                        })

                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok) {
                             router.push('/marketplace/orders');
                             router.refresh();
                        } else {
                             alert(verifyData.error || 'Payment verification failed');
                        }
                    } catch (error) {
                        console.error(error);
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    // name: user.name, // If we had user info here
                    // email: user.email, 
                    // contact: user.phone
                },
                theme: {
                    color: "#10b981"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handlePayment} className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-fadeIn">
            <div className="space-y-6">
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">1</span>
                        Shipping Information
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                            <textarea
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white/50 backdrop-blur-sm transition-all resize-none text-gray-900"
                                placeholder="123 Health St, Medical City, CA"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">2</span>
                        Payment Method
                    </h3>
                    <div className="flex items-center gap-4 px-4 py-4 border border-emerald-200 bg-emerald-50/50 rounded-xl text-emerald-900">
                        <CreditCard className="h-6 w-6 text-emerald-600" />
                        <span className="font-bold">Razorpay Secure Payment</span>
                        <span className="ml-auto text-xs bg-white px-2 py-1 rounded border border-emerald-100 shadow-sm text-emerald-600 font-medium">Verified</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5 ml-1">
                        <Lock className="h-3.5 w-3.5 text-emerald-500" /> Payments are secure and encrypted.
                    </p>
                </div>
            </div>

            <div>
                <div className="glass-card p-8 rounded-2xl sticky top-24 border-t-4 border-t-emerald-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                    <div className="flex justify-between items-end mb-8">
                        <span className="text-gray-600 font-medium">Total Amount</span>
                        <span className="text-4xl font-bold gradient-text">₹{total.toFixed(2)}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !address}
                        className="w-full py-4 btn-primary rounded-xl font-bold text-lg flex items-center justify-center gap-2 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `Pay Now`}
                    </button>

                    <div className="mt-6 text-center">
                        <Link href="/marketplace/cart" className="text-sm text-gray-500 hover:text-emerald-600 flex items-center justify-center gap-1 font-medium transition-colors">
                            <ArrowLeft className="h-3 w-3" /> Back to Cart
                        </Link>
                    </div>
                </div>
            </div>
        </form>
    )
}
