import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "./call-to-action.module.css";

interface CallToActionProps {
    lang: string;
    dict: any;
}

export default function CallToAction({ lang, dict }: CallToActionProps) {
    const isBn = lang === "bn";

    return (
        <section className={styles.ctaSection}>
            <div className="container">
                <div className={styles.content}>
                    <h2 className={styles.title}>
                        {isBn
                            ? "আপনার পছন্দের সাবস্ক্রিপশন খুঁজে নিন — সবচেয়ে কম দামে"
                            : "Find Your Subscription — At Prices You Won't Find Elsewhere"}
                    </h2>

                    <Link href={`/${lang}/products`} className={styles.btn}>
                        {isBn ? "শপ শুরু করুন" : "Start Shopping"} <ArrowRight size={24} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
