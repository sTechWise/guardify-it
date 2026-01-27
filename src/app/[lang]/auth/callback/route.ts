import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? `/${lang}/my-orders`
    const type = searchParams.get('type')

    // Check for tokens in hash (passed via query params sometimes)
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const tokenType = searchParams.get('token_type')


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

        console.log('[Auth Callback Lang] Forwarding recovery to client:', targetUrl.toString())
        return NextResponse.redirect(targetUrl)
    }

    // Standard Auth Flow
    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Otherwise, redirect to the intended destination
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('[Auth Callback Lang] Error exchanging code:', error)
        }
    }

    // Handle token-based recovery (older email format)
    if (accessToken && tokenType === 'recovery') {
        // Redirect to reset password with tokens in hash
        const resetUrl = new URL(`${origin}/${lang}/reset-password`)
        resetUrl.hash = `access_token=${accessToken}&refresh_token=${refreshToken || ''}&type=recovery`
        console.log('[Auth Callback Lang] Token recovery, redirecting to:', resetUrl.toString())
        return NextResponse.redirect(resetUrl.toString())
    }

    // Return to login with error if code exchange failed
    return NextResponse.redirect(`${origin}/${lang}/login?error=auth_callback_error`)
}
