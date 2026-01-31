import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Calendar, MapPin } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser) {
        redirect('/api/auth/login')
    }

    const supabase = await createClient()
    
    // Fetch internal user ID
    const { data: user } = await supabase
        .from('users')
        .select('uid')
        .eq('auth_id', kindeUser.id)
        .single();
    
    if (!user) {
         redirect('/auth-callback')
    }

    const { data: orders } = await supabase
        .from('orders')
        .select('*, items:order_items(*, medicine:medicines(*))')
        .eq('user_id', user.uid)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>

            {!orders || orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="relative h-20 w-20 mx-auto mb-4 opacity-50">
                        <img src="/logo_emblem.png" alt="No orders" className="h-full w-full object-contain grayscale" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
                    <Link href="/marketplace" className="text-teal-600 hover:underline mt-2 inline-block">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex items-center gap-6 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">Order Placed</span>
                                        <div className="font-medium text-gray-900 flex items-center gap-1">
                                            <Calendar className="h-3 w-3 text-gray-400" />
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">Total</span>
                                        <div className="font-medium text-gray-900">₹{order.total_amount}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">Ship To</span>
                                        <div className="font-medium text-gray-900 flex items-center gap-1">
                                            <MapPin className="h-3 w-3 text-gray-400" />
                                            <span className="truncate max-w-[150px]">{order.shipping_address?.address || 'Address'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700">
                                        {order.status}
                                    </span>
                                    <span className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8)}</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="flex items-start gap-4">
                                            <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                                <Image
                                                    src={item.medicine?.image_url || 'https://placehold.co/100'}
                                                    alt={item.medicine?.name || 'Deleted Product'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <Link href={`/marketplace/${item.medicine_id}`} className="font-semibold text-gray-900 hover:text-teal-600">
                                                    {item.medicine?.name || 'Unknown Product'}
                                                </Link>
                                                <p className="text-sm text-gray-500 line-clamp-1">{item.medicine?.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-900">₹{item.price_at_purchase}</div>
                                                <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
