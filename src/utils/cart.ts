import { createClient } from '@/utils/supabase/server'
import { getCurrentUser } from '@/utils/auth'

export async function getCartCount() {
    const supabase = await createClient()
    try {
        const user = await getCurrentUser()
        if (!user) return 0

        const { data: cart } = await supabase
            .from('carts')
            .select('items:cart_items(id)')
            .eq('user_id', user.uid)
            .single()

        return cart?.items?.length || 0
    } catch (error) {
        return 0
    }
}
