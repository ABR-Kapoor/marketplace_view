import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/utils/auth'

export async function POST(request: NextRequest) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()
    const { shippingAddress } = await request.json()

    // 1. Get Cart
    const { data: cart } = await supabase
        .from('carts')
        .select('*, items:cart_items(*, medicine:medicines(*))') // inner join logic
        .eq('user_id', user.uid)
        .single()

    if (!cart || !cart.items || cart.items.length === 0) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // 2. Validate Stock & Calculate Total
    let totalAmount = 0
    for (const item of cart.items) {
        if (!item.medicine) {
            return NextResponse.json({ error: 'Invalid medicine in cart' }, { status: 400 })
        }
        if (item.medicine.stock_quantity < item.quantity) {
            return NextResponse.json({ error: `Not enough stock for ${item.medicine.name}` }, { status: 400 })
        }
        totalAmount += item.medicine.price * item.quantity
    }

    // 3. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: user.uid,
            status: 'paid', // Dummy payment success
            total_amount: totalAmount,
            shipping_address: shippingAddress
        })
        .select()
        .single()

    if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

    // 4. Create Order Items
    const orderItems = cart.items.map((item: any) => ({
        order_id: order.id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        price_at_purchase: item.medicine.price
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

    // 5. Update Stock
    for (const item of cart.items) {
        const newStock = Math.max(0, item.medicine.stock_quantity - item.quantity)
        await supabase
            .from('medicines')
            .update({ stock_quantity: newStock })
            .eq('id', item.medicine_id)
    }

    // 6. Clear Cart
    await supabase.from('cart_items').delete().eq('cart_id', cart.id)

    return NextResponse.json({ success: true, orderId: order.id })
}
