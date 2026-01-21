export interface Product {
    id: string
    title?: string
    title_bengali?: string
    description?: string
    description_bengali?: string
    price: number
    sale_price?: number
    subscription_type: string | null
    image_url: string | null
    status: string | null
    stock_status?: string
    badge?: string
    rating?: number
    review_count?: number
    is_featured?: boolean
    is_new?: boolean
    created_at: string
    category_id?: string
    category?: string
}

// Cart-specific type that extends Product with quantity
export interface CartItem extends Omit<Product, 'description' | 'description_bengali' | 'status' | 'created_at'> {
    quantity: number
}

export interface Category {
    id: string
    name: string
    slug: string
    name_bengali?: string
    icon?: string
}
