import styles from './delivery-notice.module.css'
import { Zap, Clock } from 'lucide-react'

export default function DeliveryNotice() {
    return (
        <div className={styles.notice}>
            <div className={styles.iconWrapper}>
                <Zap size={24} />
            </div>
            <div className={styles.content}>
                <h4 className={styles.title}>
                    <span className={styles.english}>Instant Digital Delivery</span>
                    <span className={styles.separator}> | </span>
                    <span className={styles.bengali}>তাৎক্ষণিক ডিজিটাল ডেলিভারি</span>
                </h4>
                <p className={styles.description}>
                    <Clock size={16} />
                    Your subscription details will be delivered via email and WhatsApp within 5-30 minutes after payment confirmation.
                </p>
                <p className={styles.bengaliDesc}>
                    পেমেন্ট নিশ্চিত হওয়ার ৫-৩০ মিনিটের মধ্যে আপনার সাবস্ক্রিপশন তথ্য ইমেইল এবং হোয়াটসঅ্যাপে পাঠানো হবে।
                </p>
            </div>
        </div>
    )
}
