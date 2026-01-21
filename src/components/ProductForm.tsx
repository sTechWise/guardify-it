'use client'

import styles from './product-form.module.css'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/context/ToastContext'
import { Loader2, Upload, ImageIcon, AlertCircle } from 'lucide-react'

interface Category {
    id: string
    name: string
    name_bengali: string | null
}

interface ProductFormProps {
    initialData?: any
    mode: 'create' | 'edit'
    lang?: string
}

export default function ProductForm({ initialData, mode, lang = 'en' }: ProductFormProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        title_bengali: '',
        description: '',
        description_bengali: '',
        price: 0,
        sale_price: null as number | null,
        currency: 'BDT',
        subscription_type: 'monthly',
        duration: '',
        image_url: '',
        category_id: '',
        status: 'active',
        is_featured: false,
        stock_status: 'in_stock',
        badge: '',
        rating: 5.0,
        review_count: 0
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                title_bengali: initialData.title_bengali || '',
                description: initialData.description || '',
                description_bengali: initialData.description_bengali || '',
                price: initialData.price || 0,
                sale_price: initialData.sale_price || null,
                currency: initialData.currency || 'BDT',
                subscription_type: initialData.subscription_type || 'monthly',
                duration: initialData.duration || '',
                image_url: initialData.image_url || '',
                category_id: initialData.category_id || '',
                status: initialData.status || 'active',
                is_featured: initialData.is_featured || false,
                stock_status: initialData.stock_status || 'in_stock',
                badge: initialData.badge || '',
                rating: initialData.rating || 5.0,
                review_count: initialData.review_count || 0
            })
        }
    }, [initialData])

    async function fetchCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, name_bengali')
            .order('name')

        if (!error && data) {
            setCategories(data)
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a valid image (JPEG, PNG, WebP, or GIF)')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB')
            return
        }

        setUploading(true)
        setError(null)

        try {
            // Delete old image if exists and is from our storage
            if (formData.image_url && formData.image_url.includes('product-images')) {
                try {
                    // Extract file path from URL
                    // URL format: https://xxx.supabase.co/storage/v1/object/public/product-images/products/filename.ext
                    const urlParts = formData.image_url.split('/product-images/')
                    if (urlParts.length > 1) {
                        const oldFilePath = urlParts[1] // e.g., "products/filename.ext"
                        console.log('Deleting old image:', oldFilePath)

                        const { error: deleteError } = await supabase.storage
                            .from('product-images')
                            .remove([oldFilePath])

                        if (deleteError) {
                            console.warn('Could not delete old image:', deleteError)
                            // Continue anyway - upload new image even if delete fails
                        } else {
                            console.log('Old image deleted successfully')
                        }
                    }
                } catch (delErr) {
                    console.warn('Error deleting old image:', delErr)
                    // Continue with upload
                }
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `products/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, image_url: publicUrl }))
            showToast('Image uploaded successfully', 'success')

        } catch (err: any) {
            console.error('Upload error:', err)
            setError(err.message || 'Failed to upload image')
        } finally {
            setUploading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Prepare data for submission
            const submitData = {
                ...formData,
                sale_price: formData.sale_price || null,
                category_id: formData.category_id || null,
                badge: formData.badge || null
            }

            if (mode === 'create') {
                const { error } = await supabase
                    .from('products')
                    .insert([submitData])

                if (error) throw error
                showToast('Product created successfully', 'success')
            } else {
                const { error } = await supabase
                    .from('products')
                    .update(submitData)
                    .eq('id', initialData?.id)

                if (error) throw error
                showToast('Product updated successfully', 'success')
            }

            router.push(`/${lang}/admin/products`)
            router.refresh()

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
                <div className={styles.error}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Basic Info */}
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>
                        Product Title <span className={styles.required}>*</span>
                    </label>
                    <input
                        type="text"
                        required
                        className={styles.input}
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Netflix Premium"
                    />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Title (Bengali)</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={formData.title_bengali}
                        onChange={e => setFormData({ ...formData, title_bengali: e.target.value })}
                        placeholder="e.g., নেটফ্লিক্স প্রিমিয়াম"
                    />
                </div>
            </div>

            {/* Description */}
            <div className={styles.group}>
                <label className={styles.label}>Description</label>
                <textarea
                    className={styles.textarea}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product..."
                />
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Description (Bengali)</label>
                <textarea
                    className={styles.textarea}
                    value={formData.description_bengali}
                    onChange={e => setFormData({ ...formData, description_bengali: e.target.value })}
                    placeholder="পণ্যের বিবরণ..."
                />
            </div>

            {/* Image Upload */}
            <div className={styles.group}>
                <label className={styles.label}>Product Image</label>
                <div className={styles.imageUpload}>
                    <div className={styles.imagePreview}>
                        {formData.image_url ? (
                            <img src={formData.image_url} alt="Product" />
                        ) : (
                            <div className={styles.imagePlaceholder}>
                                <ImageIcon size={32} />
                                <span>No image</span>
                            </div>
                        )}
                    </div>
                    <div className={styles.uploadArea}>
                        <button
                            type="button"
                            className={styles.uploadBtn}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={16} className={styles.spinner} />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Upload Image
                                </>
                            )}
                        </button>
                        <span className={styles.uploadHint}>JPEG, PNG, WebP or GIF (max 5MB)</span>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageUpload}
                        className={styles.fileInput}
                    />
                    {/* Fallback URL input */}
                    <input
                        type="url"
                        className={styles.input}
                        value={formData.image_url}
                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="Or paste image URL directly..."
                    />
                </div>
            </div>

            {/* Pricing Section */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Pricing</div>
                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>
                            Regular Price <span className={styles.required}>*</span>
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            className={styles.input}
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Sale Price</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={styles.input}
                            value={formData.sale_price || ''}
                            onChange={e => setFormData({ ...formData, sale_price: e.target.value ? parseFloat(e.target.value) : null })}
                            placeholder="Leave empty if no sale"
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Currency</label>
                        <select
                            className={styles.select}
                            value={formData.currency}
                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                        >
                            <option value="BDT">BDT (৳)</option>
                            <option value="USD">USD ($)</option>
                        </select>
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Subscription Type</label>
                        <select
                            className={styles.select}
                            value={formData.subscription_type}
                            onChange={e => setFormData({ ...formData, subscription_type: e.target.value })}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="lifetime">Lifetime</option>
                            <option value="one-time">One-time</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Details Section */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Product Details</div>
                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Category</label>
                        <select
                            className={styles.select}
                            value={formData.category_id}
                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                        >
                            <option value="">Select category...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Duration</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.duration}
                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            placeholder="e.g., 1 Month, 1 Year"
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Stock Status</label>
                        <select
                            className={styles.select}
                            value={formData.stock_status}
                            onChange={e => setFormData({ ...formData, stock_status: e.target.value })}
                        >
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Badge Text</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.badge}
                            onChange={e => setFormData({ ...formData, badge: e.target.value })}
                            placeholder="e.g., Best Seller, New"
                        />
                    </div>
                </div>
            </div>

            {/* Status & Featured Toggles */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Visibility</div>
                <div className={styles.row}>
                    <div className={styles.toggleGroup}>
                        <div className={styles.toggleLabel}>
                            <span>Product Status</span>
                            <span>{formData.status === 'active' ? 'Visible to customers' : 'Hidden from store'}</span>
                        </div>
                        <button
                            type="button"
                            className={`${styles.toggle} ${formData.status === 'active' ? styles.active : ''}`}
                            onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'inactive' : 'active' })}
                        />
                    </div>
                    <div className={styles.toggleGroup}>
                        <div className={styles.toggleLabel}>
                            <span>Featured Product</span>
                            <span>{formData.is_featured ? 'Shows in featured section' : 'Normal listing'}</span>
                        </div>
                        <button
                            type="button"
                            className={`${styles.toggle} ${formData.is_featured ? styles.active : ''}`}
                            onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                        />
                    </div>
                </div>
            </div>

            {/* Submit */}
            <button type="submit" className={styles.submitBtn} disabled={loading || uploading}>
                {loading ? (
                    <>
                        <Loader2 size={18} className={styles.spinner} />
                        Saving...
                    </>
                ) : (
                    mode === 'create' ? 'Create Product' : 'Update Product'
                )}
            </button>
        </form>
    )
}
