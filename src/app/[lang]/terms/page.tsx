import styles from '../privacy/policy.module.css'
import { FileText } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className={styles.container}>
            <div className="container">
                <div className={styles.header}>
                    <FileText size={48} stroke="var(--primary)" strokeWidth={2} />
                    <h1 className={styles.title}>Terms & Conditions</h1>
                    <p className={styles.lastUpdate}>Last Updated: January 18, 2026</p>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Guardify IT's services, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Services Description</h2>
                        <p>
                            Guardify IT is a digital subscription marketplace offering authentic software licenses and online service subscriptions. All products are sourced from authorized distributors.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>3. User Accounts</h2>
                        <ul>
                            <li>You may create an account to access additional features</li>
                            <li>You are responsible for maintaining account security</li>
                            <li>You must provide accurate and complete information</li>
                            <li>Guest checkout is available without account creation</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Orders and Payments</h2>
                        <h3>Order Placement</h3>
                        <p>
                            When you place an order, you are making an offer to purchase. We reserve the right to accept or reject orders at our discretion.
                        </p>

                        <h3>Pricing</h3>
                        <p>
                            All prices are in Bangladeshi Taka (BDT). We reserve the right to change prices without notice. However, price changes will not affect orders already placed.
                        </p>

                        <h3>Payment Methods</h3>
                        <p>
                            We accept Bkash, Nagad, Rocket, and bank transfers. Payment must be confirmed before product delivery.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Product Delivery</h2>
                        <ul>
                            <li>Digital products are delivered via email or account dashboard</li>
                            <li>Delivery typically occurs within 24 hours of payment confirmation</li>
                            <li>You are responsible for providing correct email/contact information</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Refunds and Returns</h2>
                        <p>
                            Due to the nature of digital products, all sales are final. Refunds are only provided in cases of:
                        </p>
                        <ul>
                            <li>Defective or non-working products</li>
                            <li>Incorrect product delivery</li>
                            <li>Service failure within the first 24 hours</li>
                        </ul>
                        <p>
                            Refund requests must be submitted within 24 hours of purchase with valid proof.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Intellectual Property</h2>
                        <p>
                            All content on Guardify IT, including text, graphics, logos, and images, is our property or licensed to us. You may not reproduce, distribute, or create derivative works without permission.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Prohibited Activities</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Use our services for illegal purposes</li>
                            <li>Resell products without authorization</li>
                            <li>Attempt to reverse engineer or hack our platform</li>
                            <li>Submit false information or fraudulent payments</li>
                            <li>Violate any third-party rights</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Warranty Disclaimer</h2>
                        <p>
                            Products are provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service. Third-party product warranties are subject to the original provider's terms.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Limitation of Liability</h2>
                        <p>
                            Guardify IT shall not be liable for indirect, incidental, or consequential damages arising from use of our services. Our total liability is limited to the amount paid for the product in question.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>11. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. Continued use of our services after changes constitutes acceptance.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>12. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of Bangladesh. Any disputes shall be resolved in the courts of Dhaka, Bangladesh.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>13. Contact Information</h2>
                        <p>For questions about these Terms, contact us:</p>
                        <ul>
                            <li>Email: support@guardifyit.com</li>
                            <li>WhatsApp: +880 1997-118118</li>
                            <li>Address: Dhaka, Bangladesh</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
