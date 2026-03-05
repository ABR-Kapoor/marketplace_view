import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const orders = await sql.unsafe(`
            SELECT 
                o.id, o.order_number, o.user_id, o.customer_name, 
                o.customer_phone, o.total_amount, o.shipping_address, 
                o.created_at, o.updated_at,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', oi.id,
                                'quantity', oi.quantity,
                                'price_at_purchase', oi.price_at_purchase,
                                'medicines', (
                                    SELECT json_build_object(
                                        'id', m.id, 'name', m.name, 'dosage', m.dosage
                                    )
                                    FROM medicines m
                                    WHERE m.id = oi.medicine_id
                                )
                            )
                        )
                        FROM order_items oi
                        WHERE oi.order_id = o.id
                    ),
                    '[]'::json
                ) as order_items
            FROM orders o
            WHERE o.status = 'PENDING_DELIVERY'
            ORDER BY o.created_at ASC
        `);

        return NextResponse.json({ success: true, orders: orders || [] });
    } catch (error: any) {
        console.error('Error in pending-delivery endpoint:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
