'use server'

import { createClient } from '@supabase/supabase-js'
import type { OrderItem } from '@/types'
import { sendInstantOrderNotification } from './notifyOrder'

export async function createOrder(
    items: OrderItem[], 
    userPhone: string, 
    userEmail?: string | null, 
    userId?: string | null, 
    promoCode?: string | null
) {
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

    // 3. Process Promo Code (Server-side validation)
    let promoId: string | null = null
    let discountAmount = 0

    if (promoCode && promoCode.trim() !== '') {
        const normalizedCode = promoCode.trim().toUpperCase()
        const { data: promo, error: promoError } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('code', normalizedCode)
            .single()

        if (!promoError && promo && promo.is_active) {
            // Check expiry
            let isExpired = false
            if (promo.expiry_date) {
                if (new Date(promo.expiry_date) < new Date()) {
                    isExpired = true;
                }
            }

            // Check usage limit
            const limitReached = promo.usage_limit !== null && promo.usage_count >= promo.usage_limit

            if (!isExpired && !limitReached) {
                promoId = promo.id
                if (promo.discount_type === 'percentage') {
                    discountAmount = Math.min((calculatedTotal * promo.discount_value) / 100, calculatedTotal)
                } else if (promo.discount_type === 'fixed') {
                    discountAmount = Math.min(promo.discount_value, calculatedTotal)
                }
                discountAmount = Math.round(discountAmount)
            }
        }
    }

    const finalAmount = Math.max(0, calculatedTotal - discountAmount)

    // 4. Create Order (Safe insert with fallback if user_phone column does not exist in DB schema)
    let order: any = null
    let orderError: any = null

    // First attempt: try inserting with user_phone
    const firstAttempt = await supabase
        .from('orders')
        .insert({
            user_id: userId || null,
            user_email: userEmail ? `${userEmail} (Phone: ${userPhone})` : userPhone,
            user_phone: userPhone,
            total_amount: finalAmount,
            status: 'pending_payment',
            items: validatedItems,
            promo_code_id: promoId,
            discount_amount: discountAmount
        })
        .select()
        .single()

    if (firstAttempt.error) {
        // If user_phone column doesn't exist in DB, fallback to insert without user_phone
        console.warn('First insert attempt error (retrying without user_phone column):', firstAttempt.error.message)
        const fallbackAttempt = await supabase
            .from('orders')
            .insert({
                user_id: userId || null,
                user_email: userEmail ? `${userEmail} (Phone: ${userPhone})` : userPhone,
                total_amount: finalAmount,
                status: 'pending_payment',
                items: validatedItems,
                promo_code_id: promoId,
                discount_amount: discountAmount
            })
            .select()
            .single()

        order = fallbackAttempt.data
        orderError = fallbackAttempt.error
    } else {
        order = firstAttempt.data
    }

    if (orderError || !order) {
        console.error('Order creation failed:', orderError)
        throw new Error(`Order creation failed: ${orderError?.message || 'Unknown database error'}`)
    }

    // Dispatch Instant Notification (Telegram / Logs)
    try {
        await sendInstantOrderNotification({
            orderId: order.id,
            customerPhone: userPhone,
            customerEmail: userEmail || undefined,
            totalAmount: finalAmount,
            items: validatedItems.map(i => ({ name: i.name || 'Item', quantity: i.quantity || 1, price: i.price || 0 })),
            discountAmount
        })
    } catch (notifErr) {
        console.warn('Failed to send instant order notification:', notifErr)
    }

    // 5. If promo code was applied, increment usage count and insert tracking log
    if (promoId && order) {
        // Increment usage count
        await supabase.rpc('increment_promo_usage', { p_promo_id: promoId })

        // Insert usage log
        await supabase
            .from('promo_code_uses')
            .insert({
                promo_code_id: promoId,
                order_id: order.id,
                user_email: userEmail,
                discount_applied: discountAmount
            })
    }

    return order
}
