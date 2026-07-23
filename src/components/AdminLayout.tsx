'use client'

import styles from './AdminLayout.module.css'
import { useState, useEffect } from 'react'
import { usePathname, useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/context/ToastContext'
import {
    Shield,
    LayoutDashboard,
    ClipboardList,
    CreditCard,
    Package,
    FolderOpen,
    Plus,
    ChevronDown,
    LogOut,
    Menu,
    X,
    Percent,
    Globe
} from 'lucide-react'

interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname()
    const params = useParams()
    const router = useRouter()
    const { showToast } = useToast()
    const supabase = createClient()
    const lang = params.lang as string || 'en'

    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userEmail, setUserEmail] = useState('')
    const [productsOpen, setProductsOpen] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Auto-expand products section if on a products page
    useEffect(() => {
        if (pathname.includes('/admin/products') || pathname.includes('/admin/categories')) {
            setProductsOpen(true)
        }
    }, [pathname])

    useEffect(() => {
        let isMounted = true
        
        // Safety fallback timer: force loading to false if Supabase auth hangs over 3.5s
        const safetyTimer = setTimeout(() => {
            if (isMounted) {
                setLoading((prev) => {
                    if (prev) {
                        console.warn('Admin auth check timed out, releasing loading state.')
                        return false
                    }
                    return prev
                })
            }
        }, 3500)

        checkAdmin().finally(() => {
            clearTimeout(safetyTimer)
        })

        return () => {
            isMounted = false
            clearTimeout(safetyTimer)
        }
    }, [])

    async function checkAdmin() {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError || !user) {
                router.push(`/${lang}/login`)
                return
            }

            setUserEmail(user.email || '')

            const { data: roles, error: rolesError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .eq('role', 'admin')

            if (rolesError || !roles || roles.length === 0) {
                router.push(`/${lang}`)
                showToast('Access Denied - Admin only', 'error')
            } else {
                setIsAdmin(true)
            }
        } catch (err) {
            console.error('checkAdmin error:', err)
            router.push(`/${lang}/login`)
        } finally {
            setLoading(false)
        }
    }

    async function handleLogout() {
        try {
            await supabase.auth.signOut()
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            showToast('Logged out successfully', 'success')
            window.location.href = `/${lang}/login`
        }
    }

    const isActive = (path: string) => pathname.includes(path)
    const isExactActive = (path: string) => pathname === path || pathname === `${path}/`

    if (loading) {
        return (
            <div className={styles.adminLayout}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--muted)',
                    minHeight: '100vh'
                }}>
                    Loading admin panel...
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return (
            <div className={styles.adminLayout}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    color: 'var(--muted)',
                    minHeight: '100vh',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <h3>Access Denied or Redirecting...</h3>
                    <p>You must be an administrator to access this area.</p>
                    <Link href={`/${lang}`} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                        🌐 Return to Storefront
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.adminLayout}>
            {/* Mobile Toggle */}
            <button
                className={styles.mobileToggle}
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            <div
                className={`${styles.mobileOverlay} ${sidebarOpen ? styles.open : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
                {/* Logo */}
                <div className={styles.sidebarHeader}>
                    <Link href={`/${lang}/admin`} className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <Shield size={20} />
                        </div>
                        <span className={styles.logoText}>
                            Guardify <span>Admin</span>
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    {/* Main */}
                    <div className={styles.navSection}>
                        <div className={styles.navSectionTitle}>Main</div>
                        <Link
                            href={`/${lang}/admin`}
                            className={`${styles.navItem} ${isExactActive(`/${lang}/admin`) ? styles.active : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className={styles.navItemIcon}><LayoutDashboard size={18} /></span>
                            Dashboard
                        </Link>
                        <Link
                            href={`/${lang}`}
                            className={styles.navItem}
                            onClick={() => setSidebarOpen(false)}
                            style={{ color: '#00F2FE' }}
                        >
                            <span className={styles.navItemIcon}><Globe size={18} /></span>
                            Return to Storefront
                        </Link>
                    </div>

                    {/* Management */}
                    <div className={styles.navSection}>
                        <div className={styles.navSectionTitle}>Management</div>

                        <Link
                            href={`/${lang}/admin/orders`}
                            className={`${styles.navItem} ${isActive('/admin/orders') ? styles.active : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className={styles.navItemIcon}><ClipboardList size={18} /></span>
                            Orders
                        </Link>

                        <Link
                            href={`/${lang}/admin/payments`}
                            className={`${styles.navItem} ${isActive('/admin/payments') ? styles.active : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className={styles.navItemIcon}><CreditCard size={18} /></span>
                            Payments
                        </Link>

                        <Link
                            href={`/${lang}/admin/promos`}
                            className={`${styles.navItem} ${isActive('/admin/promos') ? styles.active : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className={styles.navItemIcon}><Percent size={18} /></span>
                            Partners &amp; Promos
                        </Link>

                        {/* Products (Expandable) */}
                        <button
                            className={`${styles.navExpand} ${isActive('/admin/products') || isActive('/admin/categories') ? styles.active : ''}`}
                            onClick={() => setProductsOpen(!productsOpen)}
                        >
                            <span className={styles.navItemIcon}><Package size={18} /></span>
                            Products
                            <ChevronDown size={16} className={`${styles.expandIcon} ${productsOpen ? styles.open : ''}`} />
                        </button>

                        <div className={`${styles.subNav} ${productsOpen ? styles.open : ''}`}>
                            <Link
                                href={`/${lang}/admin/products`}
                                className={`${styles.subNavItem} ${isExactActive(`/${lang}/admin/products`) ? styles.active : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                All Products
                            </Link>
                            <Link
                                href={`/${lang}/admin/products/new`}
                                className={`${styles.subNavItem} ${isActive('/admin/products/new') ? styles.active : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                Add Product
                            </Link>
                            <Link
                                href={`/${lang}/admin/categories`}
                                className={`${styles.subNavItem} ${isActive('/admin/categories') ? styles.active : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                Categories
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Footer - User Info */}
                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>{userEmail.split('@')[0]}</div>
                            <div className={styles.userRole}>Administrator</div>
                        </div>
                        <button
                            className={styles.logoutBtn}
                            onClick={handleLogout}
                            title="Log out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    {children}
                </div>
            </main>
        </div>
    )
}
