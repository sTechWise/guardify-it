import styles from '../privacy/policy.module.css'
import { Truck } from 'lucide-react'

export default function ShippingPolicyPage() {
    return (
        <div className={styles.container}>
            <div className="container">
                <div className={styles.header}>
                    <Truck size={48} stroke="var(--primary)" strokeWidth={2} />
                    <h1 className={styles.title}>Delivery Policy</h1>
                    <p className={styles.lastUpdate}>Last Updated: January 18, 2026</p>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>1. Digital Product Delivery</h2>
                        <p>
                            Guardify IT specializes in digital products, which means there is no physical shipping involved. All products are delivered electronically.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Delivery Methods</h2>
                        <p>Your products will be delivered via one or more of the following methods:</p>
                        <ul>
                            <li><strong>Email:</strong> Product credentials and instructions sent to your registered email</li>
                            <li><strong>Account Dashboard:</strong> Access product details through your Guardify IT account</li>
                            <li><strong>WhatsApp:</strong> Direct delivery via messaging app (if requested)</li>
                            <li><strong>Download Link:</strong> Secure link to download license keys or access codes</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>3. Delivery Timeframe</h2>
                        <h3>Standard Delivery</h3>
                        <p>
                            Most products are delivered <strong>instantly to within 24 hours</strong> after payment confirmation.
                        </p>

                        <h3>High-Demand Products</h3>
                        <p>
                            During peak times or for high-demand products, delivery may take up to <strong>48 hours</strong>. You will be notified if there are any delays.
                        </p>

                        <h3>Pre-Order Products</h3>
                        <p>
                            If you pre-order a product, delivery will occur on the specified release date or as communicated at the time of purchase.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Payment Confirmation</h2>
                        <p>
                            Product delivery begins only after payment is verified. After paying via Bkash, Nagad, Rocket, or bank transfer, please:
                        </p>
                        <ul>
                            <li>Upload your payment proof through the provided link</li>
                            <li>Include your transaction ID in the payment screenshot</li>
                            <li>Ensure your contact information is correct</li>
                        </ul>
                        <p>
                            Payments are typically verified within 1-6 hours. Once verified, you will receive a confirmation and your product will be delivered.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Delivery Confirmation</h2>
                        <p>
                            Upon successful delivery, you will receive:
                        </p>
                        <ul>
                            <li>Confirmation email with product details</li>
                            <li>Instructions on how to use or activate the product</li>
                            <li>Customer support contact in case of issues</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Failed Delivery</h2>
                        <p>Delivery may fail due to:</p>
                        <ul>
                            <li>Incorrect email address provided</li>
                            <li>Email service blocking our messages (spam filter)</li>
                            <li>Technical issues on our end</li>
                        </ul>
                        <p>
                            If you do not receive your product within the stated timeframe, please contact our support team immediately.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Redelivery</h2>
                        <p>
                            If you accidentally delete your product email or lose access, we can resend the product details at no extra charge. Contact support with your order number.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Product Activation</h2>
                        <p>
                            Some products (like license keys or shared accounts) require activation or setup. Detailed instructions will be provided with your delivery. If you need assistance, our support team is available 24/7.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Delivery Tracking</h2>
                        <p>
                            You can track your order status by:
                        </p>
                        <ul>
                            <li>Logging into your Guardify IT account and checking "My Orders"</li>
                            <li>Checking your email for order updates</li>
                            <li>Contacting our support team with your order number</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>10. Customer Responsibility</h2>
                        <p>It is your responsibility to:</p>
                        <ul>
                            <li>Provide accurate email and contact information during checkout</li>
                            <li>Check your spam/junk folder for delivery emails</li>
                            <li>Store your product credentials securely</li>
                            <li>Report any delivery issues within 24 hours</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>11. Contact Support</h2>
                        <p>For delivery-related questions or issues, contact us:</p>
                        <ul>
                            <li>Email: support@guardifyit.com</li>
                            <li>WhatsApp: +880 1997-118118</li>

                            <li>Available: 24/7</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
