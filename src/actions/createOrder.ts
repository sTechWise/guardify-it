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
    if (!items || items.length === 0) {
        throw new Error('No items in order')
    }

    // Implement Admin Client to bypass RLS/Permission issues during creation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Server Configuration Error: Missing Supabase Admin Keys')
        throw new Error('Internal Server Error: Database configuration missing')
    }

    console.log('[createOrder] Initializing admin client...')
    const supabase = createClient(
        supabaseUrl,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // 1. Fetch real prices from DB to prevent tampering
    console.log('[createOrder] Fetching product prices for validation...')
    const itemIds = items.map(i => i.id)
    const { data: dbProducts, error: productsError } = await supabase
        .from('products')
        .select('id, price, sale_price, title')
        .in('id', itemIds)

    if (productsError || !dbProducts) {
        console.error('Failed to validate prices:', productsError)
        throw new Error('Failed to validate product prices')
    }

    // 2. Validate and Calculate Total
    let calculatedTotal = 0
    const validatedItems = items.map(item => {
        const dbProduct = dbProducts.find(p => p.id === item.id)
        if (!dbProduct) {
            throw new Error(`Product not found: ${item.id}`)
        }

        const price = dbProduct.sale_price || dbProduct.price
        const quantity = item.quantity || 1

        calculatedTotal += price * quantity

        return {
            ...item,
            name: dbProduct.title, // Ensure name is correct
            price: price // Ensure price is correct
        }
    })

    // Ensure we have a valid total
    if (calculatedTotal <= 0) {
        throw new Error('Invalid order total')
    }

    console.log(`[createOrder] Total calculated: ${calculatedTotal}. Inserting order...`)

    // 3. Create Order
    // Note: 'items' column is now ensured by REPAIR_SCHEMA.sql
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: userId || null,
            user_email: userEmail,
            total_amount: calculatedTotal,
            status: 'pending_payment',
            items: validatedItems
        })
        .select()
        .single()

    if (orderError) {
        console.error('Order creation failed:', orderError)
        throw new Error(`Failed to create order: ${orderError.message}`)
    }

    console.log('[createOrder] Order created successfully:', order.id)
    return order
}
