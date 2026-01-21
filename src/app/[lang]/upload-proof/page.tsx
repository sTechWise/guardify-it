'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from './upload-proof.module.css'
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function UploadProofPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()
    const lang = params.lang as string || 'en'
    const orderId = searchParams.get('order_id')

    const { user, loading: authLoading } = useAuth()
    const supabase = createClient()

    // Form State
    const [orderEmail, setOrderEmail] = useState<string | null>(null) // Email from order (required for RLS)
    const [trxId, setTrxId] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // Status State
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // 1. Fetch Order Email (REQUIRED for RLS - cannot be changed)
    useEffect(() => {
        if (!orderId) {
            setLoading(false)
            return
        }

        async function fetchOrderEmail() {
            try {
                const { data, error } = await supabase
                    .rpc('get_order_summary', { p_order_id: orderId })
                    .single()

                if (error) {
                    console.error('[Upload Proof] RPC Error:', error)
                    setError('Could not fetch order details. Please try again.')
                    return
                }

                if (data) {
                    const email = (data as { user_email: string }).user_email
                    console.log('[Upload Proof] Order email:', email)
                    setOrderEmail(email)
                }
            } catch (err: any) {
                console.error('[Upload Proof] Error fetching order:', err)
                setError('Could not fetch order details. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchOrderEmail()
    }, [orderId])

    // 2. Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]

            // Validate Type
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selectedFile.type)) {
                setError('Only JPG and PNG files are allowed.')
                return
            }

            // Validate Size (e.g., 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB.')
                return
            }

            setFile(selectedFile)
            setPreviewUrl(URL.createObjectURL(selectedFile))
            setError(null)
        }
    }

    // 3. Handle Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!orderId || !file || !trxId) {
            setError('Please fill in all required fields.')
            return
        }

        if (!orderEmail) {
            setError('Could not determine order email. Please refresh and try again.')
            return
        }

        // IMPORTANT: Must use orderEmail for RLS compliance
        // The RLS policy checks: orders.user_email = payment_proofs.user_email
        const finalEmail = orderEmail

        console.log('[Upload Proof] Submitting with:', {
            order_id: orderId,
            user_email: finalEmail,
            transaction_id: trxId,
            auth_user: user?.email || 'not authenticated'
        })

        setSubmitting(true)
        setError(null)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${orderId}_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // A. Upload File
            const { error: uploadError } = await supabase.storage
                .from('payment-proofs')
                .upload(filePath, file)

            if (uploadError) throw new Error('Failed to upload image: ' + uploadError.message)

            // B. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(filePath)

            // C. Call transactional RPC to upsert proof + update order status
            const { data: rpcResult, error: rpcError } = await supabase
                .rpc('submit_payment_proof', {
                    p_order_id: orderId,
                    p_user_email: finalEmail,
                    p_transaction_id: trxId,
                    p_screenshot_url: publicUrl
                })

            if (rpcError) throw new Error('Failed to submit proof: ' + rpcError.message)

            // Check RPC result
            if (rpcResult && !rpcResult.success) {
                throw new Error(rpcResult.error || 'Failed to submit proof')
            }

            // D. Success Redirect to My Orders (proof is now linked)
            router.push(`/${lang}/my-orders`)

        } catch (err: any) {
            console.error('[Upload Proof] Submit error:', err)
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading || authLoading) {
        return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>
    }

    if (!orderId) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <AlertCircle size={24} />
                    <p>No Order ID provided. Please go back to your orders or checkout page.</p>
                </div>
            </div>
        )
    }

    if (!orderEmail) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <AlertCircle size={24} />
                    <p>Could not fetch order details. Please check the order ID and try again.</p>
                </div>
            </div>
        )
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Upload Payment Proof</h1>
                <p className={styles.subtitle}>Complete this step to activate your subscription quickly.</p>
            </div>

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>

                    {/* Order ID (Read Only) */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Order ID</label>
                        <input
                            type="text"
                            value={orderId}
                            readOnly
                            className={`${styles.input} ${styles.readOnly}`}
                        />
                    </div>

                    {/* Email Address (LOCKED - from order) */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>
                            <Lock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Email Address
                            <span className={styles.emailBadge}> (from order - cannot be changed)</span>
                        </label>
                        <input
                            type="email"
                            value={orderEmail}
                            readOnly
                            className={`${styles.input} ${styles.readOnly}`}
                        />
                        <p className={styles.hint}>
                            This email is linked to your order and cannot be changed for security reasons.
                        </p>
                    </div>

                    {/* Transaction ID */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Transaction ID *</label>
                        <input
                            type="text"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className={styles.input}
                            placeholder="e.g. 9H7G6F5D"
                            required
                        />
                    </div>

                    {/* File Upload */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Payment Screenshot * (JPG/PNG)</label>
                        <div className={styles.fileInputWrapper}>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleFileChange}
                                className={styles.fileInput}
                                required
                            />
                            {file ? (
                                <div className={styles.uploadPlaceholder}>
                                    <FileText size={32} className={styles.uploadIcon} />
                                    <span>{file.name}</span>
                                </div>
                            ) : (
                                <div className={styles.uploadPlaceholder}>
                                    <UploadCloud size={32} className={styles.uploadIcon} />
                                    <span>Click to upload image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview */}
                    {previewUrl && (
                        <div className={styles.preview}>
                            <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                        </div>
                    )}

                    {error && <div className={styles.error}>{error}</div>}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> Uploading...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} /> Submit Proof for Verification
                            </>
                        )}
                    </button>
                </form>
            </div>
        </main>
    )
}
