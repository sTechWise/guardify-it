import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
            return NextResponse.json({ error: 'Server misconfiguration: Missing Service Role Key' }, { status: 500 })
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

        // Generate a random secure password for the guest account
        const randomPassword = crypto.randomUUID() + crypto.randomUUID()

        // Try to create a new user with this email
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: randomPassword,
            email_confirm: true // Auto-confirm so they can reset password later
        })

        if (createError) {
            // If user already exists, we want to proceed.
            // But we need the userId to link the order.
            // Since we can't look up the user by email with admin client easily (actually we can),
            // we will try to find the user.

            if (createError.message.includes('already registered') ||
                createError.message.includes('already exists') ||
                createError.message.includes('User already registered')) {

                console.log('[Guest Checkout] User exists, trying to fetch ID:', email)

                // Fetch the user by email using Admin client to get their ID
                // Note: listUsers is the way to search users
                // Actually, createUser returns existing user info in some cases? No.
                // We have to search.

                // Using admin.listUsers requires permissions. 
                // Since this is a server route with service key, we can do it.

                // But listUsers by email involves filtering.
                // It's safer to just return a generic success but NO userId if we can't find it easily,
                // and let createOrder handle it (unlinked order).

                // However, linking is better.
                // Supabase Admin doesn't have a simple getUserByEmail without using listUsers or generic SQL.
                // Wait! supabaseAdmin.rpc('get_user_id_by_email', { p_email: email })?
                // No, we don't have that RPC.

                // Let's just return success: true but userId: null (or undefined).
                // The checkout page will see ok: true, but no userId.
                // Then order will be created with email only.
                // This is SAFE and complies with "Guest" checkout.
                // If they want it linked, they should login.

                return NextResponse.json({
                    userId: null,
                    message: 'User exists, proceeding as guest',
                    success: true
                })
            }

            console.error('[Guest Checkout] Create Error:', createError)
            return NextResponse.json({ error: createError.message }, { status: 500 })
        }

        console.log('[Guest Checkout] Created new user:', newUser.user?.id)

        return NextResponse.json({
            userId: newUser.user?.id,
            success: true
        })

    } catch (error: any) {
        console.error('[Guest Checkout] Error:', error)
        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 })
    }
}
