import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/utils/auth'
import sql from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { shippingAddress } = await request.json()

        const [cart] = await sql`SELECT id FROM carts WHERE user_id = ${user.uid}`;
        if (!cart) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

        const cartItems = await sql`
            SELECT ci.id, ci.quantity, ci.medicine_id, m.name as m_name, m.price as m_price, m.stock_quantity as m_stock_quantity 
            FROM cart_items ci JOIN medicines m ON ci.medicine_id = m.id WHERE ci.cart_id = ${cart.id}
        `;

        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
        }

        let totalAmount = 0
        for (const item of cartItems) {
            if (item.m_stock_quantity < item.quantity) {
                return NextResponse.json({ error: `Not enough stock for ${item.m_name}` }, { status: 400 })
            }
            totalAmount += item.m_price * item.quantity
        }

        const [order] = await sql`
            INSERT INTO orders (user_id, status, total_amount, shipping_address)
            VALUES (${user.uid}, 'paid', ${totalAmount}, ${shippingAddress})
            RETURNING id
        `;

        for (const item of cartItems) {
            await sql`
                INSERT INTO order_items (order_id, medicine_id, quantity, price_at_purchase)
                VALUES (${order.id}, ${item.medicine_id}, ${item.quantity}, ${item.m_price})
            `;
            const newStock = Math.max(0, item.m_stock_quantity - item.quantity);
            await sql`UPDATE medicines SET stock_quantity = ${newStock} WHERE id = ${item.medicine_id}`;
        }

        await sql`DELETE FROM cart_items WHERE cart_id = ${cart.id}`;

        return NextResponse.json({ success: true, orderId: order.id })
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
