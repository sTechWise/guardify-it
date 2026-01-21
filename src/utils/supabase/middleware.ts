import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { i18n } from '@/i18n-config'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Strip locale from pathname to check for protected routes
    const pathname = request.nextUrl.pathname
    const pathnameWithoutLocale = i18n.locales.reduce(
        (acc: string, locale: string) =>
            acc.startsWith(`/${locale}`) ? acc.replace(`/${locale}`, '') : acc,
        pathname
    ) || '/'

    // Check for admin routes with the locale-stripped path
    if (pathnameWithoutLocale.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL(`/${i18n.defaultLocale}/login`, request.url))
        }

        const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')

        if (!roles || roles.length === 0) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}
