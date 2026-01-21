'use client'

import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { Product } from '@/types'
import { useEffect, useState } from 'react'

interface AddToCartButtonProps {
    product: Product
    className?: string
    customLabel?: string
    dict?: any
}

export default function AddToCartButton({ product, className, dict, customLabel }: AddToCartButtonProps) {
    const { addToCart, cart } = useCart()
    const { showToast } = useToast()
    const [isAdded, setIsAdded] = useState(false)

    useEffect(() => {
        setIsAdded(cart.some((p) => p.id === product.id))
    }, [cart, product.id])

    const handleAddToCart = () => {
        if (!isAdded) {
            addToCart({
                id: product.id,
                title: product.title,
                price: product.price,
                sale_price: product.sale_price,
                image_url: product.image_url,
                subscription_type: product.subscription_type,
                quantity: 1,
            } as unknown as import('@/types').CartItem)
            showToast(dict?.added_to_cart || `Added ${product.title} to cart`)
        }
    }

    return (
        <button
            onClick={handleAddToCart}
            className={className}
            disabled={isAdded}
            style={isAdded ? { opacity: 0.7, cursor: 'default' } : {}}
        >
            {isAdded ? (dict?.in_cart || 'In Cart') : (customLabel || dict?.add_to_cart || 'Add to Cart')}
        </button>
    )
}
