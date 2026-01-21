"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Bot, Palette, Monitor, GraduationCap, LayoutGrid } from "lucide-react";
import styles from "./category-grid.module.css";
import { getCategories } from "@/lib/database";

interface CategoryGridProps {
    lang: string;
    dict: any;
}

// Visual themes
// Diverse Vibrant Gradients Palette
const GRADIENT_PALETTE = [
    { gradient: "linear-gradient(180deg, #f472b6 0%, #be185d 100%)", color: "#db2777" }, // Pink/Rose
    { gradient: "linear-gradient(180deg, #c084fc 0%, #7e22ce 100%)", color: "#9333ea" }, // Purple/Violet
    { gradient: "linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)", color: "#3b82f6" }, // Blue
    { gradient: "linear-gradient(180deg, #34d399 0%, #059669 100%)", color: "#10b981" }, // Emerald
    { gradient: "linear-gradient(180deg, #fbbf24 0%, #d97706 100%)", color: "#f59e0b" }, // Amber
    { gradient: "linear-gradient(180deg, #22d3ee 0%, #0891b2 100%)", color: "#06b6d4" }, // Cyan
    { gradient: "linear-gradient(180deg, #f87171 0%, #dc2626 100%)", color: "#ef4444" }, // Red
];

const CATEGORY_ICONS: Record<string, any> = {
    'ai': Bot,
    'creative': Palette,
    'software': Monitor,
    'education': GraduationCap,
    'default': LayoutGrid
};

export default function CategoryGrid({ lang, dict }: CategoryGridProps) {
    const isBn = lang === "bn";
    const [categories, setCategories] = useState<any[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Fetch categories on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getCategories();
                // Quadruple data for scrolling buffer to simulate infinite feel
                if (data && data.length > 0) {
                    setCategories([...data, ...data, ...data, ...data]);
                }
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchData();
    }, []);

    // Auto-Scroll Logic
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || categories.length === 0) return;

        let animationFrameId: number;
        let scrollSpeed = 0.5; // Smooth slow speed

        const animate = () => {
            if (!isPaused && container) {
                // Reset to start when we've scrolled past halfway (where duplicated content begins)
                // This creates a seamless infinite loop effect
                const halfWidth = container.scrollWidth / 2;
                if (container.scrollLeft >= halfWidth) {
                    container.scrollLeft = 0; // Instant reset to beginning
                }

                container.scrollLeft += scrollSpeed;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused, categories]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            // Temporarily pause auto-scroll while manually scrolling
            setIsPaused(true);

            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });

            // Resume auto-scroll after animation completes
            setTimeout(() => setIsPaused(false), 500);
        }
    };

    return (
        <section className={styles.categoryGrid}>
            <div className="container" style={{ position: 'relative' }}>
                <div className={styles.header}>
                    <h2 className={styles.headerTitle}>
                        {isBn ? "ক্যাটাগরি" : "Explore Categories"}
                    </h2>
                </div>

                {/* External Navigation Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className={`${styles.navButton} ${styles.navButtonLeft}`}
                    aria-label="Scroll Left"
                >
                    <ArrowLeft size={24} />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className={`${styles.navButton} ${styles.navButtonRight}`}
                    aria-label="Scroll Right"
                >
                    <ArrowRight size={24} />
                </button>

                <div
                    className={styles.carouselContainer}
                    ref={scrollContainerRef}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <div className={styles.carouselTrack}>
                        {categories.map((cat, index) => {
                            // Assign cyclic gradient from palette
                            const paletteIndex = index % GRADIENT_PALETTE.length;
                            const theme = GRADIENT_PALETTE[paletteIndex];

                            const Icon = CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS['default'];
                            // Ensure unique key for duplicated items
                            const uniqueKey = `${cat.id}-${index}`;

                            return (
                                <Link
                                    key={uniqueKey}
                                    href={`/${lang}/products?category=${cat.slug}`}
                                    className={styles.cardWrapper}
                                >
                                    <div
                                        className={styles.card}
                                        style={{ background: theme.gradient } as React.CSSProperties}
                                    >
                                        <div className={styles.popoverImage}>
                                            <div className={styles.iconCircle}>
                                                <Icon size={56} color={theme.color} />
                                            </div>
                                        </div>

                                        <h3 className={styles.title}>
                                            {isBn ? (cat.name_bengali || cat.name) : cat.name}
                                        </h3>

                                        <div className={styles.bgDecor}></div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
