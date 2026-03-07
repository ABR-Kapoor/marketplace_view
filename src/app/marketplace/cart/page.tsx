import sql from '@/lib/db'
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

    // Fetch internal user ID
    const [user] = await sql`
        SELECT uid FROM users WHERE auth_id = ${kindeUser.id}
    `;
    
    if (!user) {
         redirect('/auth-callback')
    }

    const [cartData] = await sql`
        SELECT * FROM carts WHERE user_id = ${user.uid}
    `;

    let cart = null;
    if (cartData) {
        const items = await sql`
            SELECT ci.*, row_to_json(m.*) as medicine
            FROM cart_items ci
            JOIN medicines m ON ci.medicine_id = m.id
            WHERE ci.cart_id = ${cartData.id}
        `;
        cart = {
            ...cartData,
            items: items.sort((a: any, b: any) => a.medicine.name.localeCompare(b.medicine.name))
        };
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
            <CartList initialCart={cart as any} />
        </div>
    )
}
