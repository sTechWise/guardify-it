import Link from 'next/link'
import styles from './not-found.module.css'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.errorCode}>404</h1>
                <h2 className={styles.title}>Page Not Found</h2>
                <p className={styles.description}>
                    Sorry, we couldn't find the page you're looking for. It may have been moved, deleted, or never existed.
                </p>

                <div className={styles.actions}>
                    <Link href="/" className={styles.btnPrimary}>
                        <Home size={20} />
                        Back to Home
                    </Link>
                    <Link href="/products" className={styles.btnSecondary}>
                        <Search size={20} />
                        Browse Products
                    </Link>
                </div>

                <div className={styles.links}>
                    <Link href="/contact">Contact Support</Link>
                    <span>•</span>
                    <Link href="/faq">FAQs</Link>
                    <span>•</span>
                    <Link href="/about">About Us</Link>
                </div>
            </div>
        </div>
    )
}
