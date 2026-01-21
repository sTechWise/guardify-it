'use client'

import styles from './payment.module.css'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, Copy, AlertCircle, CreditCard, ArrowRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useClientDictionary } from '@/hooks/useClientDictionary'

function PaymentInstructionsContent() {
    const searchParams = useSearchParams()
    const { dict, lang } = useClientDictionary()
    const orderId = searchParams.get('order_id')

    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchOrder() {
            let data = null

            // 1. Try fetching by ID from URL with RPC (Guest friendly)
            if (orderId) {
                // Try direct select first (works if logged in or public)
                const { data: directData, error: directError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single()

                if (directData) {
                    data = directData
                } else if (directError) {
                    // Fallback to RPC for guest access (bypasses RLS safely if configured)
                    console.log('Direct fetch failed, trying RPC...', directError.message)
                    const { data: rpcData, error: rpcError } = await supabase
                        .rpc('get_order_summary', { p_order_id: orderId })
                        .single()

                    if (rpcData) {
                        data = rpcData
                    } else if (rpcError) {
                        console.error('RPC fetch failed:', rpcError)
                    }
                }
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

    if (loading) return <div className={styles.container}>{dict.loading_order_details}</div>

    const paymentMethods = [
        { name: 'bKash', number: '01997118118', color: '#d1396a', type: dict.personal },
        { name: 'Nagad', number: '01997118118', color: '#e2432d', type: dict.personal },
        { name: 'Rocket', number: '01997118118', color: '#8c3494', type: dict.personal },
    ]

    return (
        <main className={styles.container}>
            {/* Success Header */}
            <div className={styles.successBanner}>
                <CheckCircle size={48} className={styles.successIcon} />
                <div>
                    <h1 className={styles.title}>{dict.order_placed_success}</h1>
                    <p className={styles.subtitle}>{dict.order_confirmed_desc}</p>
                </div>
            </div>

            <div className={styles.content}>
                {/* Order Info Card */}
                {order && (
                    <div className={styles.orderCard}>
                        <h2 className={styles.cardTitle}>{dict.order_details}</h2>
                        <div className={styles.orderInfo}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>{dict.order_id}</span>
                                <span className={styles.infoValue}>{order.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>{dict.order_date}</span>
                                <span className={styles.infoValue}>
                                    {new Date(order.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>{dict.status}</span>
                                <span className={styles.statusPending}>{dict.pending_payment}</span>
                            </div>
                            <div className={styles.totalRow}>
                                <span>{dict.total_amount}</span>
                                <span className={styles.totalAmount}>৳{order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Instructions */}
                <div className={styles.paymentSection}>
                    <div className={styles.sectionHeader}>
                        <CreditCard size={24} />
                        <h2 className={styles.sectionTitle}>{dict.payment_methods}</h2>
                    </div>
                    <p className={styles.instructions}>
                        {dict.send_money_instruction}
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
                                        {copied === method.name ? dict.copied : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Steps */}
                    <div className={styles.steps}>
                        <h3 className={styles.stepsTitle}>{dict.how_to_complete}</h3>
                        <ol className={styles.stepsList}>
                            <li>{dict.step_1_open}</li>
                            <li>{dict.step_2_select}</li>
                            <li>{dict.step_3_enter} <strong>৳{order?.total_amount.toLocaleString()}</strong></li>
                            <li>{dict.step_4_complete}</li>
                            <li>{dict.step_5_upload}</li>
                        </ol>
                    </div>

                    {/* Important Note */}
                    <div className={styles.alertBox}>
                        <AlertCircle size={20} className={styles.alertIcon} />
                        <div>
                            <strong>{dict.important_note}</strong> {dict.upload_within_24h}
                        </div>
                    </div>
                </div>

                {/* Upload Button */}
                <Link
                    href={orderId || order?.id ? `/${lang}/upload-proof?order_id=${orderId || order?.id}` : `/${lang}/my-orders`}
                    className={styles.uploadBtn}
                >
                    {dict.upload_payment_proof} <ArrowRight size={20} />
                </Link>
            </div>
        </main>
    )
}

export default function PaymentInstructionsPage() {
    const { dict } = useClientDictionary()

    return (
        <Suspense fallback={<div className={styles.container}>{dict?.loading || 'Loading...'}</div>}>
            <PaymentInstructionsContent />
        </Suspense>
    )
}
