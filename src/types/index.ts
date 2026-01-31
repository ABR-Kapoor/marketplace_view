export interface Medicine {
    id: string
    name: string
    description: string | null
    category: string | null
    price: number
    stock_quantity: number
    manufacturer: string | null
    dosage: string | null
    image_url: string | null
    created_at: string
}

export interface CartItem {
    id: string
    cart_id: string
    medicine_id: string
    quantity: number
    medicine?: Medicine
}

export interface Cart {
    id: string
    user_id: string
    items: CartItem[]
    total?: number
}

export interface Order {
    id: string
    user_id: string
    status: 'pending' | 'paid' | 'cancelled'
    total_amount: number
    shipping_address: any
    created_at: string
    items?: OrderItem[]
}

export interface OrderItem {
    id: string
    order_id: string
    medicine_id: string
    quantity: number
    price_at_purchase: number
    medicine?: Medicine
}
