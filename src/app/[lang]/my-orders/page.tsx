'use client'

import styles from './my-orders.module.css'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Package, ShoppingBag, Upload, Eye, LogIn, Loader2, CheckCircle, X, Image as ImageIcon, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

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
    const params = useParams()
    const lang = params.lang as string || 'en'
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

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            'pending_payment': { label: 'Pending Payment', className: styles.statusPending },
            'payment_submitted': { label: 'Payment Submitted', className: styles.statusSubmitted },
            'paid': { label: 'Payment Verified', className: styles.statusApproved },
            'payment_failed': { label: 'Payment Rejected', className: styles.statusRejected },
            'approved': { label: 'Verified', className: styles.statusApproved },
            'rejected': { label: 'Rejected', className: styles.statusRejected },
            'completed': { label: 'Completed', className: styles.statusApproved },
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
                    Loading orders...
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <main className={styles.container}>
                <div className={styles.emptyState}>
                    <LogIn size={64} className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>Sign in to view orders</h2>
                    <p className={styles.emptyText}>
                        Please sign in or create an account to view your orders.
                        If you checked out as a guest, your orders will appear after signing up with the same email.
                    </p>
                    <Link href={`/${lang}/login`} className={styles.shopBtn}>
                        <LogIn size={20} />
                        Sign In / Sign Up
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>My Orders</h1>
                    <p className={styles.subtitle}>Track and manage all your orders</p>
                </div>
                {isAdmin && (
                    <span className={styles.adminBadge}>
                        <ShieldCheck size={16} />
                        Admin View
                    </span>
                )}
            </div>

            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <Package size={64} className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>No orders yet</h2>
                    <p className={styles.emptyText}>Start shopping to see your orders here</p>
                    <Link href={`/${lang}/products`} className={styles.shopBtn}>
                        <ShoppingBag size={20} />
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
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
                                        <td data-label="Order ID">
                                            <div className={styles.orderIdCell}>
                                                <span className={styles.orderId}>
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                                {/* Ownership badge */}
                                                {isAdmin && (
                                                    isOwn ? (
                                                        <span className={styles.ownerBadge}>Your Order</span>
                                                    ) : (
                                                        <span className={styles.customerBadge}>Customer</span>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                        <td data-label="Date">
                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td data-label="Amount">
                                            <span className={styles.amount}>৳{order.total_amount.toLocaleString()}</span>
                                        </td>
                                        <td data-label="Status">
                                            <span className={`${styles.statusBadge} ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td data-label="Actions">
                                            <div className={styles.actions}>
                                                {/* Upload Proof - only for own orders */}
                                                {showUploadBtn && (
                                                    <Link href={`/${lang}/upload-proof?order_id=${order.id}`} className={styles.actionBtn}>
                                                        <Upload size={16} />
                                                        Upload Proof
                                                    </Link>
                                                )}

                                                {/* Proof Uploaded badge */}
                                                {proofExists && (
                                                    <span className={styles.proofBadge}>
                                                        <CheckCircle size={14} />
                                                        Proof Uploaded
                                                    </span>
                                                )}

                                                {/* View Proof button */}
                                                {proofExists && proof && (
                                                    <button
                                                        className={`${styles.actionBtn} ${styles.secondary}`}
                                                        onClick={() => setSelectedProof(proof)}
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </button>
                                                )}

                                                {/* Admin: Link to admin panel for customer orders */}
                                                {isAdmin && !isOwn && !proofExists && order.status === 'pending_payment' && (
                                                    <span className={styles.waitingBadge}>Awaiting Payment</span>
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
                            <h2>Payment Proof</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setSelectedProof(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.proofDetails}>
                                <p><strong>Transaction ID:</strong> {selectedProof.transaction_id}</p>
                                <p><strong>Submitted:</strong> {new Date(selectedProof.submitted_at).toLocaleString()}</p>
                                <p><strong>Status:</strong> {selectedProof.status}</p>
                            </div>
                            {selectedProof.screenshot_url ? (
                                <div className={styles.proofImageWrapper}>
                                    <img
                                        src={selectedProof.screenshot_url}
                                        alt="Payment Proof"
                                        className={styles.proofImage}
                                    />
                                </div>
                            ) : (
                                <div className={styles.noProofImage}>
                                    <ImageIcon size={48} />
                                    <p>No screenshot available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
