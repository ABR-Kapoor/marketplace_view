import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const { deliveryBoyId } = await request.json();

        if (!deliveryBoyId) {
            return NextResponse.json(
                { error: 'Delivery boy ID is required' },
                { status: 400 }
            );
        }

        // Update order status and assign delivery boy
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .update({
                status: 'ASSIGNED',
                assigned_to_delivery_boy_id: deliveryBoyId,
                assigned_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('status', 'PENDING_DELIVERY')
            .select()
            .single();

        if (error) {
            console.error('Error assigning order:', error);
            throw error;
        }

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found or already assigned' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        console.error('Error in assign endpoint:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
