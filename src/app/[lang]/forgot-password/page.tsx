'use client'

import styles from './forgot-password.module.css'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
    const params = useParams()
    const lang = params.lang as string || 'en'
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/${lang}/auth/callback?type=recovery&next=/${lang}/reset-password`
            })

            if (error) throw error

            setSuccess(true)
        } catch (err: any) {
            console.error('Password reset error:', err)
            setError(err.message || 'Failed to send reset email. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <main className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.successState}>
                        <CheckCircle size={56} className={styles.successIcon} />
                        <h2>Check Your Email</h2>
                        <p>
                            We've sent a password reset link to <strong>{email}</strong>.
                            <br />
                            Click the link in the email to set a new password.
                        </p>
                        <p className={styles.hint}>
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <Link href={`/${lang}/login`} className={styles.backLink}>
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Mail size={28} />
                    </div>
                    <h1>Forgot Password?</h1>
                    <p>No worries! Enter your email and we'll send you a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.errorAlert}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.primaryBtn}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className={styles.spinner} />
                                Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>

                <Link href={`/${lang}/login`} className={styles.backLink}>
                    <ArrowLeft size={16} /> Back to Login
                </Link>
            </div>
        </main>
    )
}
