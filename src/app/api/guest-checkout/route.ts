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
            // If user already exists, return 409 so the client knows to proceed without session
            if (createError.message.includes('already registered') ||
                createError.message.includes('already exists') ||
                createError.message.includes('User already registered')) {
                console.log('[Guest Checkout] User already exists:', email)
                return NextResponse.json({
                    error: 'User already exists. Please login.',
                    exists: true
                }, { status: 409 })
            }

            console.error('[Guest Checkout] Error creating user:', createError)
            throw createError
        }

        // User created successfully - return their ID for order linking
        // We no longer try to sign them in as that doesn't work with admin client
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
