'use client'

import Link from 'next/link'
import styles from './whatsapp-button.module.css'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
    return (
        <Link
            href="https://wa.me/8801997118118"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle className={styles.icon} size={24} />
            <span className={styles.text}>Need Help?</span>
        </Link>
    )
}
