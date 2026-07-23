'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import { Home, ShoppingBag, Heart, ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import styles from './mobile-nav.module.css'
import { Locale } from '@/i18n-config'

export default function MobileNav() {
    const pathname = usePathname()
    const params = useParams()
    const lang = (params?.lang as Locale) || 'en'
    const { cart, setIsCartOpen } = useCart()
    const { wishlist } = useWishlist()
    const { user } = useAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isHome = pathname === `/${lang}` || pathname === '/'
    const isShop = pathname.includes('/products')
    const isWishlist = pathname.includes('/wishlist')
    const isOrders = pathname.includes('/my-orders') || pathname.includes('/login')

    return (
        <nav className={styles.mobileNav}>
            {/* Home Tab */}
            <Link href={`/${lang}`} className={`${styles.navItem} ${isHome ? styles.active : ''}`}>
                <div className={styles.iconWrapper}>
                    <Home size={20} />
                </div>
                <span>Home</span>
            </Link>

            {/* Shop Tab */}
            <Link href={`/${lang}/products`} className={`${styles.navItem} ${isShop ? styles.active : ''}`}>
                <div className={styles.iconWrapper}>
                    <ShoppingBag size={20} />
                </div>
                <span>Shop</span>
            </Link>

            {/* Wishlist Tab */}
            <Link href={`/${lang}/wishlist`} className={`${styles.navItem} ${isWishlist ? styles.active : ''}`}>
                <div className={styles.iconWrapper}>
                    <Heart size={20} />
                    {mounted && wishlist.length > 0 && (
                        <span className={styles.badge}>{wishlist.length}</span>
                    )}
                </div>
                <span>Wishlist</span>
            </Link>

            {/* Cart Trigger Tab */}
            <button
                onClick={() => setIsCartOpen(true)}
                className={styles.navItem}
            >
                <div className={styles.iconWrapper}>
                    <ShoppingCart size={20} />
                    {mounted && cart.length > 0 && (
                        <span className={styles.badge}>{cart.length}</span>
                    )}
                </div>
                <span>Cart</span>
            </button>

            {/* Account / Orders Tab */}
            <Link
                href={user ? `/${lang}/my-orders` : `/${lang}/login`}
                className={`${styles.navItem} ${isOrders ? styles.active : ''}`}
            >
                <div className={styles.iconWrapper}>
                    <User size={20} />
                </div>
                <span>{user ? 'Orders' : 'Account'}</span>
            </Link>
        </nav>
    )
}
