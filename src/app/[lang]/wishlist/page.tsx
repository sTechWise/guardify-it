'use client'

import styles from './wishlist.module.css'
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import Image from 'next/image'

export default function WishlistPage() {
    const params = useParams()
    const lang = params.lang as string || 'en'
    const { wishlist, removeFromWishlist, isLoaded } = useWishlist()
    const { addToCart } = useCart()
    const { showToast } = useToast()

    const handleAddToCart = (item: typeof wishlist[0]) => {
        addToCart({
            id: item.id,
            title: item.title,
            price: item.price,
            sale_price: item.sale_price ?? undefined,
            image_url: item.image_url ?? null,
            subscription_type: item.subscription_type ?? null,
            quantity: 1
        })
        showToast('Added to cart!', 'success')
    }

    const handleRemove = (id: string) => {
        removeFromWishlist(id)
        showToast('Removed from wishlist', 'success')
    }

    if (!isLoaded) {
        return (
            <div className={styles.emptyState}>
                <div className="container">
                    <div className={styles.emptyContent}>
                        <Heart size={80} strokeWidth={1.5} />
                        <h1 className={styles.emptyTitle}>Loading...</h1>
                    </div>
                </div>
            </div>
        )
    }

    if (wishlist.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className="container">
                    <div className={styles.emptyContent}>
                        <Heart size={80} strokeWidth={1.5} />
                        <h1 className={styles.emptyTitle}>
                            {lang === 'bn' ? 'আপনার উইশলিস্ট খালি' : 'Your Wishlist is Empty'}
                        </h1>
                        <p className={styles.emptyText}>
                            {lang === 'bn'
                                ? 'পরে কেনার জন্য আপনার প্রিয় পণ্যগুলো এখানে সংরক্ষণ করুন'
                                : 'Save your favorite products here to purchase them later'
                            }
                        </p>
                        <Link href={`/${lang}/products`} className="btn-primary">
                            {lang === 'bn' ? 'পণ্য দেখুন' : 'Browse Products'}
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className="container">
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <Heart size={32} fill="var(--primary)" stroke="var(--primary)" />
                        <div>
                            <h1 className={styles.title}>
                                {lang === 'bn' ? 'আমার উইশলিস্ট' : 'My Wishlist'}
                            </h1>
                            <p className={styles.subtitle}>
                                {wishlist.length} {lang === 'bn' ? 'টি পণ্য সংরক্ষিত' : 'items saved'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.grid}>
                    {wishlist.map((item) => (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.title}
                                        className={styles.image}
                                        width={300}
                                        height={200}
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div className={styles.noImage}>
                                        <Package size={48} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.content}>
                                <Link href={`/${lang}/products/${item.id}`} className={styles.productTitle}>
                                    {lang === 'bn' && item.title_bengali ? item.title_bengali : item.title}
                                </Link>

                                <div className={styles.pricing}>
                                    <span className={styles.salePrice}>
                                        ৳{(item.sale_price || item.price).toLocaleString()}
                                    </span>
                                    {item.sale_price && item.sale_price < item.price && (
                                        <>
                                            <span className={styles.originalPrice}>
                                                ৳{item.price.toLocaleString()}
                                            </span>
                                            <span className={styles.discount}>
                                                {Math.round(((item.price - item.sale_price) / item.price) * 100)}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        className={styles.addToCart}
                                        onClick={() => handleAddToCart(item)}
                                    >
                                        <ShoppingCart size={18} />
                                        {lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
                                    </button>
                                    <button
                                        className={styles.removeButton}
                                        onClick={() => handleRemove(item.id)}
                                        aria-label="Remove from wishlist"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
