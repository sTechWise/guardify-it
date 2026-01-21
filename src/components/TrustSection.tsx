import { ShieldCheck, Zap, HeartHandshake } from "lucide-react";
import styles from "./trust-section.module.css";

interface TrustSectionProps {
    lang: string;
    dict: any;
}

export default function TrustSection({ lang, dict }: TrustSectionProps) {
    const isBn = lang === "bn";

    const features = [
        {
            icon: ShieldCheck,
            title: isBn ? "১০০% অরিজিনাল সাবস্ক্রিপশন" : "100% Genuine Subscriptions",
            desc: isBn
                ? "আমাদের সকল প্রোডাক্ট ভেরিফাইড এবং অফিসিয়াল সোর্স থেকে সংগ্রহ করা।"
                : "All our products are verified and sourced from official channels."
        },
        {
            icon: Zap,
            title: isBn ? "পেমেন্টের পর দ্রুত ডেলিভারি" : "Fast Delivery After Payment",
            desc: isBn
                ? "অর্ডার কনফার্ম করার ১০-৩০ মিনিটের মধ্যে বিস্তারিত পেয়ে যাবেন।"
                : "Receive your subscription details within 10-30 minutes of order confirmation."
        },
        {
            icon: HeartHandshake,
            title: isBn ? "ফ্রেন্ডলি বাংলাদেশি সাপোর্ট" : "Friendly Bangladeshi Support",
            desc: isBn
                ? "যেকোনো সমস্যায় আমাদের ২৪/৭ সাপোর্ট টিম আপনার পাশে আছে।"
                : "Our 24/7 support team is always here to help you with any issues."
        }
    ];

    return (
        <section className={styles.trustSection}>
            <div className="container">
                <div className={styles.titleWrapper}>
                    <h2 className={styles.sectionTitle}>
                        {isBn ? "কেন Guardify IT সেরা?" : "Why Choose Guardify IT?"}
                    </h2>
                </div>

                <div className={styles.grid}>
                    {features.map((feature, idx) => (
                        <div key={idx} className={styles.card}>
                            <div className={styles.iconWrapper}>
                                <feature.icon size={32} />
                            </div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDesc}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
