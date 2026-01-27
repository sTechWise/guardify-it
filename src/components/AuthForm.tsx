'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './auth-form.module.css'
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/utils/supabase/client'

interface AuthFormProps {
    lang: string;
    dict: any;
}

export default function AuthForm({ lang, dict }: AuthFormProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { signIn, signUp, linkGuestOrders } = useAuth()
    const supabase = createClient()

    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    })

    // Safety Net: If user lands here with recovery intent (server redirect fail), send them to reset-password
    useEffect(() => {
        const type = searchParams.get('type')
        // Check hash for implicit flow tokens
        const hasHashRecovery = typeof window !== 'undefined' &&
            window.location.hash &&
            window.location.hash.includes('type=recovery')

        if (type === 'recovery' || hasHashRecovery) {
            console.log('[AuthForm] Detected recovery flow, redirecting to reset-password...')
            router.replace(`/${lang}/reset-password${window.location.search}${window.location.hash}`)
        }
    }, [searchParams, lang, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            if (isLogin) {
                // Login flow
                const { error } = await signIn(formData.email, formData.password)

                if (error) {
                    // Check if user exists but was created via guest checkout
                    if (error.message?.includes('Invalid login credentials')) {
                        setError(dict.invalid_credentials || 'Invalid email or password. If you checked out as a guest, please sign up to create a password.')
                    } else {
                        setError(error.message)
                    }
                    return
                }

                // Link any guest orders to this user
                await linkGuestOrders()

                // Redirect to my-orders on success
                router.push(`/${lang}/my-orders`)
                router.refresh()

            } else {
                // Signup flow
                const { error } = await signUp(formData.email, formData.password, formData.name)

                if (error) {
                    // Handle user already exists (from guest checkout)
                    if (error.message?.includes('already registered') || error.message?.includes('already been registered')) {
                        // Automatically send password reset email
                        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                            formData.email,
                            {
                                redirectTo: `${window.location.origin}/${lang}/auth/callback?type=recovery&next=/${lang}/reset-password`
                            }
                        )

                        if (resetError) {
                            setError('Failed to send password reset email. Please try again.')
                        } else {
                            setSuccessMessage(
                                dict.password_reset_sent ||
                                'This email was used for a previous order. We\'ve sent you a link to set your password. Check your email!'
                            )
                            setIsLogin(true) // Switch to login mode
                        }
                        return
                    } else {
                        setError(error.message)
                    }
                    return
                }

                // Show success message about email confirmation
                setSuccessMessage(dict.check_email_confirmation || 'Check your email to confirm your account. Once confirmed, you\'ll be able to see your orders.')
                setFormData({ email: '', password: '', name: '' })
            }
        } catch (err: any) {
            console.error('Auth error:', err)
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        // Clear errors when user starts typing
        if (error) setError(null)
        if (successMessage) setSuccessMessage(null)
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{isLogin ? dict.welcome_back : dict.create_account}</h1>
                    <p className={styles.subtitle}>
                        {isLogin ? dict.sign_in_subtitle : dict.sign_up_subtitle}
                    </p>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className={styles.successMessage}>
                        {successMessage}
                    </div>
                )}

                {/* Guest Checkout Info Box */}
                {isLogin && (
                    <div className={styles.guestInfoBox}>
                        <strong>🛒 {dict.guest_info_title || 'Purchased as a guest?'}</strong>
                        <p>{dict.guest_info_text || 'If you previously checked out without an account, use "Forgot password?" below to set your password and access your orders.'}</p>
                    </div>
                )}



                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLogin && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="name" className={styles.label}>
                                <User size={18} />
                                {dict.full_name}
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder={dict.enter_full_name}
                                required={!isLogin}
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            <Mail size={18} />
                            {dict.email_address}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder={dict.email_placeholder}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            <Lock size={18} />
                            {dict.password}
                        </label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder={dict.enter_password}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.togglePassword}
                                aria-label="Toggle password visibility"
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {isLogin && (
                        <div className={styles.forgotPassword}>
                            <Link href={`/${lang}/forgot-password`}>{dict.forgot_password}</Link>
                        </div>
                    )}

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 size={20} className={styles.spinner} />
                                {isLogin ? 'Signing in...' : 'Creating account...'}
                            </>
                        ) : (
                            isLogin ? dict.sign_in : dict.create_account
                        )}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span>{dict.or}</span>
                </div>

                <div className={styles.toggle}>
                    <p>
                        {isLogin ? dict.dont_have_account : dict.already_have_account}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setError(null)
                                setSuccessMessage(null)
                            }}
                            className={styles.toggleButton}
                            disabled={loading}
                        >
                            {isLogin ? dict.sign_up : dict.sign_in}
                        </button>
                    </p>
                </div>

                <div className={styles.guestCheckout}>
                    <p className={styles.guestText}>
                        {dict.guest_checkout_text} <Link href={`/${lang}/products`}>{dict.browse_products_link}</Link> {dict.without_account}
                    </p>
                </div>
            </div>
        </div>
    )
}
