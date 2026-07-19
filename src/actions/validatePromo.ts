'use server'

import { createClient } from '@supabase/supabase-js'

interface ValidationResult {
    success: boolean
    error?: string
    discountAmount?: number
    promoCodeId?: string
    code?: string
}

export async function validatePromo(codeText: string, currentTotal: number): Promise<ValidationResult> {
    if (!codeText || codeText.trim() === '') {
        return { success: false, error: 'Promo code cannot be empty' }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Server Configuration Error: Missing Supabase Admin Keys')
        return { success: false, error: 'Database configuration missing' }
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

    const normalizedCode = codeText.trim().toUpperCase()

    // 1. Fetch promo code from DB
    const { data: promo, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', normalizedCode)
        .single()

    if (promoError || !promo) {
        return { success: false, error: 'Invalid promo code' }
    }

    // 2. Check active status
    if (!promo.is_active) {
        return { success: false, error: 'Promo code is inactive' }
    }

    // 3. Check expiry
    if (promo.expiry_date) {
        const expiry = new Date(promo.expiry_date)
        if (expiry < new Date()) {
            return { success: false, error: 'Promo code has expired' }
        }
    }

    // 4. Check usage limit
    if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
        return { success: false, error: 'Promo code usage limit reached' }
    }

    // 5. Calculate discount amount
    let discountAmount = 0
    if (promo.discount_type === 'percentage') {
        // Percentage discount capped at total amount
        discountAmount = Math.min((currentTotal * promo.discount_value) / 100, currentTotal)
    } else if (promo.discount_type === 'fixed') {
        // Fixed amount discount capped at total amount
        discountAmount = Math.min(promo.discount_value, currentTotal)
    }

    return {
        success: true,
        discountAmount: Math.round(discountAmount),
        promoCodeId: promo.id,
        code: promo.code
    }
}
