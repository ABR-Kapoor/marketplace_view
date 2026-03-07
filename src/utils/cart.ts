import sql from '@/lib/db'
import { getCurrentUser } from '@/utils/auth'

export async function getCartCount() {
    try {
        const user = await getCurrentUser()
        if (!user) return 0

        const [cart] = await sql`
            SELECT count(*)::int as count 
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.id
            WHERE c.user_id = ${user.uid}
        `;

        return cart?.count || 0
    } catch (error) {
        console.error('Error getting cart count:', error);
        return 0
    }
}
