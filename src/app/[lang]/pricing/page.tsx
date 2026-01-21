import Link from 'next/link'
import styles from './pricing.module.css'

export default function PricingPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Simple, Transparent Pricing</h1>
            <p className={styles.subtitle}>Choose the plan that best fits your business needs.</p>

            <div className={styles.grid}>
                {/* Starter Plan */}
                <div className={styles.card}>
                    <h2 className={styles.planName}>Starter</h2>
                    <div className={styles.price}>$29<span className={styles.period}>/mo</span></div>
                    <ul className={styles.features}>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Access to Basic Scripts</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Community Support</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Weekly Updates</li>
                    </ul>
                    <Link href="/products" className={`${styles.btn} ${styles.secondaryBtn}`}>
                        Get Started
                    </Link>
                </div>

                {/* Pro Plan */}
                <div className={`${styles.card} ${styles.popular}`}>
                    <div className={styles.badge}>Most Popular</div>
                    <h2 className={styles.planName}>Pro</h2>
                    <div className={styles.price}>$99<span className={styles.period}>/mo</span></div>
                    <ul className={styles.features}>
                        <li className={styles.feature}><span className={styles.check}>✓</span> All Basic Scripts</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Premium Automation Tools</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Priority Support</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Daily Updates</li>
                    </ul>
                    <Link href="/products" className={`${styles.btn} ${styles.primaryBtn}`}>
                        Get Started
                    </Link>
                </div>

                {/* Enterprise Plan */}
                <div className={styles.card}>
                    <h2 className={styles.planName}>Enterprise</h2>
                    <div className={styles.price}>Custom</div>
                    <ul className={styles.features}>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Custom Script Development</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> Dedicated Account Manager</li>
                        <li className={styles.feature}><span className={styles.check}>✓</span> On-premise Deployment</li>
                    </ul>
                    <Link href="/contact" className={`${styles.btn} ${styles.secondaryBtn}`}>
                        Contact Sales
                    </Link>
                </div>
            </div>
        </main>
    )
}
