'use client'

import styles from './admin-orders.module.css'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { ShieldCheck, Package, Loader2, Eye, CheckCircle, XCircle, X, Image as ImageIcon, Clock, AlertCircle, DollarSign } from 'lucide-react'

interface PaymentProof {
    id: string
    order_id: string
    screenshot_url: string
    transaction_id: string
    status: string
    submitted_at: string
}

interface Order {
    id: string
    user_email: string
    total_amount: number
    status: string
    created_at: string
    payment_proofs: PaymentProof[] | null
}

export default function AdminOrdersPage() {
    const router = useRouter()
    const params = useParams()
    const lang = params.lang as string || 'en'
    const { showToast } = useToast()
    const supabase = createClient()

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [filter, setFilter] = useState<'pending' | 'all'>('pending')

    useEffect(() => {
        checkAdmin()
    }, [])

    useEffect(() => {
        if (isAdmin) {
            fetchOrders()
        }
    }, [filter, isAdmin])

    async function checkAdmin() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push(`/${lang}`)
            return
        }

        const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')

        if (!roles || roles.length === 0) {
            router.push(`/${lang}`)
            showToast('Access Denied', 'error')
        } else {
            setIsAdmin(true)
        }
    }

    async function fetchOrders() {
        setLoading(true)

        // Fetch orders
        let orderQuery = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (filter === 'pending') {
            orderQuery = orderQuery.in('status', ['payment_submitted'])
        }

        const { data: ordersData, error: ordersError } = await orderQuery

        if (ordersError) {
            console.error('Orders error:', ordersError)
            showToast('Failed to load orders', 'error')
            setLoading(false)
            return
        }

        // Fetch all payment proofs separately (RLS might block join)
        const { data: proofsData, error: proofsError } = await supabase
            .from('payment_proofs')
            .select('*')

        if (proofsError) {
            console.error('Proofs error:', proofsError)
        }

        // Merge proofs into orders
        const ordersWithProofs = (ordersData || []).map(order => {
            const orderProofs = (proofsData || []).filter(p => p.order_id === order.id)
            return {
                ...order,
                payment_proofs: orderProofs.length > 0 ? orderProofs : null
            }
        })

        setOrders(ordersWithProofs)
        setLoading(false)
    }

    async function handleApprove(proofId: string) {
        if (!confirm('Approve this payment? Order status will be updated to PAID.')) return

        setProcessingId(proofId)

        const { data, error } = await supabase.rpc('approve_payment_proof', {
            p_proof_id: proofId,
            p_new_status: 'approved'
        })

        if (error || (data && !data.success)) {
            showToast(data?.error || 'Approval failed', 'error')
        } else {
            showToast('Payment approved! Order marked as paid.', 'success')
            fetchOrders()
        }

        setProcessingId(null)
    }

    async function handleReject(proofId: string) {
        if (!confirm('Reject this payment? Customer will need to resubmit.')) return

        setProcessingId(proofId)

        const { data, error } = await supabase.rpc('approve_payment_proof', {
            p_proof_id: proofId,
            p_new_status: 'rejected'
        })

        if (error || (data && !data.success)) {
            showToast(data?.error || 'Rejection failed', 'error')
        } else {
            showToast('Payment rejected.', 'success')
            fetchOrders()
        }

        setProcessingId(null)
    }

    const getStatusBadge = (status: string | null) => {
        if (!status) return { label: 'Unknown', className: styles.statusPending, icon: <AlertCircle size={14} /> }
        const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'pending_payment': { label: 'Awaiting Payment', className: styles.statusPending, icon: <Clock size={14} /> },
            'payment_submitted': { label: 'Payment Submitted', className: styles.statusSubmitted, icon: <DollarSign size={14} /> },
            'paid': { label: 'Paid', className: styles.statusPaid, icon: <CheckCircle size={14} /> },
            'payment_failed': { label: 'Payment Failed', className: styles.statusFailed, icon: <XCircle size={14} /> },
            'approved': { label: 'Approved', className: styles.statusPaid, icon: <CheckCircle size={14} /> },
            'rejected': { label: 'Rejected', className: styles.statusFailed, icon: <XCircle size={14} /> },
            'completed': { label: 'Completed', className: styles.statusCompleted, icon: <CheckCircle size={14} /> },
        }
        return statusMap[status] || { label: status.replace(/_/g, ' '), className: styles.statusPending, icon: <AlertCircle size={14} /> }
    }

    const getProof = (order: Order): PaymentProof | null => {
        if (order.payment_proofs && order.payment_proofs.length > 0) {
            return order.payment_proofs[0]
        }
        return null
    }

    if (!isAdmin) {
        return (
            <main className={styles.container}>
                <div className={styles.loadingState}>
                    <Loader2 size={32} className={styles.spinner} />
                    <p>Checking permissions...</p>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.titleRow}>
                        <ShieldCheck size={28} className={styles.titleIcon} />
                        <h1 className={styles.title}>Order Verification</h1>
                    </div>
                    <p className={styles.subtitle}>Review and verify customer payment submissions</p>
                </div>
                <div className={styles.filterControls}>
                    <button
                        className={`${styles.filterBtn} ${filter === 'pending' ? styles.active : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending Review
                    </button>
                    <button
                        className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Orders
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingState}>
                    <Loader2 size={24} className={styles.spinner} />
                    <p>Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <Package size={48} className={styles.emptyIcon} />
                    <h2>{filter === 'pending' ? 'No pending orders' : 'No orders found'}</h2>
                    <p>{filter === 'pending' ? 'All payment submissions have been processed.' : 'Orders will appear here once customers place them.'}</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const status = getStatusBadge(order.status)
                                const proof = getProof(order)
                                const isProcessing = processingId === proof?.id

                                return (
                                    <tr key={order.id}>
                                        <td>
                                            <span className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
                                        </td>
                                        <td>
                                            <span className={styles.email}>{order.user_email}</span>
                                        </td>
                                        <td>
                                            <span className={styles.amount}>৳{order.total_amount.toLocaleString()}</span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${status.className}`}>
                                                {status.icon}
                                                {status.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.date}>
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                {proof && (
                                                    <button
                                                        className={styles.viewBtn}
                                                        onClick={() => setSelectedProof(proof)}
                                                    >
                                                        <Eye size={16} />
                                                        View Proof
                                                    </button>
                                                )}

                                                {!proof && order.status === 'pending_payment' && (
                                                    <span className={styles.noProofBadge}>No proof submitted</span>
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
                            <button className={styles.closeBtn} onClick={() => setSelectedProof(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.proofDetails}>
                                <p><strong>Transaction ID:</strong> {selectedProof.transaction_id}</p>
                                <p><strong>Submitted:</strong> {new Date(selectedProof.submitted_at).toLocaleString()}</p>
                                <p><strong>Status:</strong> <span className={`${styles.statusBadge} ${getStatusBadge(selectedProof.status).className}`}>
                                    {selectedProof.status}
                                </span></p>
                            </div>
                            {selectedProof.screenshot_url ? (
                                <PaymentProofImage url={selectedProof.screenshot_url} />
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
