import styles from '../privacy/policy.module.css'
import { RotateCcw } from 'lucide-react'

export default function ReturnPolicyPage() {
    return (
        <div className={styles.container}>
            <div className="container">
                <div className={styles.header}>
                    <RotateCcw size={48} stroke="var(--primary)" strokeWidth={2} />
                    <h1 className={styles.title}>Return & Refund Policy</h1>
                    <p className={styles.lastUpdate}>Last Updated: January 18, 2026</p>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>1. Digital Products Policy</h2>
                        <p>
                            Due to the nature of digital products and subscriptions, all sales are considered final once the product is delivered. This is because digital products cannot be "returned" in the traditional sense.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Eligible Refund Cases</h2>
                        <p>We provide refunds or replacements only in the following situations:</p>
                        <ul>
                            <li><strong>Defective Product:</strong> The product does not work as described or advertised</li>
                            <li><strong>Wrong Product:</strong> You received a different product than what you ordered</li>
                            <li><strong>Non-Delivery:</strong> Product was not delivered within the promised timeframe</li>
                            <li><strong>Invalid Credentials:</strong> The account credentials or license key provided are invalid or already used</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>3. Refund Request Process</h2>
                        <h3>Step 1: Contact Support</h3>
                        <p>
                            Reach out to our support team within <strong>24 hours of purchase</strong> via:
                        </p>
                        <ul>
                            <li>WhatsApp: +880 1997-118118</li>
                            <li>Email: support@guardifyit.com</li>
                        </ul>

                        <h3>Step 2: Provide Documentation</h3>
                        <p>Include the following in your refund request:</p>
                        <ul>
                            <li>Order number and transaction ID</li>
                            <li>Detailed description of the issue</li>
                            <li>Screenshots or evidence of the problem</li>
                            <li>Your contact information</li>
                        </ul>

                        <h3>Step 3: Investigation</h3>
                        <p>
                            Our team will investigate your claim within 24-48 hours. We may request additional information or attempt to resolve the issue.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Refund Methods</h2>
                        <p>Approved refunds will be processed via:</p>
                        <ul>
                            <li>The original payment method (Bkash, Nagad, Rocket)</li>
                            <li>Bank transfer to your provided account</li>
                            <li>Credit to your Guardify IT account (wallet) for future purchases</li>
                        </ul>
                        <p>
                            Refunds typically take 3-7 business days to appear in your account.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Non-Refundable Situations</h2>
                        <p>Refunds will <strong>NOT</strong> be provided in the following cases:</p>
                        <ul>
                            <li>Change of mind after product delivery</li>
                            <li>Failure to redeem or activate the product within validity period</li>
                            <li>Violation of subscription terms by the original provider</li>
                            <li>Account suspension due to misuse or policy violations</li>
                            <li>Requests made after 24 hours of purchase (unless product was defective from start)</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Replacement Policy</h2>
                        <p>
                            If your product is defective or invalid, we will first attempt to provide a replacement before issuing a refund. Replacements are typically delivered within 24 hours.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Partial Refunds</h2>
                        <p>
                            For subscription-based products, partial refunds may be considered based on unused time. This is evaluated on a case-by-case basis.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Chargebacks</h2>
                        <p>
                            If you initiate a chargeback without contacting us first, your account may be suspended, and you may be barred from future purchases.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Contact Us</h2>
                        <p>For refund requests or questions, contact our support team:</p>
                        <ul>
                            <li>Email: support@guardifyit.com</li>
                            <li>WhatsApp: +880 1997-118118</li>
                            <li>Business Hours: 24/7</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
