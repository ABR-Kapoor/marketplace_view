import { NextRequest, NextResponse } from 'next/server'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import sql from '@/lib/db';

async function getAuthenticatedUser() {
    const { getUser } = getKindeServerSession();
    const kindeUser = await getUser();
    if (!kindeUser || !kindeUser.id) return null;

    const [user] = await sql`SELECT uid FROM users WHERE auth_id = ${kindeUser.id}`;
    return user;
}

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const [cart] = await sql`SELECT id FROM carts WHERE user_id = ${user.uid}`;
        if (!cart) return NextResponse.json({ items: [] });

        const items = await sql.unsafe(`
            SELECT ci.id, ci.quantity, 
            (SELECT row_to_json(m.*) FROM medicines m WHERE m.id = ci.medicine_id) as medicine
            FROM cart_items ci WHERE ci.cart_id = $1
        `, [cart.id]);

        return NextResponse.json({ id: cart.id, items: items || [] })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { medicineId, quantity } = body

        let [cart] = await sql`SELECT id FROM carts WHERE user_id = ${user.uid}`;

        if (!cart) {
            [cart] = await sql`INSERT INTO carts (user_id) VALUES (${user.uid}) RETURNING id`;
        }

        const [existingItem] = await sql`SELECT id, quantity FROM cart_items WHERE cart_id = ${cart.id} AND medicine_id = ${medicineId}`;

        if (existingItem) {
            await sql`UPDATE cart_items SET quantity = ${existingItem.quantity + quantity} WHERE id = ${existingItem.id}`;
        } else {
            await sql`INSERT INTO cart_items (cart_id, medicine_id, quantity) VALUES (${cart.id}, ${medicineId}, ${quantity})`;
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { itemId, quantity } = body

        if (quantity <= 0) {
            await sql`DELETE FROM cart_items WHERE id = ${itemId}`;
        } else {
            await sql`UPDATE cart_items SET quantity = ${quantity} WHERE id = ${itemId}`;
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const itemId = request.nextUrl.searchParams.get('id')
        if (!itemId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        await sql`DELETE FROM cart_items WHERE id = ${itemId}`;

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
