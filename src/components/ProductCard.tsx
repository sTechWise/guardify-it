"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Heart, Eye } from "lucide-react";
import styles from "./product-card.module.css";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
    id: string;
    title: string;
    titleBengali?: string;
    price: number;
    salePrice?: number;
    image: string;
    rating?: number;
    reviewCount?: number;
    badge?: string;
    stockStatus: 'in_stock' | 'out_of_stock';
    subscriptionType?: string | null;
    lang: string;
    dict: any;
}

export default function ProductCard({
    id,
    title,
    titleBengali,
    price,
    salePrice,
    image,
    rating = 5.0,
    reviewCount = 0,
    badge,
    stockStatus,
    subscriptionType,
    lang,
    dict,
}: ProductCardProps) {
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isBn = lang === "bn";
    const inWishlist = isInWishlist(id);

    const discountPercentage = salePrice
        ? Math.round(((price - salePrice) / price) * 100)
        : 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        addToCart({
            id,
            title,
            price,
            sale_price: salePrice,
            image_url: image,
            subscription_type: subscriptionType || null,
            quantity: 1,
        });
        showToast(isBn ? "কার্টে যোগ করা হয়েছে" : "Added to cart", "success");
    };

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (inWishlist) {
            removeFromWishlist(id);
            showToast(isBn ? "উইশলিস্ট থেকে সরানো হয়েছে" : "Removed from wishlist", "success");
        } else {
            addToWishlist({
                id,
                title,
                title_bengali: titleBengali,
                price,
                sale_price: salePrice,
                image_url: image,
                subscription_type: subscriptionType || undefined,
            });
            showToast(isBn ? "উইশলিস্টে যোগ করা হয়েছে" : "Added to wishlist", "success");
        }
    };

    return (
        <div className={styles.card}>
            <Link href={`/${lang}/products/${id}`} className={styles.imageContainer}>
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                        No Image
                    </div>
                )}

                <div className={styles.badges}>
                    {discountPercentage > 0 && (
                        <span className={styles.discountBadge}>
                            SAVE {discountPercentage}%
                        </span>
                    )}
                    <span className={styles.deliveryBadge}>
                        Instant Delivery
                    </span>
                </div>

                <div className={styles.actionOverlay}>
                    <button
                        className={`${styles.iconBtn} ${inWishlist ? styles.iconBtnActive : ''}`}
                        aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                        onClick={handleWishlistToggle}
                    >
                        <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
                    </button>
                    <button className={styles.iconBtn} aria-label="Quick View">
                        <Eye size={18} />
                    </button>
                </div>
            </Link>

            <div className={styles.content}>
                <div className={styles.rating}>
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            fill={i < Math.floor(rating) ? "currentColor" : "none"}
                            strokeWidth={2}
                        />
                    ))}
                    <span className={styles.reviewCount}>({reviewCount})</span>
                </div>

                <Link href={`/${lang}/products/${id}`} className={styles.title}>{title}</Link>

                <div className={styles.priceContainer}>
                    <div className={styles.priceWrapper}>
                        {salePrice ? (
                            <>
                                <span className={styles.regularPrice}>৳{price.toLocaleString()}</span>
                                <span className={styles.salePrice}>৳{salePrice.toLocaleString()}</span>
                                <span className={styles.savingsLabel}>
                                    {isBn ? "সাশ্রয় " : "You Save "}
                                    ৳{(price - salePrice).toLocaleString()}
                                </span>
                            </>
                        ) : (
                            <span className={styles.salePrice}>৳{price.toLocaleString()}</span>
                        )}
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button className={styles.buyBtn} onClick={handleAddToCart}>
                        {isBn ? "কিনুন" : "Buy Now"}
                    </button>
                    <Link href={`/${lang}/products/${id}`} className={styles.viewDetailsBtn}>
                        {isBn ? "বিস্তারিত" : "View Details"}
                    </Link>
                </div>


            </div>
        </div>
    );
}
