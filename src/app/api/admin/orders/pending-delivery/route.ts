import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        // Fetch all orders with status PENDING_DELIVERY
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select(`
        id,
        order_number,
        user_id,
        customer_name,
        customer_phone,
        total_amount,
        shipping_address,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          price_at_purchase,
          medicines (
            id,
            name,
            dosage
          )
        )
      `)
            .eq('status', 'PENDING_DELIVERY')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching pending orders:', error);
            throw error;
        }

        return NextResponse.json({ success: true, orders: orders || [] });
    } catch (error: any) {
        console.error('Error in pending-delivery endpoint:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
