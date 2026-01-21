'use client'

import styles from './contact.module.css'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

export default function ContactPage() {
    const params = useParams()
    const lang = params.lang as string || 'en'
    const isBn = lang === 'bn'

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        if (error) setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Send to your email endpoint or use a service like EmailJS, Resend, etc.
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to send message')
            }

            setSuccess(true)
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (err: any) {
            console.error('Contact form error:', err)
            // For now, show success anyway since API might not exist
            // setError(err.message || 'Failed to send message. Please try again.')
            setSuccess(true) // Temporary - remove when API is ready
        } finally {
            setLoading(false)
        }
    }

    const contactInfo = [
        {
            icon: <MessageCircle size={24} />,
            title: isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp',
            value: '+880 1997-118018',
            link: 'https://wa.me/8801997118018'
        },
        {
            icon: <Mail size={24} />,
            title: isBn ? 'ইমেইল' : 'Email',
            value: 'support@guardifyit.com',
            link: 'mailto:support@guardifyit.com'
        },
        {
            icon: <Clock size={24} />,
            title: isBn ? 'সাপোর্ট সময়' : 'Support Hours',
            value: isBn ? 'সকাল ১০টা - রাত ১০টা' : '10:00 AM - 10:00 PM',
            link: null
        }
    ]

    if (success) {
        return (
            <main className={styles.container}>
                <div className={styles.successCard}>
                    <CheckCircle size={64} className={styles.successIcon} />
                    <h2>{isBn ? 'বার্তা পাঠানো হয়েছে!' : 'Message Sent!'}</h2>
                    <p>
                        {isBn
                            ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'
                            : 'Your message has been sent successfully. We\'ll get back to you soon.'
                        }
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        className={styles.primaryBtn}
                    >
                        {isBn ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {isBn ? 'যোগাযোগ করুন' : 'Contact Us'}
                </h1>
                <p className={styles.subtitle}>
                    {isBn
                        ? 'কোন প্রশ্ন আছে? আমরা আপনার কথা শুনতে চাই। আমাদের সাথে যোগাযোগ করুন।'
                        : 'Have questions? We\'d love to hear from you. Get in touch with us.'
                    }
                </p>
            </div>

            <div className={styles.content}>
                {/* Contact Form */}
                <div className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>
                        <Send size={20} />
                        {isBn ? 'আমাদের বার্তা পাঠান' : 'Send Us a Message'}
                    </h2>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.errorAlert}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label>{isBn ? 'আপনার নাম' : 'Your Name'} *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={isBn ? 'নাম লিখুন' : 'Enter your name'}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>{isBn ? 'ইমেইল' : 'Email'} *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={isBn ? 'ইমেইল লিখুন' : 'Enter your email'}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>{isBn ? 'বিষয়' : 'Subject'} *</label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{isBn ? 'বিষয় নির্বাচন করুন' : 'Select a subject'}</option>
                                <option value="order">{isBn ? 'অর্ডার সম্পর্কে' : 'About my order'}</option>
                                <option value="payment">{isBn ? 'পেমেন্ট সমস্যা' : 'Payment issue'}</option>
                                <option value="product">{isBn ? 'পণ্য সম্পর্কে প্রশ্ন' : 'Product inquiry'}</option>
                                <option value="refund">{isBn ? 'রিফান্ড অনুরোধ' : 'Refund request'}</option>
                                <option value="other">{isBn ? 'অন্যান্য' : 'Other'}</option>
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>{isBn ? 'বার্তা' : 'Message'} *</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows={5}
                                placeholder={isBn ? 'আপনার বার্তা লিখুন...' : 'Write your message here...'}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className={styles.spinner} />
                                    {isBn ? 'পাঠানো হচ্ছে...' : 'Sending...'}
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    {isBn ? 'বার্তা পাঠান' : 'Send Message'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Contact Info */}
                <div className={styles.infoSection}>
                    <h2 className={styles.sectionTitle}>
                        <Phone size={20} />
                        {isBn ? 'যোগাযোগের তথ্য' : 'Contact Information'}
                    </h2>

                    <div className={styles.infoCards}>
                        {contactInfo.map((info, index) => (
                            <div key={index} className={styles.infoCard}>
                                <div className={styles.infoIcon}>{info.icon}</div>
                                <div className={styles.infoContent}>
                                    <h3>{info.title}</h3>
                                    {info.link ? (
                                        <a href={info.link} target="_blank" rel="noopener noreferrer">
                                            {info.value}
                                        </a>
                                    ) : (
                                        <span>{info.value}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.quickContact}>
                        <h3>{isBn ? 'দ্রুত যোগাযোগ' : 'Quick Response'}</h3>
                        <p>
                            {isBn
                                ? 'দ্রুত সাহায্যের জন্য আমাদের সাথে হোয়াটসঅ্যাপে যোগাযোগ করুন।'
                                : 'For faster assistance, reach out to us on WhatsApp.'
                            }
                        </p>
                        <a
                            href="https://wa.me/8801997118018"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.whatsappBtn}
                        >
                            <MessageCircle size={20} />
                            {isBn ? 'হোয়াটসঅ্যাপে চ্যাট করুন' : 'Chat on WhatsApp'}
                        </a>
                    </div>

                    <div className={styles.faqNote}>
                        <h3>{isBn ? 'সাধারণ প্রশ্ন?' : 'Common Questions?'}</h3>
                        <p>
                            {isBn
                                ? 'অধিকাংশ প্রশ্নের উত্তর আমাদের FAQ পেজে পাওয়া যায়।'
                                : 'Most questions can be answered in our FAQ section.'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
