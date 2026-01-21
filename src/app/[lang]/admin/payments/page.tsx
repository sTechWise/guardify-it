'use client'

import styles from './admin-payments.module.css'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { CheckCircle, XCircle, Eye, X, Loader2, Clock, AlertCircle, CreditCard } from 'lucide-react'

interface PaymentProof {
    id: string
    order_id: string
    user_email: string
    transaction_id: string
    screenshot_url: string
    status: string
    submitted_at: string
    orders: {
        id: string
        user_email: string
        total_amount: number
        status: string
        created_at: string
    }
}

export default function AdminPaymentsPage() {
    const params = useParams()
    const lang = params.lang as string || 'en'
    const { showToast } = useToast()
    const supabase = createClient()

    const [proofs, setProofs] = useState<PaymentProof[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null)
    const [filter, setFilter] = useState<'pending' | 'all'>('pending')

    useEffect(() => {
        fetchProofs()
    }, [filter])

    async function fetchProofs() {
        setLoading(true)

        let query = supabase
            .from('payment_proofs')
            .select(`
                *,
                orders (
                    id,
                    user_email,
                    total_amount,
                    status,
                    created_at
                )
            `)
            .order('submitted_at', { ascending: false })

        if (filter === 'pending') {
            query = query.in('status', ['submitted', 'pending'])
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching proofs:', error)
            showToast('Failed to load payment proofs', 'error')
        } else {
            setProofs(data || [])
        }
        setLoading(false)
    }

    async function handleApproveReject(proofId: string, orderId: string, newStatus: 'approved' | 'rejected') {
        console.log('handleApproveReject called:', { proofId, orderId, newStatus })

        setProcessingId(proofId)
        showToast(`Processing ${newStatus}...`, 'info')

        try {
            // Update payment proof status directly
            console.log('Updating payment proof...')
            const { error: proofError } = await supabase
                .from('payment_proofs')
                .update({ status: newStatus })
                .eq('id', proofId)

            if (proofError) {
                console.error('Proof error:', proofError)
                throw new Error(`Failed to update proof: ${proofError.message}`)
            }
            console.log('Payment proof updated successfully')

            // Update order status based on approval
            const newOrderStatus = newStatus === 'approved' ? 'paid' : 'payment_failed'
            console.log('Updating order to:', newOrderStatus)
            const { error: orderError } = await supabase
                .from('orders')
                .update({ status: newOrderStatus })
                .eq('id', orderId)

            if (orderError) {
                console.error('Order error:', orderError)
                throw new Error(`Failed to update order: ${orderError.message}`)
            }
            console.log('Order updated successfully')

            showToast(
                `Payment ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`,
                'success'
            )

            // Refresh the list
            fetchProofs()
        } catch (err: any) {
            console.error('Error:', err)
            showToast(err.message || 'Operation failed', 'error')
        } finally {
            setProcessingId(null)
        }
    }

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
            'submitted': { label: 'Pending Review', className: styles.statusPending, icon: <Clock size={14} /> },
            'pending': { label: 'Pending Review', className: styles.statusPending, icon: <Clock size={14} /> },
            'approved': { label: 'Approved', className: styles.statusApproved, icon: <CheckCircle size={14} /> },
            'rejected': { label: 'Rejected', className: styles.statusRejected, icon: <XCircle size={14} /> },
        }
        return map[status] || { label: status, className: styles.statusPending, icon: <AlertCircle size={14} /> }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.titleRow}>
                        <CreditCard size={28} className={styles.titleIcon} />
                        <h1 className={styles.title}>Payment Verification</h1>
                    </div>
                    <p className={styles.subtitle}>Review and verify customer payment proofs</p>
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
                        All Proofs
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <Loader2 size={24} className={styles.spinner} />
                    Loading payment proofs...
                </div>
            ) : proofs.length === 0 ? (
                <div className={styles.emptyState}>
                    <CheckCircle size={48} className={styles.emptyIcon} />
                    <h2>No pending proofs</h2>
                    <p>All payment proofs have been reviewed</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {proofs.map(proof => {
                        const status = getStatusBadge(proof.status)
                        const isPending = proof.status === 'submitted' || proof.status === 'pending'
                        const isProcessing = processingId === proof.id

                        return (
                            <div key={proof.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <span className={styles.orderId}>
                                            Order #{proof.order_id.slice(0, 8).toUpperCase()}
                                        </span>
                                        <span className={`${styles.statusBadge} ${status.className}`}>
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </div>
                                    <span className={styles.amount}>
                                        ৳{proof.orders?.total_amount?.toLocaleString() || '0'}
                                    </span>
                                </div>

                                <div className={styles.cardBody}>
                                    <div className={styles.proofPreview}>
                                        {proof.screenshot_url ? (
                                            <img
                                                src={proof.screenshot_url}
                                                alt="Payment proof"
                                                onClick={() => setSelectedProof(proof)}
                                            />
                                        ) : (
                                            <div className={styles.noImage}>No screenshot</div>
                                        )}
                                    </div>
                                    <div className={styles.proofDetails}>
                                        <p><strong>Email:</strong> {proof.user_email || proof.orders?.user_email}</p>
                                        <p><strong>Transaction:</strong> {proof.transaction_id || 'N/A'}</p>
                                        <p><strong>Submitted:</strong> {new Date(proof.submitted_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.viewBtn}
                                        onClick={() => setSelectedProof(proof)}
                                    >
                                        <Eye size={16} />
                                        View Full
                                    </button>

                                    {isPending && (
                                        <>
                                            <button
                                                className={styles.approveBtn}
                                                onClick={() => handleApproveReject(proof.id, proof.order_id, 'approved')}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? <Loader2 size={16} className={styles.spinner} /> : <CheckCircle size={16} />}
                                                Approve
                                            </button>
                                            <button
                                                className={styles.rejectBtn}
                                                onClick={() => handleApproveReject(proof.id, proof.order_id, 'rejected')}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? <Loader2 size={16} className={styles.spinner} /> : <XCircle size={16} />}
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* View Proof Modal */}
            {selectedProof && (
                <div className={styles.modalOverlay} onClick={() => setSelectedProof(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Payment Proof - Order #{selectedProof.order_id.slice(0, 8).toUpperCase()}</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedProof(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalDetails}>
                                <p><strong>Email:</strong> {selectedProof.user_email || selectedProof.orders?.user_email}</p>
                                <p><strong>Transaction ID:</strong> {selectedProof.transaction_id || 'N/A'}</p>
                                <p><strong>Amount:</strong> ৳{selectedProof.orders?.total_amount?.toLocaleString()}</p>
                                <p><strong>Submitted:</strong> {new Date(selectedProof.submitted_at).toLocaleString()}</p>
                                <p><strong>Status:</strong> {selectedProof.status}</p>
                            </div>
                            {selectedProof.screenshot_url && (
                                <div className={styles.modalImage}>
                                    <img src={selectedProof.screenshot_url} alt="Payment proof" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
