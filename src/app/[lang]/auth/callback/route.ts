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

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // If this is a password recovery, redirect to reset-password page
            if (type === 'recovery') {
                const resetPath = next.includes('reset-password') ? next : `/${lang}/reset-password`
                console.log('[Auth Callback Lang] Recovery flow, redirecting to:', resetPath)
                return NextResponse.redirect(`${origin}${resetPath}`)
            }

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

    // If no code is present, it might be an implicit flow (hash fragment).
    // Redirect to reset-password page so the client can parse the hash.
    const isRecovery = type === 'recovery' || next.includes('reset-password')
    const target = isRecovery ? `/${lang}/reset-password` : `/${lang}/login?error=auth_callback_error`
    return NextResponse.redirect(`${origin}${target}`)
}
