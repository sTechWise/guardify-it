'use client'

import { useCart } from '@/context/CartContext'
import { createClient } from '@/utils/supabase/client'
import styles from './checkout.module.css'
import { useState, useEffect } from 'react'
import { createOrder } from '@/actions/createOrder'
import { useRouter } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { Info, ShoppingBag, CheckCircle, ShieldCheck, MessageCircle, Clock, ChevronRight, Check } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useClientDictionary } from '@/hooks/useClientDictionary'

export default function CheckoutPage() {
    const { cart, clearCart } = useCart()
    const router = useRouter()
    const { dict, lang } = useClientDictionary()
    const { showToast } = useToast()
    const { user } = useAuth()
    const supabase = createClient()
    const [authChecking, setAuthChecking] = useState(true)

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.reload()
    }

    // Check auth state on mount
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            if (currentUser?.email) {
                setEmail(currentUser.email)
            }
            setAuthChecking(false)
        }
        checkAuth()
    }, [])

    useEffect(() => {
        setMounted(true)
    }, [])

    const subtotal = cart.reduce((acc, item) => acc + ((item.sale_price || item.price) * item.quantity), 0)
    const total = subtotal // No tax for now

    // Redirect if empty
    useEffect(() => {
        if (mounted && cart.length === 0 && !isSuccess) {
            router.push(`/${lang}/cart`)
        }
    }, [cart, router, mounted, isSuccess, lang])

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        console.log('[Checkout] Starting process...')

        // Global Timeout
        const timeout = setTimeout(() => {
            if (loading) {
                setLoading(false)
                setError('Request timed out. Please check your connection.')
                console.error('Checkout Timeout')
            }
        }, 30000)

        try {
            const orderEmail = email.trim()
            if (!orderEmail) throw new Error('Email is required')

            // 1. Determine User ID
            let userId = user?.id || null

            // If not logged in, try guest flow
            if (!userId) {
                console.log('[Checkout] Guest flow for:', orderEmail)
                try {
                    const res = await fetch('/api/guest-checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: orderEmail })
                    })

                    // We don't abort, we just check result
                    if (res.ok) {
                        const data = await res.json()
                        if (data.userId) userId = data.userId
                    }
                } catch (err) {
                    console.error('Guest API failed, proceeding as unlinked guest:', err)
                }
            }

            console.log('[Checkout] Creating order for:', userId || 'Guest')

            // 2. Create Order
            const newOrder = await createOrder(
                cart.map(i => ({
                    id: i.id,
                    quantity: i.quantity
                })),
                orderEmail,
                userId
            )

            // 3. Success
            clearTimeout(timeout)
            setIsSuccess(true)
            clearCart()
            showToast('Order successful! Redirecting...', 'success')
            router.push(`/${lang}/payment-instructions?order_id=${newOrder.id}`)

        } catch (err: any) {
            clearTimeout(timeout)
            console.error('Checkout Error:', err)
            setError(err.message || 'Checkout failed')
            setLoading(false)
        }
    }

    if (!mounted) return null

    if (cart.length === 0) return null

    return (
        <main className={styles.container}>
            {/* 1. Step Progress Indicator */}
            <div className={styles.progressContainer}>
                <div className={styles.step}>
                    <div className={styles.stepIcon}><Check size={14} /></div>
                    <span>{dict.step_cart}</span>
                </div>
                <ChevronRight size={16} className={styles.stepSeparator} />
                <div className={`${styles.step} ${styles.active}`}>
                    <div className={styles.stepIcon}>2</div>
                    <span>{dict.step_details}</span>
                </div>
                <ChevronRight size={16} className={styles.stepSeparator} />
                <div className={styles.step}>
                    <div className={styles.stepIcon}>3</div>
                    <span>{dict.step_payment}</span>
                </div>
                <ChevronRight size={16} className={styles.stepSeparator} />
                <div className={styles.step}>
                    <div className={styles.stepIcon}>4</div>
                    <span>{dict.step_access}</span>
                </div>
            </div>

            <div className={styles.header}>
                <h1 className={styles.title}>{dict.secure_checkout_title}</h1>
                <p className={styles.subtitle}>{dict.complete_order_subtitle}</p>
                {user && (
                    <div style={{ marginTop: '0.5rem', background: '#f6ffed', padding: '0.5rem 1rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid #b7eb8f', color: '#389e0d', fontSize: '0.9rem' }}>
                        <CheckCircle size={14} />
                        <span>Logged in as <b>{user.email}</b></span>
                        <button
                            onClick={handleSignOut}
                            style={{ background: 'none', border: 'none', color: '#ff4d4f', textDecoration: 'underline', cursor: 'pointer', marginLeft: '4px', fontSize: '0.9rem' }}
                            type="button"
                        >
                            (Sign out)
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handlePlaceOrder}>
                <div className={styles.layout}>
                    {/* Left Column - Form */}
                    <div className={styles.formSection}>
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>{dict.contact_information}</h2>

                            {/* 2. Trust Block above Email */}
                            <div className={styles.trustBlock}>
                                <div className={styles.trustItem}>
                                    <ShieldCheck size={16} className={styles.trustIcon} /> {dict.dbid_verified_business}
                                </div>
                                <div className={styles.trustItem}>
                                    <CheckCircle size={16} className={styles.trustIcon} /> {dict.genuine_100}
                                </div>
                                <div className={styles.trustItem}>
                                    <MessageCircle size={16} className={styles.trustIcon} /> {dict.whatsapp_support}
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>{dict.email_required}</label>
                                <input
                                    type="email"
                                    required
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={dict.email_placeholder}
                                />
                            </div>

                            {/* 3. Improved Account Explanation */}
                            <div className={styles.note}>
                                <Info size={20} className={styles.noteIcon} />
                                <p className={styles.noteText}>
                                    <strong>{dict.no_account_note}</strong> {dict.account_auto_create}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className={styles.summary}>
                        <div className={styles.orderSummary}>
                            <h2 className={styles.sectionTitle}>
                                <ShoppingBag size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                {dict.order_summary}
                            </h2>

                            {/* 4. Improved Order Summary Items */}
                            <div className={styles.summaryItems}>
                                {cart.map((item) => (
                                    <div key={item.id} className={styles.summaryItem}>
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.title} className={styles.itemImage} />
                                        ) : (
                                            <div className={styles.itemImage} />
                                        )}

                                        <div className={styles.itemDetails}>
                                            <div className={styles.itemName}>{item.title}</div>
                                            {item.subscription_type && (
                                                <div className={styles.itemPlan}>{item.subscription_type} {dict.plan}</div>
                                            )}
                                        </div>

                                        {/* 5. Pricing with Savings */}
                                        <div className={styles.itemPriceBlock}>
                                            {item.sale_price ? (
                                                <>
                                                    <div className={styles.itemPrice}>৳{item.sale_price.toLocaleString()}</div>
                                                    <div className={styles.oldPrice}>৳{item.price.toLocaleString()}</div>
                                                    <div className={styles.savingsBadge}>
                                                        {dict.save_amount} ৳{(item.price - item.sale_price).toLocaleString()}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className={styles.itemPrice}>৳{item.price.toLocaleString()}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.totals}>
                                <div className={styles.totalRow}>
                                    <span>{dict.subtotal}</span>
                                    <span>৳{subtotal.toLocaleString()}</span>
                                </div>
                                <div className={`${styles.totalRow} ${styles.final}`}>
                                    <span>{dict.total}</span>
                                    <span>৳{total.toLocaleString()}</span>
                                </div>

                                {/* 6. Trust Reinforcement near Total */}
                                <div className={styles.trustChecks}>
                                    <div className={styles.checkItem}>
                                        <CheckCircle size={14} className={styles.checkIcon} /> {dict.warranty_30_days}
                                    </div>
                                    <div className={styles.checkItem}>
                                        <Clock size={14} className={styles.checkIcon} /> {dict.instant_activation_text}
                                    </div>
                                    <div className={styles.checkItem}>
                                        <MessageCircle size={14} className={styles.checkIcon} /> {dict.friendly_support}
                                    </div>
                                </div>
                            </div>

                            {error && <p className={styles.error}>{error}</p>}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? dict.processing : dict.continue_to_payment} <ChevronRight size={18} />
                            </button>

                            {/* 7. Support Reassurance */}
                            <p className={styles.supportReassurance}>
                                {dict.help_before_paying} <a href="#" target="_blank" className={styles.whatsappLink}>{dict.chat_whatsapp}</a> — {dict.instant_reply}.
                            </p>
                        </div>
                    </div>
                </div>
            </form>

            {/* 8. Micro Reassurance Footer */}
            <div className={styles.microFooter}>
                <div className={styles.avatars}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={styles.avatar} style={{ background: `hsl(${i * 60}, 70%, 80%)` }} />
                    ))}
                </div>
                <p className={styles.footerText}>
                    {dict.trust_footer}
                </p>
            </div>
        </main>
    )
}
