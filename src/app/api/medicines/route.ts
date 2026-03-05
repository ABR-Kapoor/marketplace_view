import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const queryText = searchParams.get('q')
        const category = searchParams.get('category')
        const stock = searchParams.get('stock')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')

        let conditions = [];
        let params: any[] = [];
        let paramIndex = 1;

        if (queryText) {
            conditions.push(`name ILIKE $${paramIndex++}`);
            params.push(`%${queryText}%`);
        }
        if (category && category !== 'All') {
            conditions.push(`category = $${paramIndex++}`);
            params.push(category);
        }
        if (stock === 'true') {
            conditions.push(`stock_quantity > 0`);
        }
        if (minPrice) {
            conditions.push(`price >= $${paramIndex++}`);
            params.push(minPrice);
        }
        if (maxPrice) {
            conditions.push(`price <= $${paramIndex++}`);
            params.push(maxPrice);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const queryString = `SELECT * FROM medicines ${whereClause} ORDER BY name ASC`;

        console.log(`[API] Fetching medicines... q=${queryText || ''}, category=${category || 'All'}`);

        const data = await sql.unsafe(queryString, params);

        console.log(`[API] Found ${data?.length || 0} medicines`);
        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error(`[API] Error fetching medicines:`, error.message);
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
