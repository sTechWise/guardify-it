import styles from './payment-badges.module.css'
import Image from 'next/image'

export default function PaymentBadges() {
    return (
        <div className={styles.container}>
            <span className={styles.label}>We Accept</span>
            <div className={styles.badges}>
                <span className={`${styles.badge} ${styles.badgeBkash}`}>bKash</span>
                <span className={`${styles.badge} ${styles.badgeNagad}`}>Nagad</span>
                <span className={`${styles.badge} ${styles.badgeRocket}`}>Rocket</span>
                <span className={`${styles.badge} ${styles.badgeBank}`}>Bank Transfer</span>
            </div>
        </div>
    )
}
