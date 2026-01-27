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

    // Special handling for Recovery Flow (Password Reset)
    // We forward the request to the client-side page WITH the code/params.
    // This allows the client-side Supabase SDK to handle the exchange reliably.
    if (type === 'recovery' || next.includes('reset-password')) {
        const resetPath = next.includes('reset-password') ? next : `/${lang}/reset-password`
        const targetUrl = new URL(resetPath, origin)

        // Copy all search params (code, token_hash, type, etc.)
        searchParams.forEach((value, key) => {
            targetUrl.searchParams.set(key, value)
        })

        console.log('[Auth Callback] Forwarding recovery to client:', targetUrl.toString())
        return NextResponse.redirect(targetUrl)
    }

    // Standard Auth Flow (Login/Signup)
    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Otherwise, redirect to the intended destination (Login/Home)
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('[Auth Callback] Error exchanging code:', error)
        }
    }

    // If no code is present, it might be an implicit flow (hash fragment).
    // Redirect to login with error
    return NextResponse.redirect(`${origin}/${lang}/login?error=auth_callback_error`)
}
