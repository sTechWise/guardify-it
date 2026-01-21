'use client'

import styles from '../upload-proof.module.css'
import { CheckCircle, Home } from 'lucide-react'
import Link from 'next/link'

export default function UploadSuccessPage() {
    return (
        <main className={styles.container}>
            <div className={styles.successStore}>
                <CheckCircle size={64} className={styles.successIcon} />
                <h1 className={styles.title}>Payment Proof Submitted!</h1>
                <p className={styles.subtitle} style={{ maxWidth: '500px', margin: '0 auto' }}>
                    ✅ Payment proof submitted successfully. Our team will verify it shortly and activate your subscription. You will receive an email confirmation soon.
                </p>

                <Link href="/" className={styles.homeBtn}>
                    <Home size={18} /> Back to Home
                </Link>
            </div>
        </main>
    )
}
