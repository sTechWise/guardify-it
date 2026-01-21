'use server'

import { createClient } from '@supabase/supabase-js'

interface OrderItem {
    id: string
    name?: string
    price?: number
    quantity?: number
}

// ... imports

export async function createOrder(items: OrderItem[], userEmail: string, userId?: string | null) {
    // Implement Admin Client to bypass RLS/Permission issues during creation
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // Calculate Total from cart items
    // Cart items already include validated price and quantity from frontend
    let calculatedTotal = 0

    items.forEach(item => {
        const quantity = item.quantity || 1
        const price = item.price || 0
        calculatedTotal += price * quantity
    })

    // Ensure we have a valid total
    if (calculatedTotal <= 0) {
        throw new Error('Invalid order total')
    }

    // Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: userId || null, // Store UUID if logged in, NULL if guest
            user_email: userEmail,
            total_amount: calculatedTotal,
            status: 'pending_payment'
        })
        .select()
        .single()

    if (orderError) {
        // ... err handling
        console.error('Order creation failed:', orderError)
        throw new Error(`Failed to create order: ${orderError.message}`)
    }

    return order
}
