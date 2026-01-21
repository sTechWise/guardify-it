'use client'

import styles from './hero-visual.module.css'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

interface HeroVisualProps {
    lang: any;
    products?: any[];
}

export default function HeroVisual({ lang, products = [] }: HeroVisualProps) {
    const radius = 220; // Radius of the carousel

    // Map database products to visual format
    // If no products provided, use empty array (or could use fallback mock data if desired)
    const visualProducts = products.length > 0 ? products.map((p, index) => {
        const variants = [styles.variant1, styles.variant2, styles.variant3, styles.variant4];
        let theme = variants[index % variants.length]; // Default to cyclic variant
        let initial = p.title.substring(0, 1).toUpperCase();

        const titleLower = p.title.toLowerCase();
        if (titleLower.includes('chatgpt')) {
            theme = styles.chatgpt;
            initial = 'GPT';
        } else if (titleLower.includes('netflix')) {
            theme = styles.netflix;
            initial = 'N';
        } else if (titleLower.includes('spotify')) {
            theme = styles.spotify;
            initial = 'S';
        } else if (titleLower.includes('prime')) {
            theme = styles.prime;
            initial = 'PV';
        } else if (titleLower.includes('google') || titleLower.includes('gemini')) {
            theme = styles.google;
            initial = 'G';
        } else if (titleLower.includes('perplexity')) {
            theme = styles.perplexity;
            initial = 'P';
        } else if (titleLower.includes('canva')) {
            theme = styles.canva;
            initial = 'C';
        }

        return {
            id: p.id,
            name: p.title,
            type: p.badge || 'Subscription', // Use badge as type if available
            price: `৳${p.sale_price || p.price}`,
            original: p.sale_price ? `৳${p.price}` : '',
            theme: theme,
            initial: initial,
            image: p.image_url
        };
    }) : [];

    const count = visualProducts.length;

    if (count === 0) return null; // Don't render if no products

    return (
        <div className={styles.scene}>
            <div className={styles.carousel}>
                {visualProducts.map((product, index) => {
                    // Calculate rotation for each card
                    const rotation = (index * 360) / count;

                    return (
                        <div
                            key={product.id}
                            className={`${styles.cardItem} ${product.theme}`}
                            style={{
                                transform: `rotateY(${rotation}deg) translateZ(${radius}px)`
                            }}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.titleWrapper}>
                                    <span className={styles.productName}>{product.name}</span>
                                    <span className={styles.productType}>{product.type}</span>
                                </div>
                            </div>

                            <div className={styles.centralVisual}>
                                <div className={styles.logo}>
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className={styles.logoImage} />
                                    ) : (
                                        product.initial
                                    )}
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.priceSection}>
                                    <span className={styles.priceLabel}>Starting from</span>
                                    <div className={styles.price}>
                                        {product.price}
                                        {product.original && (
                                            <span className={styles.originalPrice}>{product.original}</span>
                                        )}
                                    </div>
                                </div>

                                <Link href={`/${lang}/products/${product.id}`} className={styles.buyButton}>
                                    Buy Now
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
