// ==========================================
// Guardify IT — Unified Type Definitions
// Single source of truth for all data types
// ==========================================

/**
 * SubscriptionPlan — a single duration+price option for a product.
 * Stored as JSONB array in the products.subscription_plans column.
 * Example: [{ duration: "1 Month", price: 250 }, { duration: "1 Year", price: 2000, sale_price: 1800 }]
 */
export interface SubscriptionPlan {
    duration: string
    price: number
    sale_price?: number | null
}

/**
 * Product — matches the live Supabase `products` table exactly.
 */
export interface Product {
    id: string
    title: string
    title_bengali?: string
    description?: string
    description_bengali?: string
    price: number
    sale_price?: number
    currency?: string
    subscription_type?: string
    duration?: string
    subscription_plans?: SubscriptionPlan[]
    image_url?: string
    status?: string
    stock_status?: 'in_stock' | 'out_of_stock'
    badge?: string
    rating?: number
    review_count?: number
    is_featured?: boolean
    is_new?: boolean
    delivery_method?: string
    delivery_time?: string
    warranty_period?: string
    support_available?: boolean
    category_id?: string
    created_at?: string
    updated_at?: string
}

/**
 * CartItem — Product subset with quantity for the shopping cart.
 * Stored in localStorage.
 */
export interface CartItem {
    id: string
    title: string
    title_bengali?: string
    price: number
    sale_price?: number
    image_url?: string
    quantity: number
    stock_status?: 'in_stock' | 'out_of_stock'
    badge?: string
    rating?: number
    review_count?: number
    is_featured?: boolean
    is_new?: boolean
    subscription_type?: string
    duration?: string
    category_id?: string
    category?: string
}

/**
 * Category — matches the live Supabase `categories` table.
 */
export interface Category {
    id: string
    name: string
    slug: string
    name_bengali?: string
    icon?: string
    description?: string
    product_count?: number
    created_at?: string
}

/**
 * Order — matches the live Supabase `orders` table.
 */
export interface Order {
    id: string
    user_email: string
    total_amount: number
    status: OrderStatus
    items: OrderItem[]
    user_id?: string
    created_at?: string
}

/**
 * OrderItem — individual item stored in the orders.items JSONB column.
 */
export interface OrderItem {
    id: string
    name?: string
    price?: number
    quantity?: number
    duration?: string
}

/**
 * Order status lifecycle:
 *   pending_payment → payment_submitted → paid → completed
 *                                       → payment_failed
 *                                       → cancelled
 */
export type OrderStatus =
    | 'pending_payment'
    | 'payment_submitted'
    | 'paid'
    | 'payment_failed'
    | 'completed'
    | 'cancelled'

/**
 * PaymentProof — matches the live Supabase `payment_proofs` table.
 */
export interface PaymentProof {
    id: string
    order_id?: string
    user_email?: string
    payment_method?: string
    transaction_id?: string
    screenshot_url?: string
    status: PaymentProofStatus
    submitted_at?: string
}

export type PaymentProofStatus = 'submitted' | 'approved' | 'rejected'

/**
 * UserRole — matches the live Supabase `user_roles` table.
 */
export interface UserRole {
    user_id: string
    role: 'admin' | 'moderator' | 'user'
}

/**
 * WishlistItem — matches the live Supabase `wishlists` table.
 */
export interface WishlistItem {
    id: string
    user_id: string
    product_id: string
    created_at?: string
}
