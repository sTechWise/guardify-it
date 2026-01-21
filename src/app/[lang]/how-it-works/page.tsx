import Link from 'next/link'
import styles from './how.module.css'

export default function HowItWorksPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>How Guardify Works</h1>

            <div className={styles.step}>
                <div className={styles.number}>1</div>
                <div className={styles.content}>
                    <h2 className={styles.stepTitle}>Browse the Marketplace</h2>
                    <p className={styles.stepDesc}>
                        Explore our extensive library of AI tools and automation scripts. Filter by category, price, or popularity to find exactly what you need.
                    </p>
                </div>
            </div>

            <div className={styles.step}>
                <div className={styles.number}>2</div>
                <div className={styles.content}>
                    <h2 className={styles.stepTitle}>Secure Checkout</h2>
                    <p className={styles.stepDesc}>
                        Add items to your cart and proceed to our secure checkout. Even with no account, we'll create one for you instantly so you never lose your purchases.
                    </p>
                </div>
            </div>

            <div className={styles.step}>
                <div className={styles.number}>3</div>
                <div className={styles.content}>
                    <h2 className={styles.stepTitle}>Verify & Download</h2>
                    <p className={styles.stepDesc}>
                        Complete your payment using your preferred local method (bKash, Nagad, etc.). Once verified by our team (usually within minutes), you'll get instant access to download your tools.
                    </p>
                </div>
            </div>

            <div className={styles.cta}>
                <Link href="/products" className={styles.ctaBtn}>
                    Start Browsing
                </Link>
            </div>
        </main>
    )
}
