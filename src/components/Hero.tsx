import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import styles from "./hero.module.css";
import HeroVisual from "./HeroVisual";

interface HeroProps {
    lang: string;
    dict: any;
    products: any[]; // Using any[] for now to avoid importing strict types in component if not needed, or better import Product type
}

export default function Hero({ lang, dict, products }: HeroProps) {
    const isBn = lang === "bn";

    return (
        <section className={styles.hero}>
            <div className={`container ${styles.container}`}>
                {/* Left Side: Content */}
                <div className={styles.content}>
                    <div className={styles.badge}>
                        <span className={styles.dot}></span>
                        {isBn ? "প্রিমিয়াম মার্কেটপ্লেস" : "Premium Marketplace"}
                    </div>

                    <h1 className={styles.headline}>
                        {isBn ? (
                            <>
                                বাংলাদেশে সবচেয়ে কম দামে <br />
                                <span className="glow-text">প্রিমিয়াম সাবস্ক্রিপশন কিনুন</span>
                            </>
                        ) : (
                            <>
                                Buy Premium Subscriptions <br />
                                <span className="glow-text">at Lowest Price in Bangladesh</span>
                            </>
                        )}
                    </h1>

                    <p className={styles.subheadline}>
                        {isBn
                            ? "ChatGPT Plus, LinkedIn Premium, Canva Pro এবং Microsoft 365-এ ৯০% পর্যন্ত ছাড় — ১০০০+ বাংলাদেশী ব্যবহারকারীর আস্থাশীল।"
                            : "Get ChatGPT Plus, LinkedIn Premium, Canva Pro & Microsoft 365 at up to 90% discount — trusted by 1,000+ Bangladeshi users."}
                    </p>

                    <div className={styles.trustWrapper}>
                        <div className={styles.trustPoints}>
                            <div className={styles.point}>
                                <CheckCircle2 size={20} className={styles.checkIcon} />
                                {isBn ? "১০০% অরিজিনাল" : "100% Original"}
                            </div>
                            <div className={styles.point}>
                                <CheckCircle2 size={20} className={styles.checkIcon} />
                                {isBn ? "দ্রুত ডেলিভারি" : "Fast Delivery"}
                            </div>
                            <div className={styles.point}>
                                <CheckCircle2 size={20} className={styles.checkIcon} />
                                {isBn ? "ফ্রেন্ডলি সাপোর্ট" : "Friendly Support"}
                            </div>
                        </div>

                    </div>

                    <div className={styles.actions}>
                        <Link href={`/${lang}/products`} className={styles.ctaPrimary}>
                            {isBn ? "সাবস্ক্রিপশন দেখুন" : "Explore Subscriptions"} <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>

                {/* Right Side: Visual */}
                <div className={styles.visual}>
                    <HeroVisual lang={lang} products={products} />
                </div>
            </div>
        </section>
    );
}
