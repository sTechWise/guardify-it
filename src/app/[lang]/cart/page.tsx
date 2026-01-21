'use client'

import { useCart } from '@/context/CartContext'
import styles from './cart.module.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Trash2, Shield, CheckCircle, Smartphone, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react'

export default function CartPage() {
    const { cart, removeFromCart } = useCart()
    const [total, setTotal] = useState(0)
    const [savings, setSavings] = useState(0)

    // Avoid hydration mismatch by waiting for mount
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const sum = cart.reduce((acc, item) => acc + (item.sale_price || item.price), 0)

        // precise savings calculation
        const totalOriginal = cart.reduce((acc, item) => acc + item.price, 0)
        const totalSavings = totalOriginal - sum

        setTotal(sum)
        setSavings(totalSavings)
    }, [cart])

    if (!mounted) return null

    if (cart.length === 0) {
        return (
            <main className={styles.container}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIconWrapper}>
                        <ShoppingBag size={64} className={styles.emptyIcon} />
                    </div>
                    <h1 className={styles.emptyTitle}>Your cart is empty</h1>
                    <p className={styles.emptyText}>Looks like you haven't added any subscriptions yet.</p>
                    <Link href="/products" className={styles.exploreBtn}>
                        Explore Best Deals
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Your Cart ({cart.length})</h1>

            <div className={styles.cartGrid}>
                <div className={styles.itemsList}>
                    {cart.map((item) => (
                        <div key={item.id} className={styles.item}>
                            <div className={styles.itemImageWrapper}>
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className={styles.itemImage} />
                                ) : (
                                    <div className={styles.imagePlaceholder} />
                                )}
                            </div>

                            <div className={styles.itemDetails}>
                                <div className={styles.itemHeader}>
                                    <h3 className={styles.itemName}>{item.title}</h3>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className={styles.removeBtn}
                                        title="Remove item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className={styles.itemMeta}>
                                    {item.subscription_type ? `${item.subscription_type} Plan` : 'Lifetime Access'}
                                    {/* • Instant Delivery */}
                                </p>

                                <div className={styles.itemPricing}>
                                    {item.sale_price ? (
                                        <div className={styles.priceBlock}>
                                            <div className={styles.priceRow}>
                                                <span className={styles.oldPrice}>৳{item.price.toLocaleString()}</span>
                                                <span className={styles.currentPrice}>৳{item.sale_price.toLocaleString()}</span>
                                            </div>
                                            <div className={styles.savingsBadge}>
                                                You save ৳{(item.price - item.sale_price).toLocaleString()}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className={styles.currentPrice}>৳{item.price.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.summaryWrapper}>
                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>

                        <div className={styles.trustStrip}>
                            <div className={styles.trustItem}>
                                <Shield size={14} className={styles.trustIcon} />
                                <span>DBID Verified</span>
                            </div>
                            <div className={styles.trustItem}>
                                <CheckCircle size={14} className={styles.trustIcon} />
                                <span>Genuine</span>
                            </div>
                            <div className={styles.trustItem}>
                                <Smartphone size={14} className={styles.trustIcon} />
                                <span>24/7 Support</span>
                            </div>
                        </div>

                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>৳{total.toLocaleString()}</span>
                        </div>

                        {savings > 0 && (
                            <div className={`${styles.summaryRow} ${styles.savingsRow}`}>
                                <span>Total Savings</span>
                                <span>-৳{savings.toLocaleString()}</span>
                            </div>
                        )}

                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>৳{total.toLocaleString()}</span>
                        </div>

                        <div className={styles.urgencyNudge}>
                            <AlertCircle size={14} /> High demand today — secure your order now
                        </div>

                        <Link href="/checkout" className={styles.checkoutBtn}>
                            Proceed to Checkout <ArrowRight size={18} />
                        </Link>

                        <p className={styles.microcopy}>
                            Instant activation • No account required • 100% secure checkout
                        </p>

                        <div className={styles.supportFallback}>
                            Need help? <a href="#" target="_blank">Chat with us on WhatsApp</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
