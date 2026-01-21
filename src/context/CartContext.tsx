'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem } from '@/types'

interface CartContextType {
    cart: CartItem[]
    addToCart: (product: CartItem) => void
    removeFromCart: (id: string) => void
    clearCart: () => void
    isCartOpen: boolean
    setIsCartOpen: (isOpen: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart))
            } catch (e) {
                console.error('Failed to parse cart from localStorage', e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(cart))
        }
    }, [cart, isLoaded])

    const addToCart = (product: CartItem) => {
        setCart((prev) => {
            // Basic implementation: prevent duplicates if that's desired, 
            // OR allow multiples. For a "subscription" type SaaS, usually 1 per type?
            // User didn't specify, so let's allow multiples for now, or just append.
            // Let's check if it's already there to avoid duplicates for now (better UX for subscriptions)
            if (prev.some((p) => p.id === product.id)) {
                return prev
            }
            return [...prev, product]
        })
        setIsCartOpen(true) // Auto open cart
    }

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id))
    }

    const clearCart = () => {
        setCart([])
    }

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isCartOpen, setIsCartOpen }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
