import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // CRITICAL: Check for Service Role Key
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('[Guest Checkout] CRITICAL ERROR: Missing SUPABASE_SERVICE_ROLE_KEY env var.')
            console.error('[Guest Checkout] Go to Vercel Settings -> Environment Variables and add it.')
            return NextResponse.json({
                error: 'Server Misconfiguration: Payment cannot be processed at this time.'
            }, { status: 500 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Generate a secure random password
        const randomPassword = crypto.randomUUID() + crypto.randomUUID()

        // Attempt to create a new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: randomPassword,
            email_confirm: true
        })

        if (createError) {
            // Case: User already exists
            if (createError.message.includes('already registered') ||
                createError.message.includes('already exists') ||
                createError.status === 422) { // 422 Unprocessable Entity often means exists

                console.log('[Guest Checkout] User already exists:', email)

                // Since we have the Service Role, we CAN find the user ID to link it correctly.
                // This converts a "Guest Checkout" into a "Linked Order" for an existing user purely by email match.
                // NOTE: This assumes email ownership. Since we only insert an order and don't grant login access,
                // this is generally safe for "Guest Checkout" flows (matching email = linking).

                const { data: users, error: searchError } = await supabaseAdmin.auth.admin.listUsers()
                // Warning: listUsers is paginated, but for now we look for a match.
                // Better approach: We can't easily filter by email in admin api without looping or explicit query.
                // However, since we are doing forensic recovery, let's keep it safe:
                // Return success but NO userId to avoid linking to wrong account if we aren't 100% sure.
                // The order will be created with `user_email` only.
                // The `link_orders_to_user` RPC (when they login) will pick it up later.

                return NextResponse.json({
                    userId: null,
                    message: 'User exists. Order will be linked upon next login.',
                    success: true
                })
            }

            console.error('[Guest Checkout] Create Error:', createError)
            return NextResponse.json({ error: createError.message }, { status: 500 })
        }

        console.log('[Guest Checkout] Created new guest user:', newUser.user?.id)

        return NextResponse.json({
            userId: newUser.user?.id,
            success: true
        })

    } catch (error: any) {
        console.error('[Guest Checkout] Unexpected Error:', error)
        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 })
    }
}
