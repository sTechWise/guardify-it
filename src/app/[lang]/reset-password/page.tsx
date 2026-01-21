'use client'

import styles from './reset-password.module.css'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { Lock, Eye, EyeOff, CheckCircle, Loader2, AlertCircle, Shield } from 'lucide-react'

export default function ResetPasswordPage() {
    const router = useRouter()
    const params = useParams()
    const lang = params.lang as string || 'en'
    const { showToast } = useToast()
    const supabase = createClient()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasSession, setHasSession] = useState(false)

    // Check for recovery session on mount
    const checkSession = useCallback(async () => {
        try {
            // First check if there's already a valid session
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                console.log('[Reset Password] Session found')
                setHasSession(true)
                setChecking(false)
                return
            }

            // Check for hash fragments (Supabase recovery links - legacy flow)
            if (typeof window !== 'undefined' && window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1))
                const accessToken = hashParams.get('access_token')
                const refreshToken = hashParams.get('refresh_token')
                const type = hashParams.get('type')

                if (accessToken && type === 'recovery') {
                    console.log('[Reset Password] Found hash tokens, setting session')
                    const { error: setError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || ''
                    })

                    if (!setError) {
                        setHasSession(true)
                        // Clear the hash from URL for cleaner appearance
                        window.history.replaceState(null, '', window.location.pathname)
                    }
                }
            }
        } catch (err) {
            console.error('Session check error:', err)
        } finally {
            setChecking(false)
        }
    }, [supabase])

    useEffect(() => {
        // Listen for auth state changes (handles PKCE callback flow)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[Reset Password] Auth state change:', event)
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'PASSWORD_RECOVERY') {
                if (session) {
                    setHasSession(true)
                    setChecking(false)
                }
            }
        })

        // Small delay to ensure page is ready, then check session
        const timer = setTimeout(() => {
            checkSession()
        }, 100)

        // Also retry after a longer delay in case callback is still processing
        const retryTimer = setTimeout(() => {
            if (!hasSession) {
                console.log('[Reset Password] Retrying session check...')
                checkSession()
            }
        }, 1500)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timer)
            clearTimeout(retryTimer)
        }
    }, [checkSession, hasSession, supabase.auth])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            showToast('Password updated successfully!', 'success')

            setTimeout(() => {
                router.push(`/${lang}/my-orders`)
            }, 2000)

        } catch (err: any) {
            console.error('Password reset error:', err)
            setError(err.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    // Loading state
    if (checking) {
        return (
            <main className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.loadingState}>
                        <Loader2 size={40} className={styles.spinner} />
                        <h2>Verifying your link...</h2>
                        <p>Please wait while we validate your reset request</p>
                    </div>
                </div>
            </main>
        )
    }

    // No session - invalid or expired link
    if (!hasSession) {
        return (
            <main className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.errorState}>
                        <AlertCircle size={48} className={styles.errorIcon} />
                        <h2>Link Expired or Invalid</h2>
                        <p>This password reset link is no longer valid. Please request a new one.</p>
                        <button
                            onClick={() => router.push(`/${lang}/login`)}
                            className={styles.primaryBtn}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    // Success state
    if (success) {
        return (
            <main className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.successState}>
                        <CheckCircle size={56} className={styles.successIcon} />
                        <h2>Password Updated!</h2>
                        <p>Your password has been changed successfully.<br />Redirecting to your orders...</p>
                    </div>
                </div>
            </main>
        )
    }

    // Password reset form
    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Shield size={28} />
                    </div>
                    <h1>Set New Password</h1>
                    <p>Create a strong password for your Guardify IT account</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.errorAlert}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>New Password</label>
                        <div className={styles.passwordWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className={styles.togglePassword}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <span className={styles.hint}>Must be at least 6 characters</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <div className={styles.passwordWrapper}>
                            <Lock size={18} className={styles.inputIcon} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
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
                                Updating...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            </div>
        </main>
    )
}
