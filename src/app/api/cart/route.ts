import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper to get authenticated internal user
async function getAuthenticatedUser() {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();

    if (!kindeUser || !kindeUser.id) return null;

    // Fetch internal user ID using Service Role as users table might be protected
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('uid')
        .eq('auth_id', kindeUser.id)
        .single();

    return user;
}

export async function GET(request: NextRequest) {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()
    const { data: cart, error } = await supabase
        .from('carts')
        .select('id, items:cart_items(id, quantity, medicine:medicines(*))') // Join medicines
        .eq('user_id', user.uid)
        .single()

    if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(cart || { items: [] })
}


export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()
    const body = await request.json()
    const { medicineId, quantity } = body

    // Get or Create Cart
    let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.uid)
        .single()

    if (!cart) {
        const { data: newCart, error: createError } = await supabase
            .from('carts')
            .insert({ user_id: user.uid })
            .select()
            .single()
        if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })
        cart = newCart
    }

    if (!cart) return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 })

    // Check existing item
    const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('medicine_id', medicineId)
        .single()

    if (existingItem) {
        const newQty = existingItem.quantity + quantity
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQty })
            .eq('id', existingItem.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
        const { error } = await supabase
            .from('cart_items')
            .insert({ cart_id: cart.id, medicine_id: medicineId, quantity })
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}


export async function PUT(request: NextRequest) {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()
    const body = await request.json()
    const { itemId, quantity } = body

    // If quantity 0, delete
    if (quantity <= 0) {
        const { error } = await supabase.from('cart_items').delete().eq('id', itemId)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
        const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const itemId = searchParams.get('id')

    if (!itemId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    const { error } = await supabase.from('cart_items').delete().eq('id', itemId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
