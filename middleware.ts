import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { i18n } from './src/i18n-config'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

function getLocale(request: NextRequest): string | undefined {
    // 1. Check if language cookie exists
    // @ts-ignore
    const cookieLang = request.cookies.get('lang')?.value
    // @ts-ignore
    if (cookieLang && i18n.locales.includes(cookieLang)) {
        return cookieLang
    }

    // 2. GeoIP Detection (Vercel specific) header
    // @ts-ignore
    const country = request.geo?.country || request.headers.get('x-vercel-ip-country')
    if (country === 'BD') {
        return 'bn'
    }

    // 3. Negotiator for headers
    const negotiatorHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

    // @ts-ignore
    const locales: string[] = i18n.locales

    // Use negotiator and intl-localematcher
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages()

    try {
        return matchLocale(languages, locales, i18n.defaultLocale)
    } catch (e) {
        return i18n.defaultLocale
    }
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // 1. Skip internal Next.js paths and static assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')
    ) {
        // Still allow Supabase middleware to run if needed, but typically not for assets
        // However, we normally always return response for these to avoid overhead
        return await updateSession(request)
    }

    // 2. Check if pathname is missing locale
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // 3. Redirect if missing locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request)

        // Construct new URL
        const redirectUrl = new URL(
            `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
            request.url
        )

        // Return redirect response
        return NextResponse.redirect(redirectUrl)
    }

    // 4. If locale is present, proceed with Supabase session update
    // This allows the Supabase middleware to check auth using the localized path
    return await updateSession(request)
}

export const config = {
    // Matcher ignoring `/_next/`, `/api/`, ..
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
