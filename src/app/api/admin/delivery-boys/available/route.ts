import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { data: deliveryBoys, error } = await supabaseAdmin
            .from('delivery_agents')
            .select(`
        id,
        name,
        email,
        phone,
        total_deliveries_completed,
        average_rating,
        is_available,
        is_active
      `)
            .eq('is_active', true)
            .order('is_available', { ascending: false })
            .order('total_deliveries_completed', { ascending: true });

        if (error) {
            console.error('Error fetching delivery boys:', error);
            throw error;
        }

        // Count active deliveries for each delivery boy
        const deliveryBoysWithStats = await Promise.all(
            (deliveryBoys || []).map(async (db) => {
                const { count } = await supabaseAdmin
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('assigned_to_delivery_boy_id', db.id)
                    .in('status', ['ASSIGNED', 'ACCEPTED_FOR_DELIVERY', 'OUT_FOR_DELIVERY']);

                return {
                    ...db,
                    active_deliveries: count || 0
                };
            })
        );

        return NextResponse.json({ success: true, deliveryBoys: deliveryBoysWithStats });
    } catch (error: any) {
        console.error('Error in available delivery boys endpoint:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
