import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await context.params;
        const { deliveryBoyId } = await request.json();

        if (!deliveryBoyId) {
            return NextResponse.json({ error: 'Delivery boy ID is required' }, { status: 400 });
        }

        const [order] = await sql`
            UPDATE orders SET 
                status = 'ASSIGNED',
                assigned_to_delivery_boy_id = ${deliveryBoyId},
                assigned_at = ${new Date().toISOString()},
                updated_at = ${new Date().toISOString()}
            WHERE id = ${orderId} AND status = 'PENDING_DELIVERY'
            RETURNING *
        `;

        if (!order) {
            return NextResponse.json({ error: 'Order not found or already assigned' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        console.error('Error in assign endpoint:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
