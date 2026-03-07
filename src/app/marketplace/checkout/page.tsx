import sql from '@/lib/db'
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
    const [user] = await sql`
        SELECT uid FROM users WHERE auth_id = ${kindeUser.id}
    `;
    
    if (!user) {
         // Should not happen if sync works, but safe fallback
         redirect('/auth-callback') 
    }

    const [cartData] = await sql`
        SELECT id FROM carts WHERE user_id = ${user.uid}
    `;

    if (!cartData) {
        redirect('/marketplace/cart')
    }

    const cartItems = await sql`
        SELECT ci.quantity, ci.medicine_id, m.price, m.stock_quantity, m.name
        FROM cart_items ci
        JOIN medicines m ON ci.medicine_id = m.id
        WHERE ci.cart_id = ${cartData.id}
    `;

    if (!cartItems || cartItems.length === 0) {
        redirect('/marketplace/cart')
    }

    let total = 0
    for (const item of cartItems as any[]) {
        if (item.stock_quantity < item.quantity) {
            redirect('/marketplace/cart')
        }
        total += item.price * item.quantity
    }

    // Fetch user address from patients table
    const [patientData] = await sql`
        SELECT address_line1, address_line2, city, state, postal_code FROM patients WHERE uid = ${user.uid}
    `;

    const savedAddress = patientData ? [
        patientData.address_line1,
        patientData.address_line2,
        patientData.city,
        patientData.state,
        patientData.postal_code
    ].filter(Boolean).join(', ') : '';

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-center mb-10">Secure Checkout</h1>
            <CheckoutForm total={total} savedAddress={savedAddress} />
        </div>
    )
}
