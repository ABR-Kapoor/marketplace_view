import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const supabase = await createClient()

    // Optional: Check auth
    // const { data: { user } } = await supabase.auth.getUser()

    const searchParams = request.nextUrl.searchParams
    const queryText = searchParams.get('q')
    const category = searchParams.get('category')
    const stock = searchParams.get('stock') // 'in_stock'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    let query = supabase.from('medicines').select('*')

    if (queryText) {
        query = query.ilike('name', `%${queryText}%`)
    }
    if (category && category !== 'All') {
        query = query.eq('category', category)
    }
    if (stock === 'true') {
        query = query.gt('stock_quantity', 0)
    }
    if (minPrice) {
        query = query.gte('price', minPrice)
    }
    if (maxPrice) {
        query = query.lte('price', maxPrice)
    }

    // default sort
    query = query.order('name')

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
