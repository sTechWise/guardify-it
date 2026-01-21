'use client'

import { useCart } from '@/context/CartContext'
import styles from './cart.module.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Trash2, Shield, CheckCircle, Smartphone, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react'
import { useClientDictionary } from '@/hooks/useClientDictionary'

export default function CartPage() {
    const { cart, removeFromCart } = useCart()
    const { dict, lang } = useClientDictionary()
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
                    <h1 className={styles.emptyTitle}>{dict.your_cart_is_empty}</h1>
                    <p className={styles.emptyText}>{dict.havent_added_yet}</p>
                    <Link href={`/${lang}/products`} className={styles.exploreBtn}>
                        {dict.explore_deals}
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.container}>
            <h1 className={styles.title}>{dict.your_cart} ({cart.length})</h1>

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
                                        title={dict.remove_item}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p className={styles.itemMeta}>
                                    {item.subscription_type ? `${item.subscription_type} ${dict.plan}` : dict.lifetime_access}
                                </p>

                                <div className={styles.itemPricing}>
                                    {item.sale_price ? (
                                        <div className={styles.priceBlock}>
                                            <div className={styles.priceRow}>
                                                <span className={styles.oldPrice}>৳{item.price.toLocaleString()}</span>
                                                <span className={styles.currentPrice}>৳{item.sale_price.toLocaleString()}</span>
                                            </div>
                                            <div className={styles.savingsBadge}>
                                                {dict.you_save} ৳{(item.price - item.sale_price).toLocaleString()}
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
                        <h2 className={styles.summaryTitle}>{dict.order_summary}</h2>

                        <div className={styles.trustStrip}>
                            <div className={styles.trustItem}>
                                <Shield size={14} className={styles.trustIcon} />
                                <span>{dict.dbid_verified}</span>
                            </div>
                            <div className={styles.trustItem}>
                                <CheckCircle size={14} className={styles.trustIcon} />
                                <span>{dict.genuine}</span>
                            </div>
                            <div className={styles.trustItem}>
                                <Smartphone size={14} className={styles.trustIcon} />
                                <span>{dict.support_24_7_short}</span>
                            </div>
                        </div>

                        <div className={styles.summaryRow}>
                            <span>{dict.subtotal}</span>
                            <span>৳{total.toLocaleString()}</span>
                        </div>

                        {savings > 0 && (
                            <div className={`${styles.summaryRow} ${styles.savingsRow}`}>
                                <span>{dict.total_savings}</span>
                                <span>-৳{savings.toLocaleString()}</span>
                            </div>
                        )}

                        <div className={styles.totalRow}>
                            <span>{dict.total}</span>
                            <span>৳{total.toLocaleString()}</span>
                        </div>

                        <div className={styles.urgencyNudge}>
                            <AlertCircle size={14} /> {dict.high_demand_nudge}
                        </div>

                        <Link href={`/${lang}/checkout`} className={styles.checkoutBtn}>
                            {dict.proceed_to_checkout} <ArrowRight size={18} />
                        </Link>

                        <p className={styles.microcopy}>
                            {dict.instant_activation} • {dict.no_account_required} • {dict.secure_checkout}
                        </p>

                        <div className={styles.supportFallback}>
                            {dict.need_help_whatsapp.split('?')[0]}? <a href="#" target="_blank">{dict.chat_whatsapp}</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
