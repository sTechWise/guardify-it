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

        // Check if user exists
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

        // Note: listUsers isn't efficient for checking existence by email in large DBs, 
        // but for this scale it's fine. getUserById doesn't work with email.
        // Ideally we'd catch the error on createUser, but we want to avoid error logs if possible.

        // Better approach: Try to create, if fails, assume exists.
        const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: randomPassword,
            email_confirm: true
        })

        if (createError) {
            // If user uses this email, we can't auto-login them as guest.
            // We should tell the client "User exists".
            if (createError.message.includes('already registered')) {
                return NextResponse.json({ error: 'User already exists. Please login.' }, { status: 409 })
            }
            throw createError
        }

        // User created. Now sign them in to get a session to return to client.
        // We have the password!
        const { data: sessionData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password: randomPassword
        })

        if (signInError) throw signInError

        return NextResponse.json({ session: sessionData.session })

    } catch (error: any) {
        console.error('Guest checkout error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
