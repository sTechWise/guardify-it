'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

/**
 * This component detects password recovery hash fragments in the URL
 * and redirects to the reset-password page.
 * 
 * When Supabase sends a password recovery email, it redirects to:
 * http://localhost:3000/#access_token=XXX&type=recovery
 * 
 * This component catches that and redirects to /reset-password
 * where the actual password reset form handles the token.
 */
export default function AuthRedirectHandler() {
    const router = useRouter()
    const params = useParams()
    const lang = (params?.lang as string) || 'en'

    useEffect(() => {
        // Check if URL has hash with recovery type
        if (typeof window !== 'undefined' && window.location.hash) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const type = hashParams.get('type')
            const accessToken = hashParams.get('access_token')

            if (type === 'recovery' && accessToken) {
                // Redirect to reset-password page with the hash intact
                router.push(`/${lang}/reset-password${window.location.hash}`)
            }
        }
    }, [router, lang])

    // This component renders nothing - it just handles the redirect
    return null
}
