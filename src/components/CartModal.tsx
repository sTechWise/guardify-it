'use client'

import { useCart } from '@/context/CartContext'
import styles from './cart-modal.module.css'
import { X, ShoppingBag, Trash2 } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'
import { Locale } from '@/i18n-config'

interface CartModalProps {
    isOpen: boolean
    onClose: () => void
    dict: any
}

export default function CartModal({ isOpen, onClose, dict }: CartModalProps) {
    const { cart, removeFromCart } = useCart()
    const router = useRouter()
    const params = useParams()
    const lang = (params?.lang as Locale) || 'en'

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const subtotal = cart.reduce((sum, item) => sum + (item.sale_price || item.price) * item.quantity, 0)

    const handleViewCart = () => {
        router.push(`/${lang}/cart`)
        onClose()
    }

    const handleCheckout = () => {
        router.push(`/${lang}/checkout`)
        onClose()
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`${styles.modal} ${isOpen ? styles.modalOpen : ''}`}>
                {/* Header */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <ShoppingBag size={24} />
                        {dict?.cart_title || 'Shopping Cart'}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {cart.length === 0 ? (
                        <div className={styles.empty}>
                            <ShoppingBag size={64} className={styles.emptyIcon} />
                            <p className={styles.emptyText}>{dict?.cart_empty || 'Your cart is empty'}</p>
                            <p style={{ fontSize: '0.9rem' }}>{dict?.cart_start_adding || 'Add some products to get started!'}</p>
                        </div>
                    ) : (
                        <div className={styles.cartItems}>
                            {cart.map((item) => (
                                <div key={item.id} className={styles.cartItem}>
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.title} className={styles.itemImage} />
                                    ) : (
                                        <div className={styles.itemImage} />
                                    )}

                                    <div className={styles.itemDetails}>
                                        <h3 className={styles.itemName}>{item.title}</h3>
                                        <p className={styles.itemVariant}>Qty: {item.quantity}</p>
                                        <p className={styles.itemPrice}>৳{item.price.toLocaleString()}</p>
                                    </div>

                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => removeFromCart(item.id)}
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.subtotal}>
                            <span className={styles.subtotalLabel}>{dict?.subtotal || 'Subtotal'}</span>
                            <span className={styles.subtotalAmount}>৳{subtotal.toLocaleString()}</span>
                        </div>

                        <div className={styles.actions}>
                            <button className={styles.checkoutBtn} onClick={handleCheckout}>
                                {dict?.proceed_checkout || 'Proceed to Checkout'}
                            </button>
                            <button className={styles.viewCartBtn} onClick={handleViewCart}>
                                {dict?.view_cart || 'View Cart'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
