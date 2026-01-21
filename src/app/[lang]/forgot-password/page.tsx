'use client'

import styles from './forgot-password.module.css'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useClientDictionary } from '@/hooks/useClientDictionary'

export default function ForgotPasswordPage() {
    const { dict, lang } = useClientDictionary()
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
            setError(err.message || dict.failed_reset_email)
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
                        <h2>{dict.check_your_email}</h2>
                        <p>
                            {dict.reset_link_sent} <strong>{email}</strong>.
                            <br />
                            {dict.click_link_instruction}
                        </p>
                        <p className={styles.hint}>
                            {dict.check_spam}
                        </p>
                        <Link href={`/${lang}/login`} className={styles.backLink}>
                            <ArrowLeft size={16} /> {dict.back_to_login}
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
                    <h1>{dict.forgot_password_title}</h1>
                    <p>{dict.forgot_password_subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.errorAlert}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>{dict.email_address}</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={dict.email_placeholder}
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
                                {dict.sending}
                            </>
                        ) : (
                            dict.send_reset_link
                        )}
                    </button>
                </form>

                <Link href={`/${lang}/login`} className={styles.backLink}>
                    <ArrowLeft size={16} /> {dict.back_to_login}
                </Link>
            </div>
        </main>
    )
}
