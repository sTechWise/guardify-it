'use client'

import { useCart } from '@/context/CartContext'
import { createClient } from '@/utils/supabase/client'
import styles from './checkout.module.css'
import { useState, useEffect } from 'react'
import { createOrder } from '@/actions/createOrder'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { Info, ShoppingBag, CheckCircle, ShieldCheck, MessageCircle, Clock, ChevronRight, Check } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function CheckoutPage() {
    const { cart, clearCart } = useCart()
    const router = useRouter()
    const params = useParams()
    const lang = params.lang as string || 'en'
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
                // Guest Checkout Flow - try to create guest user
                console.log('[Checkout] No session, attempting guest checkout for:', orderEmail)

                try {
                    const res = await fetch('/api/guest-checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: orderEmail })
                    })

                    const data = await res.json()

                    if (!res.ok) {
                        // User exists - they need to login OR we proceed without session
                        if (res.status === 409) {
                            console.log('[Checkout] User exists, proceeding without linking to account')
                            // Continue without setting session - order will be created with email only
                        } else {
                            throw new Error(data.error || 'Checkout failed')
                        }
                    } else if (data.session) {
                        // New user created, set session
                        const { error: sessionError } = await supabase.auth.setSession(data.session)
                        if (sessionError) {
                            console.error('[Checkout] Session error:', sessionError)
                            // Continue anyway - order can still be created
                        } else {
                            userId = data.session.user?.id || null
                        }
                    }
                } catch (guestError: any) {
                    console.error('[Checkout] Guest checkout error:', guestError)
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
        } finally {
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
                    <span>Cart</span>
                </div>
                <ChevronRight size={16} className={styles.stepSeparator} />
                <div className={`${styles.step} ${styles.active}`}>
                    <div className={styles.stepIcon}>2</div>
                    <span>Details</span>
                </div>
                <ChevronRight size={16} className={styles.stepSeparator} />
                <div className={styles.step}>
                    <div className={styles.stepIcon}>3</div>
                    <span>Payment</span>
                </div>
                <ChevronRight size={16} className={styles.stepSeparator} />
                <div className={styles.step}>
                    <div className={styles.stepIcon}>4</div>
                    <span>Access</span>
                </div>
            </div>

            <div className={styles.header}>
                <h1 className={styles.title}>Secure Checkout</h1>
                <p className={styles.subtitle}>Complete your order to get instant access</p>
            </div>

            <form onSubmit={handlePlaceOrder}>
                <div className={styles.layout}>
                    {/* Left Column - Form */}
                    <div className={styles.formSection}>
                        <div className={styles.card}>
                            <h2 className={styles.sectionTitle}>Contact Information</h2>

                            {/* 2. Trust Block above Email */}
                            <div className={styles.trustBlock}>
                                <div className={styles.trustItem}>
                                    <ShieldCheck size={16} className={styles.trustIcon} /> DBID Verified Business
                                </div>
                                <div className={styles.trustItem}>
                                    <CheckCircle size={16} className={styles.trustIcon} /> 100% Genuine
                                </div>
                                <div className={styles.trustItem}>
                                    <MessageCircle size={16} className={styles.trustIcon} /> 24/7 WhatsApp Support
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                />
                            </div>

                            {/* 3. Improved Account Explanation */}
                            <div className={styles.note}>
                                <Info size={20} className={styles.noteIcon} />
                                <p className={styles.noteText}>
                                    <strong>No account required.</strong> We automatically create one after purchase so you can track orders and re-download anytime.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className={styles.summary}>
                        <div className={styles.orderSummary}>
                            <h2 className={styles.sectionTitle}>
                                <ShoppingBag size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                Order Summary
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
                                                <div className={styles.itemPlan}>{item.subscription_type} Plan</div>
                                            )}
                                        </div>

                                        {/* 5. Pricing with Savings */}
                                        <div className={styles.itemPriceBlock}>
                                            {item.sale_price ? (
                                                <>
                                                    <div className={styles.itemPrice}>৳{item.sale_price.toLocaleString()}</div>
                                                    <div className={styles.oldPrice}>৳{item.price.toLocaleString()}</div>
                                                    <div className={styles.savingsBadge}>
                                                        Save ৳{(item.price - item.sale_price).toLocaleString()}
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
                                    <span>Subtotal</span>
                                    <span>৳{subtotal.toLocaleString()}</span>
                                </div>
                                <div className={`${styles.totalRow} ${styles.final}`}>
                                    <span>Total</span>
                                    <span>৳{total.toLocaleString()}</span>
                                </div>

                                {/* 6. Trust Reinforcement near Total */}
                                <div className={styles.trustChecks}>
                                    <div className={styles.checkItem}>
                                        <CheckCircle size={14} className={styles.checkIcon} /> 30-day warranty included
                                    </div>
                                    <div className={styles.checkItem}>
                                        <Clock size={14} className={styles.checkIcon} /> Instant activation
                                    </div>
                                    <div className={styles.checkItem}>
                                        <MessageCircle size={14} className={styles.checkIcon} /> Friendly Bangladeshi support team
                                    </div>
                                </div>
                            </div>

                            {error && <p className={styles.error}>{error}</p>}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Continue to Payment'} <ChevronRight size={18} />
                            </button>

                            {/* 7. Support Reassurance */}
                            <p className={styles.supportReassurance}>
                                Need help before paying? <a href="#" target="_blank" className={styles.whatsappLink}>Chat with us on WhatsApp</a> — instant reply.
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
                    Thousands of customers in Bangladesh trust Guardify IT for genuine subscriptions.
                </p>
            </div>
        </main>
    )
}
