'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from './AuthContext'

interface WishlistItem {
    id: string
    title: string
    title_bengali?: string
    price: number
    sale_price?: number | null
    image_url?: string
    subscription_type?: string
}

interface WishlistContextType {
    wishlist: WishlistItem[]
    addToWishlist: (product: WishlistItem) => void
    removeFromWishlist: (id: string) => void
    isInWishlist: (id: string) => boolean
    clearWishlist: () => void
    isLoaded: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const STORAGE_KEY = 'wishlist'

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const { user } = useAuth()
    const supabase = createClient()
    const previousUserRef = useRef(user)

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem(STORAGE_KEY)
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist))
            } catch (e) {
                console.error('Failed to parse wishlist from localStorage', e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist))
        }
    }, [wishlist, isLoaded])

    // Clear wishlist on logout (when user was logged in but is now null)
    useEffect(() => {
        const previousUser = previousUserRef.current

        // Detect logout: previous user existed, now user is null
        if (previousUser && !user && isLoaded) {
            console.log('[Wishlist] User logged out, clearing wishlist')
            setWishlist([])
            localStorage.removeItem(STORAGE_KEY)
        }

        // Update previous user ref
        previousUserRef.current = user
    }, [user, isLoaded])

    // Sync with database when user logs in
    useEffect(() => {
        if (user && isLoaded) {
            syncWithDatabase()
        }
    }, [user, isLoaded])

    async function syncWithDatabase() {
        if (!user) return

        try {
            // Fetch user's wishlist from database
            const { data: dbWishlist, error } = await supabase
                .from('wishlists')
                .select('product_id')
                .eq('user_id', user.id)

            if (error) {
                console.error('Error fetching wishlist from database:', error)
                return
            }

            // Get product details for wishlist items
            if (dbWishlist && dbWishlist.length > 0) {
                const productIds = dbWishlist.map(w => w.product_id)
                const { data: products } = await supabase
                    .from('products')
                    .select('id, title, title_bengali, price, sale_price, image_url, subscription_type')
                    .in('id', productIds)

                if (products) {
                    // Merge with local wishlist (avoid duplicates)
                    const merged = [...wishlist]
                    products.forEach(product => {
                        if (!merged.some(item => item.id === product.id)) {
                            merged.push(product)
                        }
                    })
                    setWishlist(merged)
                }
            }

            // Sync local items to database
            for (const item of wishlist) {
                const { error: insertError } = await supabase
                    .from('wishlists')
                    .upsert({
                        user_id: user.id,
                        product_id: item.id
                    }, { onConflict: 'user_id,product_id' })

                if (insertError) {
                    console.error('Error syncing wishlist item:', insertError)
                }
            }
        } catch (err) {
            console.error('Wishlist sync error:', err)
        }
    }

    const addToWishlist = async (product: WishlistItem) => {
        // Check if already in wishlist
        if (wishlist.some(item => item.id === product.id)) {
            return
        }

        setWishlist(prev => [...prev, product])

        // Sync to database if logged in
        if (user) {
            const { error } = await supabase
                .from('wishlists')
                .upsert({
                    user_id: user.id,
                    product_id: product.id
                }, { onConflict: 'user_id,product_id' })

            if (error) {
                console.error('Error adding to wishlist in database:', error)
            }
        }
    }

    const removeFromWishlist = async (id: string) => {
        setWishlist(prev => prev.filter(item => item.id !== id))

        // Remove from database if logged in
        if (user) {
            const { error } = await supabase
                .from('wishlists')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', id)

            if (error) {
                console.error('Error removing from wishlist in database:', error)
            }
        }
    }

    const isInWishlist = (id: string) => {
        return wishlist.some(item => item.id === id)
    }

    const clearWishlist = async () => {
        setWishlist([])

        // Clear from database if logged in
        if (user) {
            const { error } = await supabase
                .from('wishlists')
                .delete()
                .eq('user_id', user.id)

            if (error) {
                console.error('Error clearing wishlist from database:', error)
            }
        }
    }

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            clearWishlist,
            isLoaded
        }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}
