'use client'

import styles from './payment.module.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, Copy, AlertCircle, CreditCard, ArrowRight } from 'lucide-react'

import { useRouter, useSearchParams, useParams } from 'next/navigation'

export default function PaymentInstructionsPage() {
    const searchParams = useSearchParams()
    const params = useParams()
    const lang = params.lang as string || 'en'
    const orderId = searchParams.get('order_id')

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchOrder() {
            let data = null

            // 1. Try fetching by ID from URL (Most reliable)
            if (orderId) {
                const { data: orderData } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single()

                if (orderData) data = orderData
            }

            // 2. Fallback to latest order for user (if logged in)
            if (!data) {
                const { data: { user } } = await supabase.auth.getUser()
                if (user?.email) {
                    const { data: userOrder } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('user_email', user.email)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single()

                    if (userOrder) data = userOrder
                }
            }

            setOrder(data)
            setLoading(false)
        }

        fetchOrder()
    }, [orderId])

    const copyToClipboard = (text: string, method: string) => {
        navigator.clipboard.writeText(text)
        setCopied(method)
        setTimeout(() => setCopied(null), 2000)
    }

    if (loading) return <div className={styles.container}>Loading order details...</div>

    const paymentMethods = [
        { name: 'bKash', number: '01700000000', color: '#d1396a', type: 'Personal' },
        { name: 'Nagad', number: '01700000000', color: '#e2432d', type: 'Personal' },
        { name: 'Rocket', number: '01700000000', color: '#8c3494', type: 'Personal' },
    ]

    return (
        <main className={styles.container}>
            {/* Success Header */}
            <div className={styles.successBanner}>
                <CheckCircle size={48} className={styles.successIcon} />
                <div>
                    <h1 className={styles.title}>Order Placed Successfully!</h1>
                    <p className={styles.subtitle}>Your order has been confirmed. Complete payment to activate your subscriptions.</p>
                </div>
            </div>

            <div className={styles.content}>
                {/* Order Info Card */}
                {order && (
                    <div className={styles.orderCard}>
                        <h2 className={styles.cardTitle}>Order Details</h2>
                        <div className={styles.orderInfo}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Order ID</span>
                                <span className={styles.infoValue}>{order.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Order Date</span>
                                <span className={styles.infoValue}>{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Status</span>
                                <span className={styles.statusPending}>Pending Payment</span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>Total Amount</span>
                                <span className={styles.totalAmount}>৳{order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Instructions */}
                <div className={styles.paymentSection}>
                    <div className={styles.sectionHeader}>
                        <CreditCard size={24} />
                        <h2 className={styles.sectionTitle}>Payment Methods</h2>
                    </div>
                    <p className={styles.instructions}>
                        Send the exact amount to any of the following mobile banking numbers using <strong>"Send Money"</strong> option.
                    </p>

                    <div className={styles.methodsGrid}>
                        {paymentMethods.map((method) => (
                            <div key={method.name} className={styles.methodCard}>
                                <div className={styles.methodHeader}>
                                    <span className={styles.methodName} style={{ color: method.color }}>{method.name}</span>
                                    <span className={styles.methodType}>{method.type}</span>
                                </div>
                                <div className={styles.numberRow}>
                                    <span className={styles.number}>{method.number}</span>
                                    <button
                                        onClick={() => copyToClipboard(method.number, method.name)}
                                        className={styles.copyBtn}
                                    >
                                        {copied === method.name ? 'Copied!' : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Steps */}
                    <div className={styles.steps}>
                        <h3 className={styles.stepsTitle}>How to Complete Payment</h3>
                        <ol className={styles.stepsList}>
                            <li>Open your mobile banking app (bKash/Nagad/Rocket)</li>
                            <li>Select <strong>"Send Money"</strong> option</li>
                            <li>Enter the number from above and exact amount: <strong>৳{order?.total_amount.toLocaleString()}</strong></li>
                            <li>Complete the transaction and save the transaction ID</li>
                            <li>Upload payment proof below to activate your order</li>
                        </ol>
                    </div>

                    {/* Important Note */}
                    <div className={styles.alertBox}>
                        <AlertCircle size={20} className={styles.alertIcon} />
                        <div>
                            <strong>Important:</strong> Please upload your payment screenshot or transaction ID within 24 hours. Orders without payment proof will be automatically cancelled.
                        </div>
                    </div>
                </div>

                {/* Upload Button */}
                <Link
                    href={orderId || order?.id ? `/${lang}/upload-proof?order_id=${orderId || order?.id}` : `/${lang}/my-orders`}
                    className={styles.uploadBtn}
                >
                    Upload Payment Proof <ArrowRight size={20} />
                </Link>
            </div>
        </main>
    )
}
