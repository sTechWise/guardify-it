'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import AuthRedirectHandler from '@/components/AuthRedirectHandler'
import MobileNav from '@/components/MobileNav'

interface LayoutShellProps {
    children: React.ReactNode
    dict: any
}

export default function LayoutShell({ children, dict }: LayoutShellProps) {
    const pathname = usePathname()
    const isAdmin = pathname.includes('/admin')

    if (isAdmin) {
        return <>{children}</>
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            <AuthRedirectHandler />
            <Navbar dict={dict} />
            <main style={{ flex: 1, paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))' }}>{children}</main>
            <Footer />
            <WhatsAppButton />
            <MobileNav />
        </div>
    )
}
