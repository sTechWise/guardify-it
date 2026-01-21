import styles from './faq.module.css'
import { Search, ChevronDown } from 'lucide-react'

const FAQS = [
    {
        category: 'General',
        questions: [
            {
                q: 'What is Guardify IT?',
                a: 'Guardify IT is a DBID-verified digital subscription marketplace offering authentic software licenses, premium subscriptions, and online services at competitive prices with instant delivery.'
            },
            {
                q: 'Are your products genuine and legal?',
                a: 'Yes! All our products are 100% genuine and legally sourced. We are DBID-verified and maintain relationships with authorized distributors.'
            },
            {
                q: 'How long does delivery take?',
                a: 'Most digital products are delivered instantly after payment confirmation. Some products may take up to 24 hours during peak times.'
            }
        ]
    },
    {
        category: 'Payment & Orders',
        questions: [
            {
                q: 'What payment methods do you accept?',
                a: 'We accept Bkash, Nagad, Rocket, and bank transfers. Payment instructions are provided during checkout.'
            },
            {
                q: 'How do I upload payment proof?',
                a: 'After placing an order, you will be redirected to the payment instructions page. Follow the guidelines and upload your payment screenshot through the provided link.'
            },
            {
                q: 'Can I get a refund?',
                a: 'Digital products are non-refundable once delivered. However, if you receive a defective product or wrong item, contact us within 24 hours for a replacement.'
            },
            {
                q: 'Do I need to create an account to order?',
                a: 'No, we support guest checkout. However, creating an account helps you track orders and access exclusive deals.'
            }
        ]
    },
    {
        category: 'Products & Services',
        questions: [
            {
                q: 'What is a "shared" subscription?',
                a: 'Shared subscriptions mean you get access to a premium service through a family or team plan slot. Your access is guaranteed, but the account is shared with other users.'
            },
            {
                q: 'How long are subscriptions valid?',
                a: 'Validity varies by product. Check the product description for exact duration (e.g., 1 month, 6 months, 1 year).'
            },
            {
                q: 'Can I renew my subscription?',
                a: 'Yes! Contact us before your subscription expires, and we will help you renew at the best available price.'
            }
        ]
    },
    {
        category: 'Support',
        questions: [
            {
                q: 'How can I contact support?',
                a: 'You can reach us via WhatsApp (+880 1997-118118) or email (support@guardifyit.com). Our support team is available 24/7.'
            },
            {
                q: 'What if my product stops working?',
                a: 'If you experience any issues with your product, contact our support team immediately. We provide replacement or troubleshooting support for all products under warranty.'
            }
        ]
    }
]

export default function FAQPage() {
    return (
        <div className={styles.container}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Frequently Asked Questions</h1>
                    <p className={styles.subtitle}>
                        Find answers to common questions about our products, payments, and services
                    </p>
                </div>

                <div className={styles.content}>
                    {FAQS.map((section, idx) => (
                        <div key={idx} className={styles.section}>
                            <h2 className={styles.categoryTitle}>{section.category}</h2>
                            <div className={styles.questions}>
                                {section.questions.map((item, qIdx) => (
                                    <details key={qIdx} className={styles.faqItem}>
                                        <summary className={styles.question}>
                                            {item.q}
                                            <ChevronDown className={styles.icon} size={20} />
                                        </summary>
                                        <p className={styles.answer}>{item.a}</p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.cta}>
                    <h3>Still have questions?</h3>
                    <p>Our support team is here to help 24/7</p>
                    <a href="https://wa.me/8801997118118" target="_blank" rel="noopener noreferrer" className="btn-primary">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    )
}
