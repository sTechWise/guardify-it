import { supabase } from './supabase'

// Type definitions
export interface Category {
    id: string
    name: string
    name_bengali: string
    slug: string
    icon?: string
    description?: string
    product_count: number
    created_at: string
    updated_at: string
}

export interface Product {
    id: string
    title: string
    title_bengali?: string
    description?: string
    description_bengali?: string
    category_id: string
    price: number
    sale_price?: number
    currency: string
    image_url?: string
    rating: number
    review_count: number
    stock_status: 'in_stock' | 'out_of_stock'
    badge?: string
    is_featured: boolean
    is_new: boolean
    created_at: string
    updated_at: string
}

// Fetch all categories
export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return data as Category[]
}

// Fetch all products
export async function getProducts(filters?: {
    category?: string
    featured?: boolean
    newest?: boolean
    limit?: number
}) {
    let query = supabase
        .from('products')
        .select('*')
        .eq('stock_status', 'in_stock')

    // Apply filters
    if (filters?.category) {
        const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', filters.category)
            .single()

        if (category) {
            query = query.eq('category_id', category.id)
        }
    }

    if (filters?.featured) {
        query = query.eq('is_featured', true)
    }

    if (filters?.newest) {
        query = query.order('created_at', { ascending: false })
    } else {
        query = query.order('review_count', { ascending: false })
    }

    if (filters?.limit) {
        query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data as Product[]
}

// Fetch single product by ID
export async function getProductById(id: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching product:', error)
        return null
    }

    return data as Product
}

// Fetch featured products for homepage
export async function getFeaturedProducts(limit = 4) {
    return getProducts({ featured: true, limit })
}

// Fetch new arrivals
export async function getNewArrivals(limit = 4) {
    return getProducts({ newest: true, limit })
}

// Search products
export async function searchProducts(query: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`title.ilike.%${query}%,title_bengali.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('stock_status', 'in_stock')
        .limit(20)

    if (error) {
        console.error('Error searching products:', error)
        return []
    }

    return data as Product[]
}

// Fetch discounted products for Flash Deal
export async function getDiscountedProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('sale_price', 'is', null) // Only products with a sale price
        .eq('status', 'active')
        .eq('is_featured', false); // Exclude featured items to avoid duplication

    if (error) {
        console.error('Error fetching discounted products:', error);
        return [];
    }

    // Client-side filtering to ensure price < sale_price just in case
    return (data as Product[]).filter(p => p.sale_price && p.sale_price < p.price && p.image_url);
}
