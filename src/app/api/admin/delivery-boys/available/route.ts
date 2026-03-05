import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const deliveryBoys = await sql`
            SELECT id, name, email, phone, total_deliveries_completed, average_rating, is_available, is_active
            FROM delivery_agents
            WHERE is_active = true
            ORDER BY is_available DESC, total_deliveries_completed ASC
        `;

        const deliveryBoysWithStats = await Promise.all(
            (deliveryBoys || []).map(async (db) => {
                const [{ count }] = await sql`
                    SELECT count(*) FROM orders 
                    WHERE assigned_to_delivery_boy_id = ${db.id} 
                    AND status IN ('ASSIGNED', 'ACCEPTED_FOR_DELIVERY', 'OUT_FOR_DELIVERY')
                `;

                return {
                    ...db,
                    active_deliveries: Number(count) || 0
                };
            })
        );

        return NextResponse.json({ success: true, deliveryBoys: deliveryBoysWithStats });
    } catch (error: any) {
        console.error('Error in available delivery boys endpoint:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
