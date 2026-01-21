'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './hero-slider.module.css'
import { Locale } from '@/i18n-config'

type HeroSliderProps = {
    lang: Locale
    dict: any
}

export default function HeroSlider({ lang, dict }: HeroSliderProps) {
    const [current, setCurrent] = useState(0)

    const SLIDES = [
        {
            id: 1,
            title: lang === 'bn' ? "আমরা দিচ্ছি স্বল্প খরচে আপনার প্রয়োজনীয় সাবস্কিপশন" : "Affordable, authentic digital subscriptions",
            subtitle: lang === 'bn' ? "তাৎক্ষণিক ডেলিভারি এবং সম্পূর্ণ ওয়ারেন্টি সহায়তা" : "Instant delivery and full warranty support",
            badge: lang === 'bn' ? "হাজারের বিশ্বাস" : "Trusted by Thousands",
            bgClass: styles.bg1,
            cta: dict.browse_products,
            link: `/${lang}/products`
        },
        {
            id: 2,
            title: lang === 'bn' ? "লিংকডইন প্রিমিয়ামে বিশাল ছাড় – ৯০% পর্যন্ত!" : "Huge Discount on LinkedIn Premium – Up to 90%!",
            subtitle: lang === 'bn' ? "আপনার ক্যারিয়ার উন্নত করুন সেরা দামে" : "Upgrade your career with Business, Sales Navigator, and Recruiter Lite plans",
            badge: lang === 'bn' ? "সীমিত সময়ের অফার" : "Limited Time Offer",
            bgClass: styles.bg2,
            cta: lang === 'bn' ? "এখনই প্রিমিয়াম নিন" : "Get Premium Now",
            link: `/${lang}/products`
        },
        {
            id: 3,
            title: lang === 'bn' ? "জেনুইন মাইক্রোসফট অফিস লাইসেন্স" : "Genuine Microsoft Office Licenses",
            subtitle: lang === 'bn' ? "১০০% আসল কী তাৎক্ষণিক ডেলিভারি" : "100% authentic keys for Office 365, 2024, and Windows 11",
            badge: lang === 'bn' ? "বেস্ট সেলার" : "Best Seller",
            bgClass: styles.bg3,
            cta: lang === 'bn' ? "মাইক্রোসফট কিনুন" : "Shop Microsoft",
            link: `/${lang}/products`
        }
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % SLIDES.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className={styles.slider}>
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`${styles.slide} ${slide.bgClass} ${index === current ? styles.active : ''}`}
                >
                    <div className={styles.content}>
                        <span className={styles.badge}>{slide.badge}</span>
                        <h1 className={styles.title}>{slide.title}</h1>
                        <p className={styles.subtitle}>{slide.subtitle}</p>
                        <Link href={slide.link} className="btn-primary">
                            {slide.cta}
                        </Link>
                    </div>
                </div>
            ))}

            <div className={styles.dots}>
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        className={`${styles.dot} ${index === current ? styles.dotActive : ''}`}
                        onClick={() => setCurrent(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    )
}
