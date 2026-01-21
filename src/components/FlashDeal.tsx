'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Timer, ArrowRight, Zap } from "lucide-react";
import styles from "./flash-deal.module.css";
import Image from "next/image";

interface FlashDealProps {
    lang: string;
    dict: any;
    products?: any[];
}

export default function FlashDeal({ lang, dict, products = [] }: FlashDealProps) {
    const isBn = lang === "bn";
    const [mounted, setMounted] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Selected product state
    const [dealProduct, setDealProduct] = useState<any>(null);

    useEffect(() => {
        setMounted(true);

        // 3-Day Cycle Logic
        const CYCLE_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 Days in ms
        const EPOCH = new Date("2024-01-01T00:00:00Z").getTime(); // Fixed start date

        const updateTimer = () => {
            const now = Date.now();
            const timeSinceEpoch = now - EPOCH;
            const currentCycleIndex = Math.floor(timeSinceEpoch / CYCLE_DURATION);

            // Calculate time remaining in current cycle
            const nextCycleStart = EPOCH + (currentCycleIndex + 1) * CYCLE_DURATION;
            const diff = nextCycleStart - now;

            if (diff <= 0) {
                // Should not happen often with the math above, but strictly:
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });

            // Select product deterministically based on cycle index
            if (products && products.length > 0) {
                const productIndex = currentCycleIndex % products.length;
                setDealProduct(products[productIndex]);
            }
        };

        updateTimer(); // Initial call
        const timerId = setInterval(updateTimer, 1000);

        return () => clearInterval(timerId);
    }, [products]);

    const formatTime = (val: number) => val.toString().padStart(2, '0');

    if (!mounted) return null;

    return (
        <section className={styles.flashDeal}>
            <div className={`container ${styles.container}`}>
                {/* Left Side: Timer & Title */}
                <div className={styles.timerSection}>
                    <div className={styles.dealHeader}>
                        <div className={styles.dealBadge}>
                            <Zap size={16} fill="currentColor" />
                            {dealProduct ? (isBn ? "সীমিত সময়ের অফার" : "Limited Time Offer") : (isBn ? "শীঘ্রই আসছে" : "Stay Tuned")}
                        </div>
                        <h2 className={styles.dealTitle}>
                            {dealProduct
                                ? (isBn ? "ফ্ল্যাশ ডিল চলছে!" : "Flash Deal Ends In")
                                : (isBn ? "পরবর্তী ডিলের জন্য অপেক্ষা করুন" : "More Deals Coming Soon")}
                        </h2>
                    </div>

                    {dealProduct ? (
                        <div className={styles.countdown}>
                            <div className={styles.timeBlock}>
                                <span className={styles.timeVal}>{formatTime(timeLeft.days)}</span>
                                <span className={styles.timeLabel}>DAYS</span>
                            </div>
                            <div className={styles.separator}>:</div>
                            <div className={styles.timeBlock}>
                                <span className={styles.timeVal}>{formatTime(timeLeft.hours)}</span>
                                <span className={styles.timeLabel}>HRS</span>
                            </div>
                            <div className={styles.separator}>:</div>
                            <div className={styles.timeBlock}>
                                <span className={styles.timeVal}>{formatTime(timeLeft.minutes)}</span>
                                <span className={styles.timeLabel}>MIN</span>
                            </div>
                            <div className={styles.separator}>:</div>
                            <div className={styles.timeBlock}>
                                <span className={styles.timeVal}>{formatTime(timeLeft.seconds)}</span>
                                <span className={styles.timeLabel}>SEC</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.countdown}>
                            {/* Static timer placeholder or message */}
                            <div className={styles.timeBlock}>
                                <span className={styles.timeVal}>--</span>
                                <span className={styles.timeLabel}>DAYS</span>
                            </div>
                            <div className={styles.separator}>:</div>
                            <div className={styles.timeBlock}>
                                <span className={styles.timeVal}>--</span>
                                <span className={styles.timeLabel}>HRS</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Product Card Popup */}
                {dealProduct ? (
                    <div className={styles.productCardWrapper}>
                        <div className={styles.productCard}>
                            {dealProduct.image_url && (
                                <div className={styles.imageWrapper}>
                                    <img
                                        src={dealProduct.image_url}
                                        alt={dealProduct.title}
                                        className={styles.productImage}
                                    />
                                </div>
                            )}

                            <div className={styles.productContent}>
                                <h3 className={styles.productName}>
                                    {isBn ? (dealProduct.title_bengali || dealProduct.title) : dealProduct.title}
                                </h3>
                                <div className={styles.priceRow}>
                                    <span className={styles.salePrice}>৳{dealProduct.sale_price}</span>
                                    <span className={styles.regularPrice}>৳{dealProduct.price}</span>
                                    <span className={styles.discountBadge}>
                                        {Math.round(((dealProduct.price - dealProduct.sale_price) / dealProduct.price) * 100)}% OFF
                                    </span>
                                </div>
                                <Link href={`/${lang}/products/${dealProduct.id}`} className={styles.getDealBtn}>
                                    {isBn ? "এখনই কিনুন" : "Get Deal Now"} <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Fallback Card when no deals are active
                    <div className={styles.productCardWrapper}>
                        <div className={styles.productCard}>
                            <div className={styles.imageWrapper} style={{ display: 'grid', placeItems: 'center' }}>
                                <Zap size={40} className="text-slate-600" />
                            </div>

                            <div className={styles.productContent}>
                                <h3 className={styles.productName}>
                                    {isBn ? "নতুন অফার আসছে" : "New Offers Arriving Soon"}
                                </h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                    {isBn ? "সেরা ডিলের জন্য চোখ রাখুন।" : "Keep an eye out for our next big discount drop."}
                                </p>
                                <Link href={`/${lang}/products`} className={styles.getDealBtn}>
                                    {isBn ? "সব পণ্য দেখুন" : "Browse Products"} <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
