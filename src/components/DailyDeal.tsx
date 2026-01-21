'use client'

import { useState, useEffect } from 'react'
import styles from './daily-deal.module.css'
import { Zap } from 'lucide-react'

import { Locale } from '@/i18n-config'

type DailyDealProps = {
    lang: Locale
    dict: any
}

export default function DailyDeal({ lang, dict }: DailyDealProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    // ... (useEffect remains same) ...
    // Note: I will only replace the top part and render part, keeping effect logic if I use regex properly
    // But since I can't lookahead easily, I will just rewrite the file content that changed.
    // Wait, replacing the whole component body is safer.

    // Actually, I'll just replace the signature and the render return.
    // To do that safely without touching the effect line 15-38, I need multiple chunks or one big chunk.
    // I'll do one big chunk for the whole function.

    useEffect(() => {
        // Set target to tomorrow midnight
        const target = new Date()
        target.setHours(24, 0, 0, 0)

        const timer = setInterval(() => {
            const now = new Date()
            const diff = target.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            } else {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / 1000 / 60) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                })
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.info}>
                    <h2><Zap size={28} fill="#F59E0B" stroke="none" /> {lang === 'bn' ? 'আজকের মেগা ডিল' : "Today's Mega Deal"}</h2>
                    <p className={styles.subtext}>
                        {lang === 'bn'
                            ? 'চ্যাটজিপিটি প্লাস শেয়ার্ড অ্যাকাউন্টে সীমিত সময়ের অফার।'
                            : 'Limited time offer on ChatGPT Plus Shared Accounts.'}
                    </p>
                </div>

                <div className={styles.timer}>
                    <div className={styles.timeBlock}>
                        <span className={styles.number}>{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className={styles.label}>{dict?.days || 'Days'}</span>
                    </div>
                    <div className={styles.timeBlock}>
                        <span className={styles.number}>{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className={styles.label}>{dict?.hours || 'Hrs'}</span>
                    </div>
                    <div className={styles.timeBlock}>
                        <span className={styles.number}>{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className={styles.label}>{dict?.minutes || 'Mins'}</span>
                    </div>
                    <div className={styles.timeBlock}>
                        <span className={styles.number}>{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className={styles.label}>{dict?.seconds || 'Secs'}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
