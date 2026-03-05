import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/utils/auth'
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const orders = await sql.unsafe(`
            SELECT 
                o.*,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', oi.id,
                                'order_id', oi.order_id,
                                'medicine_id', oi.medicine_id,
                                'quantity', oi.quantity,
                                'price_at_purchase', oi.price_at_purchase,
                                'medicine', (
                                    SELECT row_to_json(m.*)
                                    FROM medicines m
                                    WHERE m.id = oi.medicine_id
                                )
                            )
                        )
                        FROM order_items oi
                        WHERE oi.order_id = o.id
                    ),
                    '[]'::json
                ) as items
            FROM orders o
            WHERE o.user_id = $1
            ORDER BY o.created_at DESC
        `, [user.uid]);

        return NextResponse.json(orders || [])
    } catch (error: any) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
