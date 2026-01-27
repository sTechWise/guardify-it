'use client'

import styles from './my-orders.module.css'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Package, ShoppingBag, Upload, Eye, LogIn, Loader2, CheckCircle, X, Image as ImageIcon, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useClientDictionary } from '@/hooks/useClientDictionary'

interface PaymentProof {
    id: string
    screenshot_url: string
    transaction_id: string
    status: string
    submitted_at: string
}

interface Order {
    id: string
    user_email: string
    user_id: string | null
    total_amount: number
    status: string
    created_at: string
    payment_proofs: PaymentProof[] | null
}

export default function MyOrdersPage() {
    const { user, loading: authLoading } = useAuth()
    const { dict, lang } = useClientDictionary()
    const supabase = createClient()

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                setLoading(false)
            } else {
                checkAdminStatus()
                fetchOrders()
            }
        }
    }, [user, authLoading])

    async function checkAdminStatus() {
        if (!user) return
        const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')

        setIsAdmin(!!(roles && roles.length > 0))
    }

    async function fetchOrders() {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    payment_proofs (
                        id,
                        screenshot_url,
                        transaction_id,
                        status,
                        submitted_at
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching orders:', error)
                setOrders([])
            } else {
                setOrders(data || [])
            }
        } catch (err) {
            console.error('Error:', err)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string | null) => {
        if (!status) return { label: dict.pending_payment_status, className: styles.statusPending }
        const statusMap: Record<string, { label: string; className: string }> = {
            'pending_payment': { label: dict.pending_payment_status, className: styles.statusPending },
            'payment_submitted': { label: dict.payment_submitted, className: styles.statusSubmitted },
            'paid': { label: dict.payment_verified, className: styles.statusApproved },
            'payment_failed': { label: dict.payment_rejected, className: styles.statusRejected },
            'approved': { label: dict.verified, className: styles.statusApproved },
            'rejected': { label: dict.rejected, className: styles.statusRejected },
            'completed': { label: dict.completed, className: styles.statusApproved },
        }
        return statusMap[status] || { label: status.replace('_', ' '), className: styles.statusPending }
    }

    const hasProof = (order: Order) => {
        return order.payment_proofs && order.payment_proofs.length > 0
    }

    const getProof = (order: Order): PaymentProof | null => {
        if (order.payment_proofs && order.payment_proofs.length > 0) {
            return order.payment_proofs[0]
        }
        return null
    }

    // Check if order belongs to current user
    const isOwnOrder = (order: Order): boolean => {
        if (!user) return false
        return order.user_id === user.id || order.user_email === user.email
    }

    if (authLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <Loader2 size={24} className={styles.spinner} />
                    {dict.loading_orders}
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <main className={styles.container}>
                <div className={styles.emptyState}>
                    <LogIn size={64} className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>{dict.sign_in_to_view}</h2>
                    <p className={styles.emptyText}>
                        {dict.sign_in_to_view_desc}
                    </p>
                    <Link href={`/${lang}/login`} className={styles.shopBtn}>
                        <LogIn size={20} />
                        {dict.sign_in_signup}
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{dict.my_orders}</h1>
                    <p className={styles.subtitle}>{dict.track_manage_orders}</p>
                </div>
                {isAdmin && (
                    <span className={styles.adminBadge}>
                        <ShieldCheck size={16} />
                        {dict.admin_view}
                    </span>
                )}
            </div>

            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <Package size={64} className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>{dict.no_orders_yet}</h2>
                    <p className={styles.emptyText}>{dict.start_shopping}</p>
                    <Link href={`/${lang}/products`} className={styles.shopBtn}>
                        <ShoppingBag size={20} />
                        {dict.browse_products}
                    </Link>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>{dict.order_id}</th>
                                <th>{dict.date}</th>
                                <th>{dict.amount}</th>
                                <th>{dict.status}</th>
                                <th>{dict.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const status = getStatusBadge(order.status)
                                const proof = getProof(order)
                                const proofExists = hasProof(order)
                                const isOwn = isOwnOrder(order)
                                const showUploadBtn = isOwn && order.status === 'pending_payment' && !proofExists

                                return (
                                    <tr key={order.id} className={!isOwn && isAdmin ? styles.customerOrder : ''}>
                                        <td data-label={dict.order_id}>
                                            <div className={styles.orderIdCell}>
                                                <span className={styles.orderId}>
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                                {/* Ownership badge */}
                                                {isAdmin && (
                                                    isOwn ? (
                                                        <span className={styles.ownerBadge}>{dict.your_order}</span>
                                                    ) : (
                                                        <span className={styles.customerBadge}>{dict.customer}</span>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                        <td data-label={dict.date}>
                                            {new Date(order.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td data-label={dict.amount}>
                                            <span className={styles.amount}>৳{order.total_amount.toLocaleString()}</span>
                                        </td>
                                        <td data-label={dict.status}>
                                            <span className={`${styles.statusBadge} ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td data-label={dict.actions}>
                                            <div className={styles.actions}>
                                                {/* Upload Proof - only for own orders */}
                                                {showUploadBtn && (
                                                    <Link href={`/${lang}/upload-proof?order_id=${order.id}`} className={styles.actionBtn}>
                                                        <Upload size={16} />
                                                        {dict.upload_proof}
                                                    </Link>
                                                )}

                                                {/* Proof Uploaded badge */}
                                                {proofExists && (
                                                    <span className={styles.proofBadge}>
                                                        <CheckCircle size={14} />
                                                        {dict.proof_uploaded}
                                                    </span>
                                                )}

                                                {/* View Proof button */}
                                                {proofExists && proof && (
                                                    <button
                                                        className={`${styles.actionBtn} ${styles.secondary}`}
                                                        onClick={() => setSelectedProof(proof)}
                                                    >
                                                        <Eye size={16} />
                                                        {dict.view}
                                                    </button>
                                                )}

                                                {/* Admin: Link to admin panel for customer orders */}
                                                {isAdmin && !isOwn && !proofExists && order.status === 'pending_payment' && (
                                                    <span className={styles.waitingBadge}>{dict.awaiting_payment}</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Proof Modal */}
            {selectedProof && (
                <div className={styles.modalOverlay} onClick={() => setSelectedProof(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{dict.payment_proof}</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setSelectedProof(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.proofDetails}>
                                <p><strong>{dict.transaction_id}:</strong> {selectedProof.transaction_id}</p>
                                <p><strong>{dict.submitted}:</strong> {new Date(selectedProof.submitted_at).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}</p>
                                <p><strong>{dict.status}:</strong> {selectedProof.status}</p>
                            </div>
                            {selectedProof.screenshot_url ? (
                                <PaymentProofImage url={selectedProof.screenshot_url} />
                            ) : (
                                <div className={styles.noProofImage}>
                                    <ImageIcon size={48} />
                                    <p>{dict.no_screenshot}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

function PaymentProofImage({ url }: { url: string }) {
    const [signedUrl, setSignedUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function getSignedUrl() {
            try {
                // Extract path from public URL
                // Format: .../storage/v1/object/public/payment-proofs/filename.ext
                const parts = url.split('/payment-proofs/')
                if (parts.length < 2) {
                    setSignedUrl(url) // Fallback
                    return
                }
                const path = parts[1]

                const { data, error } = await supabase.storage
                    .from('payment-proofs')
                    .createSignedUrl(path, 3600) // 1 hour expiry

                if (data?.signedUrl) {
                    setSignedUrl(data.signedUrl)
                } else {
                    console.error('Error signing URL:', error)
                    setSignedUrl(url)
                }
            } catch (e) {
                setSignedUrl(url)
            } finally {
                setLoading(false)
            }
        }
        getSignedUrl()
    }, [url])

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className={styles.proofImageWrapper}>
            <img
                src={signedUrl || url}
                alt="Payment Proof"
                className={styles.proofImage}
            />
        </div>
    )
}
