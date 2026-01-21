import styles from './about.module.css'
import { Shield, Zap, HeadphonesIcon, Award } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
    {
        icon: Shield,
        title: 'DBID Verified',
        description: 'Fully verified by DBID for authentic and legal digital products'
    },
    {
        icon: Zap,
        title: 'Instant Delivery',
        description: 'Get your digital products delivered instantly after payment confirmation'
    },
    {
        icon: HeadphonesIcon,
        title: '24/7 Support',
        description: 'Round-the-clock customer support via WhatsApp and Email'
    },
    {
        icon: Award,
        title: '100% Genuine',
        description: 'All products are sourced from authorized distributors and resellers'
    }
]

const STATS = [
    { number: '5000+', label: 'Happy Customers' },
    { number: '50+', label: 'Premium Products' },
    { number: '99.8%', label: 'Customer Satisfaction' },
    { number: '24/7', label: 'Customer Support' }
]

export default function AboutPage() {
    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className="container">
                    <h1 className={styles.title}>About Guardify IT</h1>
                    <p className={styles.subtitle}>
                        Your Trusted Marketplace for Authentic Digital Subscriptions
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.story}>
                        <h2 className={styles.sectionTitle}>Our Story</h2>
                        <div className={styles.storyContent}>
                            <p>
                                Guardify IT was founded with a simple mission: to make premium digital subscriptions
                                accessible and affordable for everyone in Bangladesh. We recognized that many people
                                wanted access to professional tools like LinkedIn Premium, Microsoft Office, and Adobe
                                Creative Cloud, but were deterred by high prices and complicated purchasing processes.
                            </p>
                            <p>
                                As a DBID-verified marketplace, we bridge the gap between global digital services and
                                local customers. Every product we offer is 100% genuine, legally sourced, and backed
                                by our commitment to quality and customer satisfaction.
                            </p>
                            <p>
                                Today, we serve thousands of satisfied customers across Bangladesh, from freelancers
                                and students to small businesses and enterprises. Our platform has become the go-to
                                destination for affordable premium subscriptions with instant delivery and dedicated support.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className={styles.statsSection}>
                <div className="container">
                    <div className={styles.statsGrid}>
                        {STATS.map((stat, idx) => (
                            <div key={idx} className={styles.stat}>
                                <div className={styles.statNumber}>{stat.number}</div>
                                <div className={styles.statLabel}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.section}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Why Choose Us</h2>
                    <div className={styles.featuresGrid}>
                        {FEATURES.map((feature, idx) => (
                            <div key={idx} className={styles.featureCard}>
                                <div className={styles.iconWrapper}>
                                    <feature.icon size={32} />
                                </div>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDesc}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.missionVision}>
                        <div className={styles.mvCard}>
                            <h3 className={styles.mvTitle}>Our Mission</h3>
                            <p>
                                To democratize access to premium digital tools and services by offering
                                authentic products at affordable prices with exceptional customer service.
                            </p>
                        </div>
                        <div className={styles.mvCard}>
                            <h3 className={styles.mvTitle}>Our Vision</h3>
                            <p>
                                To become Bangladesh's most trusted digital marketplace, empowering
                                individuals and businesses with the tools they need to succeed.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className="container">
                    <h2>Ready to Get Started?</h2>
                    <p>Browse our collection of premium digital subscriptions</p>
                    <Link href="/products" className="btn-primary">
                        Explore Products
                    </Link>
                </div>
            </section>
        </div>
    )
}
