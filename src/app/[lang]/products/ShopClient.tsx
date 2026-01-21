'use client'

import { useState, useEffect, useMemo } from 'react'
import { Product, Category } from '@/types'
import ProductCard from '@/components/ProductCard'
import { Search, Filter, ArrowUpDown, X } from 'lucide-react'
import styles from './shop-client.module.css'
import { useSearchParams } from 'next/navigation'

interface ShopClientProps {
    products: Product[]
    categories: Category[]
    lang: string
    dict: any
}

type SortOption = 'popularity' | 'newest' | 'price_asc' | 'price_desc'

export default function ShopClient({ products: initialProducts, categories, lang, dict }: ShopClientProps) {
    const searchParams = useSearchParams();
    const initialCategorySlug = searchParams.get('category');
    const initialSearchQuery = searchParams.get('search') || '';

    // Find initial category ID if slug exists
    const initialCategoryId = initialCategorySlug
        ? categories.find(c => c.slug === initialCategorySlug)?.id
        : null;

    // State
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryId ? [initialCategoryId] : [])
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]) // Default max 50k
    const [inStockOnly, setInStockOnly] = useState(false)
    const [sortOption, setSortOption] = useState<SortOption>('popularity')
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return initialProducts.filter(product => {
            // Search
            const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            if (!matchesSearch) return false

            // Category Filter (ID Match)
            if (selectedCategoryIds.length > 0) {
                const productCatId = product.category_id;
                if (!productCatId || !selectedCategoryIds.includes(productCatId)) return false
            }

            // Price
            if (product.price < priceRange[0] || product.price > priceRange[1]) return false

            // Stock
            if (inStockOnly && product.stock_status !== 'in_stock') return false

            return true
        }).sort((a, b) => {
            switch (sortOption) {
                case 'price_asc': return (a.sale_price || a.price) - (b.sale_price || b.price)
                case 'price_desc': return (b.sale_price || b.price) - (a.sale_price || a.price)
                case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                case 'popularity':
                default:
                    // Fallback to review count or rating
                    return (b.review_count || 0) - (a.review_count || 0)
            }
        })
    }, [initialProducts, searchQuery, selectedCategoryIds, priceRange, inStockOnly, sortOption])

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        )
    }

    return (
        <div className={styles.shopContainer}>
            {/* Mobile Filter Toggle */}
            <button
                className={styles.mobileFilterBtn}
                onClick={() => setIsMobileFilterOpen(true)}
            >
                <Filter size={20} /> Filter Products
            </button>

            {/* Left Sidebar */}
            <aside className={`${styles.sidebar} ${isMobileFilterOpen ? styles.mobileOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <h3>Filter Products</h3>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setIsMobileFilterOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.filterSection}>
                    <h4>Categories</h4>
                    <div className={styles.checkboxGroup}>
                        {categories.map(cat => (
                            <label key={cat.id} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategoryIds.includes(cat.id)}
                                    onChange={() => handleCategoryToggle(cat.id)}
                                />
                                {lang === 'bn' ? (cat.name_bengali || cat.name) : cat.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.filterSection}>
                    <h4>Price Range (৳)</h4>
                    <div className={styles.rangeInputs}>
                        <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className={styles.priceInput}
                            placeholder="Min"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className={styles.priceInput}
                            placeholder="Max"
                        />
                    </div>
                </div>

                <div className={styles.filterSection}>
                    <h4>Availability</h4>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                        />
                        In Stock Only
                    </label>
                </div>
            </aside>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Top Bar */}
                <div className={styles.topBar}>
                    <div className={styles.searchWrapper}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search subscriptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.sortWrapper}>
                        {/* <ArrowUpDown size={18} /> */}
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className={styles.sortSelect}
                        >
                            <option value="popularity">Popularity</option>
                            <option value="newest">Newest Arrivals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Product Results */}
                {isLoading ? (
                    <div className={styles.grid}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={styles.skeletonCard}></div>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className={styles.grid}>
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                title={lang === 'bn' ? (product.title_bengali || product.title || '') : (product.title || '')}
                                price={product.price}
                                salePrice={product.sale_price}
                                image={product.image_url || ''}
                                rating={product.rating}
                                reviewCount={product.review_count}
                                badge={product.badge}
                                stockStatus={product.stock_status as 'in_stock' | 'out_of_stock'}
                                subscriptionType={product.subscription_type}
                                lang={lang}
                                dict={dict}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filters.</p>
                        <button
                            className={styles.resetBtn}
                            onClick={() => {
                                setSearchQuery('')
                                setSelectedCategoryIds([])
                                setPriceRange([0, 50000])
                                setInStockOnly(false)
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
