'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './navbar.module.css'
import { useCart } from '@/context/CartContext'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'
import { createClient } from '@/utils/supabase/client'
import { ShoppingCart, Heart, User, ChevronDown, MessageCircle, Menu, X, LogOut, Package, Search, MoreVertical, HelpCircle, FileText, Info } from 'lucide-react'
import CartModal from './CartModal'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { useParams, useRouter } from 'next/navigation'
import { Locale } from '@/i18n-config'

type NavbarProps = {
    dict: any
}

export default function Navbar({ dict }: NavbarProps) {
    const { cart, isCartOpen, setIsCartOpen } = useCart()
    const { wishlist } = useWishlist()
    const { user, loading: authLoading, signOut } = useAuth()
    const [mounted, setMounted] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const moreMenuRef = useRef<HTMLDivElement>(null)

    const params = useParams()
    const router = useRouter()
    const lang = (params?.lang as Locale) || 'en'
    const supabase = createClient()

    useEffect(() => {
        setMounted(true)
    }, [])

    // Check admin role when user changes
    useEffect(() => {
        async function checkAdmin() {
            if (!user) {
                setIsAdmin(false)
                return
            }

            const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .eq('role', 'admin')

            setIsAdmin(!!(roles && roles.length > 0))
        }

        checkAdmin()
    }, [user])

    const handleSignOut = async () => {
        await signOut()
        setIsAccountMenuOpen(false)
        window.location.href = `/${lang}` // Force hard refresh to clear all state
    }

    // Close account menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement
            if (!target.closest(`.${styles.accountDropdownWrapper}`)) {
                setIsAccountMenuOpen(false)
            }
            if (!target.closest(`.${styles.moreMenuWrapper}`)) {
                setIsMoreMenuOpen(false)
            }
        }

        if (isAccountMenuOpen || isMoreMenuOpen) {
            document.addEventListener('click', handleClickOutside)
            return () => document.removeEventListener('click', handleClickOutside)
        }
    }, [isAccountMenuOpen, isMoreMenuOpen])

    // Handle search submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/${lang}/products?search=${encodeURIComponent(searchQuery.trim())}`)
            setSearchQuery('')
            setIsSearchFocused(false)
        }
    }

    return (
        <>
            {/* Top Utility Bar */}
            <div className={styles.topBar}>
                <div className={styles.topBarContainer}>
                    <Link href="https://wa.me/8801997118118" className={styles.contactLink}>
                        <MessageCircle size={14} />
                        24/7 Live Support: WhatsApp +880 1997-118118
                    </Link>
                    <div className={styles.trustBadges}>
                        <span className={styles.trustBadge}>✔ DBID Verified Business</span>
                        <span className={styles.badgeSeparator}>|</span>
                        <span className={styles.trustBadge}>✔ 100% Genuine Subscriptions</span>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className={styles.header}>
                <div className={styles.container}>
                    {/* Mobile Menu Button */}
                    <button
                        className={styles.mobileMenuBtn}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo Only */}
                    <Link href={`/${lang}`} className={styles.logo}>
                        <Image
                            src="/logo-v3.png"
                            alt="Guardify IT"
                            width={85}
                            height={85}
                            className={styles.logoImage}
                        />
                    </Link>

                    {/* Global Search Bar */}
                    <form onSubmit={handleSearch} className={styles.searchBar}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className={styles.searchInput}
                        />
                    </form>

                    {/* Desktop Navigation */}
                    <nav className={styles.nav}>
                        <Link href={`/${lang}`} className={styles.navLink}>Home</Link>
                        <Link href={`/${lang}/products`} className={styles.navLink}>Shop</Link>
                        <Link href={`/${lang}/contact`} className={styles.navLink}>Contact</Link>
                    </nav>

                    {/* User Utilities */}
                    <div className={styles.actions}>
                        <ThemeToggle />
                        <LanguageSwitcher />

                        {isAdmin && (
                            <Link href={`/${lang}/admin/orders`} className={styles.link} style={{ color: '#ef4444' }}>
                                Admin
                            </Link>
                        )}

                        {/* Account Button - Conditional */}
                        {!authLoading && (
                            user ? (
                                // Logged In: Show Account Dropdown
                                <div className={styles.accountDropdownWrapper}>
                                    <button
                                        onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                                        className={styles.accountBtn}
                                        aria-label="Account menu"
                                    >
                                        <User size={22} />
                                        <ChevronDown size={14} className={isAccountMenuOpen ? styles.chevronUp : ''} />
                                    </button>

                                    {isAccountMenuOpen && (
                                        <div className={styles.accountDropdown}>
                                            <div className={styles.accountHeader}>
                                                <span className={styles.accountEmail}>{user.email}</span>
                                            </div>
                                            <div className={styles.accountDivider} />
                                            <Link
                                                href={`/${lang}/my-orders`}
                                                className={styles.accountItem}
                                                onClick={() => setIsAccountMenuOpen(false)}
                                            >
                                                <Package size={16} />
                                                My Orders
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className={styles.accountItem}
                                            >
                                                <LogOut size={16} />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Not Logged In: Show Login Link
                                <Link href={`/${lang}/login`} className={styles.iconBtn}>
                                    <User size={22} />
                                </Link>
                            )
                        )}

                        <Link href={`/${lang}/wishlist`} className={styles.iconBtn}>
                            <Heart size={22} />
                            {mounted && wishlist.length > 0 && (
                                <span className={styles.badge}>{wishlist.length}</span>
                            )}
                        </Link>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className={styles.iconBtn}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}
                        >
                            <ShoppingCart size={22} />
                            {mounted && cart.length > 0 && (
                                <span className={styles.badge}>{cart.length}</span>
                            )}
                        </button>

                        {/* 3-dot More Menu - At the very end */}
                        <div className={styles.moreMenuWrapper} ref={moreMenuRef}>
                            <button
                                className={styles.moreBtn}
                                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                                aria-label="More options"
                            >
                                <MoreVertical size={20} />
                            </button>
                            {isMoreMenuOpen && (
                                <div className={styles.moreMenu}>
                                    <Link href={`/${lang}/how-it-works`} className={styles.moreMenuItem} onClick={() => setIsMoreMenuOpen(false)}>
                                        <HelpCircle size={16} />
                                        How It Works
                                    </Link>
                                    <Link href={`/${lang}/faq`} className={styles.moreMenuItem} onClick={() => setIsMoreMenuOpen(false)}>
                                        <FileText size={16} />
                                        FAQ
                                    </Link>
                                    <Link href={`/${lang}/about`} className={styles.moreMenuItem} onClick={() => setIsMoreMenuOpen(false)}>
                                        <Info size={16} />
                                        About Us
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenuOverlay} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
                        <nav className={styles.mobileNav}>
                            <Link href={`/${lang}`} className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link href={`/${lang}/products`} className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                                All Products
                            </Link>
                            <Link href={`/${lang}/contact`} className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                                Contact
                            </Link>
                            <div className={styles.mobileDivider}></div>

                            {/* Mobile Auth Links */}
                            {user ? (
                                <>
                                    <Link href={`/${lang}/my-orders`} className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                                        My Orders
                                    </Link>
                                    <button
                                        onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                                        className={styles.mobileLink}
                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link href={`/${lang}/login`} className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                                    Sign In / Sign Up
                                </Link>
                            )}

                            <Link href={`/${lang}/about`} className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                                About Us
                            </Link>
                            <Link href={`/${lang}/faq`} className={styles.mobileLink} onClick={() => setIsMobileMenuOpen(false)}>
                                FAQ
                            </Link>
                        </nav>
                    </div>
                </div>
            )}

            {/* Cart Modal */}
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} dict={dict} />
        </>
    )
}
