'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from './upload-proof.module.css'
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useClientDictionary } from '@/hooks/useClientDictionary'

function UploadProofContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { dict, lang } = useClientDictionary()
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
                    setError(dict.could_not_fetch_order)
                    return
                }

                if (data) {
                    const email = (data as { user_email: string }).user_email
                    setOrderEmail(email)
                }
            } catch (err: any) {
                console.error('[Upload Proof] Error fetching order:', err)
                setError(dict.could_not_fetch_order)
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
                setError(dict.only_jpg_png)
                return
            }

            // Validate Size (e.g., 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError(dict.file_size_limit)
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
            setError(dict.fill_required_fields)
            return
        }

        if (!orderEmail) {
            setError(dict.could_not_determine_email)
            return
        }

        // IMPORTANT: Must use orderEmail for RLS compliance
        // The RLS policy checks: orders.user_email = payment_proofs.user_email
        const finalEmail = orderEmail

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
            // D. Success Redirect
            // If user is logged in, my-orders. If guest, back to payment instructions (which will show status)
            if (user) {
                router.push(`/${lang}/my-orders`)
            } else {
                router.push(`/${lang}/payment-instructions?order_id=${orderId}`)
            }

        } catch (err: any) {
            console.error('[Upload Proof] Submit error:', err)
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading || authLoading) {
        return <div className={styles.container}><div className={styles.loading}>{dict.loading}</div></div>
    }

    if (!orderId) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <AlertCircle size={24} />
                    <p>{dict.no_order_id}</p>
                </div>
            </div>
        )
    }

    if (!orderEmail) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <AlertCircle size={24} />
                    <p>{dict.could_not_fetch_order}</p>
                </div>
            </div>
        )
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{dict.upload_proof_title}</h1>
                <p className={styles.subtitle}>{dict.upload_proof_subtitle}</p>
            </div>

            <div className={styles.card}>
                <form onSubmit={handleSubmit} className={styles.form}>

                    {/* Order ID (Read Only) */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>{dict.order_id}</label>
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
                            {dict.email_from_order}
                            <span className={styles.emailBadge}> {dict.email_locked_badge}</span>
                        </label>
                        <input
                            type="email"
                            value={orderEmail}
                            readOnly
                            className={`${styles.input} ${styles.readOnly}`}
                        />
                        <p className={styles.hint}>
                            {dict.email_locked_hint}
                        </p>
                    </div>

                    {/* Transaction ID */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>{dict.transaction_id_label}</label>
                        <input
                            type="text"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className={styles.input}
                            placeholder={dict.transaction_id_placeholder}
                            required
                        />
                    </div>

                    {/* File Upload */}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>{dict.payment_screenshot_label}</label>
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
                                    <span>{dict.click_to_upload}</span>
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
                                <Loader2 size={20} className="animate-spin" /> {dict.uploading}
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} /> {dict.submit_proof_btn}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </main>
    )
}

export default function UploadProofPage() {
    return (
        <Suspense fallback={<div className={styles.container}><div className={styles.loading}>Loading...</div></div>}>
            <UploadProofContent />
        </Suspense>
    )
}
