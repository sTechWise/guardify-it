import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/en/my-orders'
    const type = searchParams.get('type')

    // Extract language from the next parameter (e.g., '/en/my-orders' -> 'en')
    const langMatch = next.match(/^\/([a-z]{2})\//)
    const lang = langMatch ? langMatch[1] : 'en'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // If this is a password recovery, redirect to the next param (reset-password page)
            if (type === 'recovery') {
                // Use next param if it contains reset-password, otherwise construct it
                const resetPath = next.includes('reset-password') ? next : `/${lang}/reset-password`
                console.log('[Auth Callback] Recovery flow, redirecting to:', resetPath)
                return NextResponse.redirect(`${origin}${resetPath}`)
            }

            // Otherwise, redirect to the intended destination
            // The auth trigger will automatically link guest orders
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('[Auth Callback] Error exchanging code:', error)
        }
    }

    // Return to login with error if code exchange failed
    return NextResponse.redirect(`${origin}/${lang}/login?error=auth_callback_error`)
}

