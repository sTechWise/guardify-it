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

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Pre-fill email if user is logged in
    useEffect(() => {
        if (user?.email && !email) {
            setEmail(user.email)
        }
    }, [user])

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

        try {
            // Validate email first
            const orderEmail = email.trim()
            if (!orderEmail) {
                throw new Error('Email address is required')
            }

            // 1. Check Session
            const { data: { session } } = await supabase.auth.getSession()

            let userId = session?.user?.id || null

            if (!session) {
                // Guest Checkout Flow - try to create guest user or get existing user ID
                console.log('[Checkout] No session, attempting guest checkout for:', orderEmail)

                try {
                    // Use AbortController for timeout
                    const controller = new AbortController()
                    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

                    const res = await fetch('/api/guest-checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: orderEmail }),
                        signal: controller.signal
                    })

                    clearTimeout(timeoutId)

                    const data = await res.json()

                    if (!res.ok) {
                        // User exists - they need to login OR we proceed without session
                        if (res.status === 409) {
                            console.log('[Checkout] User exists, proceeding without linking to account')
                            // Continue without setting session - order will be created with email only
                        } else {
                            console.error('[Checkout] Guest checkout API error:', data.error)
                            // Continue anyway - we can still create order with email only
                        }
                    } else if (data.userId) {
                        // New user created, we have their ID
                        userId = data.userId
                        console.log('[Checkout] Guest user created with ID:', userId)
                    }
                } catch (guestError: any) {
                    if (guestError.name === 'AbortError') {
                        console.error('[Checkout] Guest checkout timed out')
                    } else {
                        console.error('[Checkout] Guest checkout error:', guestError)
                    }
                    // Continue anyway - we can still create order with email only
                }
            }

            console.log('[Checkout] Creating order with email:', orderEmail, 'userId:', userId)

            // 2. Create Order (Server Action)
            const newOrder = await createOrder(
                cart.map(item => ({
                    id: item.id,
                    name: item.title || 'Product',
                    price: item.sale_price || item.price,
                    quantity: item.quantity
                })),
                orderEmail,
                userId
            )

            // 3. Success
            setIsSuccess(true)
            clearCart()
            showToast('Order placed successfully!', 'success')
            router.push(`/${lang}/payment-instructions?order_id=${newOrder.id}`)

        } catch (err: any) {
            console.error('[Checkout] Error:', err)
            setError(err.message || 'Something went wrong. Please try again.')
            showToast(err.message || 'Checkout failed', 'error')
            setLoading(false) // Ensure loading is reset on error
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
