import { createClient } from '@/utils/supabase/server'
import { CheckoutForm } from '@/components/CheckoutForm'
import { redirect } from 'next/navigation'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser) {
        redirect('/api/auth/login')
    }
    
    // We assume sync has happened, so we can use kindeUser.id as auth_id to query.
    // However, the checkout logic below uses `user.uid` which implies our internal UID.
    // We need to fetch the internal user first. 
    
    // NOTE: This fetch is duplicate of what syncUser does, but unavoidable unless we store internal UID in session/cookie manually.
    const supabase = await createClient()
    const { data: user } = await supabase.from('users').select('uid').eq('auth_id', kindeUser.id).single()
    
    if (!user) {
         // Should not happen if sync works, but safe fallback
         redirect('/auth-callback') 
    }

    const { data: cart } = await supabase
        .from('carts')
        .select('items:cart_items(quantity, medicine:medicines(price, stock_quantity, name))')
        .eq('user_id', user.uid)
        .single()

    if (!cart?.items || cart.items.length === 0) {
        redirect('/marketplace/cart')
    }

    let total = 0
    for (const item of cart.items as any[]) {
        if (item.medicine.stock_quantity < item.quantity) {
            // In real app, show error or remove item. For now redirect to cart to fix
            redirect('/marketplace/cart')
        }
        total += item.medicine.price * item.quantity
    }

    // Tax
    total = total + (total * 0.05)

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-center mb-10">Secure Checkout</h1>
            <CheckoutForm total={total} />
        </div>
    )
}
