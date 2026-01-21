import styles from './policy.module.css'
import { Shield } from 'lucide-react'

export default function PrivacyPolicyPage() {
    return (
        <div className={styles.container}>
            <div className="container">
                <div className={styles.header}>
                    <Shield size={48} stroke="var(--primary)" strokeWidth={2} />
                    <h1 className={styles.title}>Privacy Policy</h1>
                    <p className={styles.lastUpdate}>Last Updated: January 18, 2026</p>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2>1. Introduction</h2>
                        <p>
                            At Guardify IT, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital subscription marketplace.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>2. Information We Collect</h2>
                        <h3>Personal Information</h3>
                        <p>We may collect the following personal information:</p>
                        <ul>
                            <li>Name and contact information (email, phone number)</li>
                            <li>Payment information and transaction details</li>
                            <li>Account credentials and login information</li>
                            <li>Order history and product preferences</li>
                        </ul>

                        <h3>Automatically Collected Information</h3>
                        <ul>
                            <li>Device information (IP address, browser type, operating system)</li>
                            <li>Usage data (pages visited, time spent on site)</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>3. How We Use Your Information</h2>
                        <p>We use the collected information for the following purposes:</p>
                        <ul>
                            <li>Processing and fulfilling your orders</li>
                            <li>Communicating with you about your account and transactions</li>
                            <li>Improving our services and user experience</li>
                            <li>Sending promotional offers and updates (with your consent)</li>
                            <li>Preventing fraud and ensuring security</li>
                            <li>Complying with legal obligations</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>4. Information Sharing and Disclosure</h2>
                        <p>
                            We do not sell your personal information. We may share your information with:
                        </p>
                        <ul>
                            <li><strong>Service Providers:</strong> Third parties that help us operate our business (payment processors, hosting providers)</li>
                            <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h2>5. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>6. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Access, correct, or delete your personal information</li>
                            <li>Withdraw consent for marketing communications</li>
                            <li>Object to processing of your data</li>
                            <li>Request data portability</li>
                        </ul>
                        <p>To exercise these rights, contact us at privacy@guardifyit.com</p>
                    </section>

                    <section className={styles.section}>
                        <h2>7. Cookies</h2>
                        <p>
                            We use cookies to enhance your experience. You can control cookies through your browser settings. Disabling cookies may affect site functionality.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>8. Changes to Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2>9. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <ul>
                            <li>Email: privacy@guardifyit.com</li>
                            <li>WhatsApp: +880 1997-118118</li>
                            <li>Address: Dhaka, Bangladesh</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
