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
            title: isBn ? "অফিসিয়াল সোর্স থেকে সংগ্রহ" : "Sourced From Official Channels",
            desc: isBn
                ? "প্রতিটি সাবস্ক্রিপশন সরাসরি অফিসিয়াল রিসেলার থেকে নেওয়া।"
                : "Every subscription is purchased directly from authorized resellers."
        },
        {
            icon: Zap,
            title: isBn ? "১০-৩০ মিনিটে ডেলিভারি" : "Delivered in 10-30 Minutes",
            desc: isBn
                ? "পেমেন্ট ভেরিফাই হলে আপনার লগইন ডিটেইলস WhatsApp-এ পাঠানো হবে।"
                : "Once payment is verified, your login details are sent via WhatsApp."
        },
        {
            icon: HeartHandshake,
            title: isBn ? "WhatsApp-এ সরাসরি সাপোর্ট" : "Direct WhatsApp Support",
            desc: isBn
                ? "কোনো সমস্যা হলে সরাসরি আমাদের WhatsApp-এ মেসেজ করুন, দ্রুত সমাধান পাবেন।"
                : "Message us directly on WhatsApp for quick help — no tickets, no waiting."
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
