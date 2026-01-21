import styles from './promotions.module.css'
import { Tag, Clock, Zap } from 'lucide-react'
import Link from 'next/link'

const PROMOTIONS = [
    {
        id: '1',
        title: 'LinkedIn Premium Business - Mega Deal',
        description: 'Get 6 months of LinkedIn Premium Business at an unbeatable price. Perfect for professionals looking to expand their network.',
        discount: '90% OFF',
        originalPrice: 3500,
        salePrice: 1499,
        validUntil: '2026-01-31',
        badge: 'Best Seller',
        image: 'https://images.unsplash.com/photo-1611944212129-29990460f15d?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: '2',
        title: 'ChatGPT Plus - Limited Time Offer',
        description: 'Access to GPT-4, faster response times, and priority access during peak hours. Shared account with guaranteed access.',
        discount: '75% OFF',
        originalPrice: 2000,
        salePrice: 499,
        validUntil: '2026-02-15',
        badge: 'Hot Deal',
        image: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&auto=format&fit=crop&q=60'
    },
    {
        id: '3',
        title: 'Canva Pro - Annual Subscription',
        description: 'Unlock premium templates, fonts, and design tools. Perfect for content creators and marketers.',
        discount: '78% OFF',
        originalPrice: 900,
        salePrice: 200,
        validUntil: '2026-02-28',
        badge: 'Popular',
        image: 'https://images.unsplash.com/photo-1626785774573-4b7993143a2d?w=800&auto=format&fit=crop&q=60'
    }
]

export default function PromotionsPage() {
    return (
        <div className={styles.container}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <Tag size={40} stroke="var(--primary)" strokeWidth={2} />
                        <div>
                            <h1 className={styles.title}>Special Promotions</h1>
                            <p className={styles.subtitle}>
                                Limited time offers on premium subscriptions - Don't miss out!
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.grid}>
                    {PROMOTIONS.map((promo) => (
                        <div key={promo.id} className={styles.card}>
                            {promo.badge && (
                                <div className={styles.badge}>
                                    <Zap size={14} />
                                    {promo.badge}
                                </div>
                            )}

                            <div className={styles.imageWrapper}>
                                <img src={promo.image} alt={promo.title} className={styles.image} />
                                <div className={styles.discountOverlay}>
                                    {promo.discount}
                                </div>
                            </div>

                            <div className={styles.content}>
                                <h2 className={styles.promoTitle}>{promo.title}</h2>
                                <p className={styles.description}>{promo.description}</p>

                                <div className={styles.pricing}>
                                    <span className={styles.salePrice}>৳{promo.salePrice}</span>
                                    <span className={styles.originalPrice}>৳{promo.originalPrice}</span>
                                </div>

                                <div className={styles.validity}>
                                    <Clock size={16} />
                                    <span>Valid until: {new Date(promo.validUntil).toLocaleDateString('en-GB')}</span>
                                </div>

                                <Link href={`/products/${promo.id}`} className={styles.ctaButton}>
                                    Get This Deal
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.infoSection}>
                    <h2>How Our Promotions Work</h2>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <h3>Limited Quantity</h3>
                            <p>Promotional prices are available for a limited number of customers only.</p>
                        </div>
                        <div className={styles.infoCard}>
                            <h3>Time-Sensitive</h3>
                            <p>All promotions have an expiry date. Grab them before they're gone!</p>
                        </div>
                        <div className={styles.infoCard}>
                            <h3>100% Genuine</h3>
                            <p>Even on promotion, all our products are authentic and fully verified.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
