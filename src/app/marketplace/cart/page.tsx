import { createClient } from '@/utils/supabase/server'
import { CartList } from '@/components/CartList'
import { redirect } from 'next/navigation'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = 'force-dynamic'

export default async function CartPage() {
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

    const { data: cart } = await supabase
        .from('carts')
        .select('*, items:cart_items(*, medicine:medicines(*))')
        .eq('user_id', user.uid)
        .single()

    // Sort items by name nicely
    if (cart?.items) {
        cart.items.sort((a: any, b: any) => a.medicine.name.localeCompare(b.medicine.name))
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
            <CartList initialCart={cart} />
        </div>
    )
}
