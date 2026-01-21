'use client'

import styles from './categories.module.css'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/context/ToastContext'
import {
    FolderOpen,
    Plus,
    Loader2,
    Edit2,
    Trash2,
    X,
    Package,
    Hash,
    Layers
} from 'lucide-react'

interface Category {
    id: string
    name: string
    name_bengali: string | null
    slug: string
    description: string | null
    icon: string | null
    product_count?: number
}

export default function CategoriesPage() {
    const { showToast } = useToast()
    const supabase = createClient()

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        name_bengali: '',
        slug: '',
        description: '',
        icon: ''
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        // Fetch categories with product count
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (error) {
            console.error(error)
            showToast('Failed to fetch categories', 'error')
        } else {
            // Fetch product counts for each category
            const categoriesWithCounts = await Promise.all(
                (data || []).map(async (cat) => {
                    const { count } = await supabase
                        .from('products')
                        .select('*', { count: 'exact', head: true })
                        .eq('category_id', cat.id)
                    return { ...cat, product_count: count || 0 }
                })
            )
            setCategories(categoriesWithCounts)
        }
        setLoading(false)
    }

    function openModal(category?: Category) {
        if (category) {
            setEditingCategory(category)
            setFormData({
                name: category.name,
                name_bengali: category.name_bengali || '',
                slug: category.slug,
                description: category.description || '',
                icon: category.icon || ''
            })
        } else {
            setEditingCategory(null)
            setFormData({
                name: '',
                name_bengali: '',
                slug: '',
                description: '',
                icon: ''
            })
        }
        setModalOpen(true)
    }

    function closeModal() {
        setModalOpen(false)
        setEditingCategory(null)
        setFormData({
            name: '',
            name_bengali: '',
            slug: '',
            description: '',
            icon: ''
        })
    }

    function generateSlug(name: string) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        try {
            const submitData = {
                name: formData.name,
                name_bengali: formData.name_bengali || null,
                slug: formData.slug || generateSlug(formData.name),
                description: formData.description || null,
                icon: formData.icon || null
            }

            if (editingCategory) {
                const { error } = await supabase
                    .from('categories')
                    .update(submitData)
                    .eq('id', editingCategory.id)

                if (error) throw error
                showToast('Category updated successfully', 'success')
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([submitData])

                if (error) throw error
                showToast('Category created successfully', 'success')
            }

            closeModal()
            fetchCategories()
        } catch (error: any) {
            console.error(error)
            showToast(error.message || 'An error occurred', 'error')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string, name: string) {
        console.log('handleDelete called:', { id, name })

        try {
            // First, unlink products from this category (set category_id to null)
            const { error: unlinkError } = await supabase
                .from('products')
                .update({ category_id: null })
                .eq('category_id', id)

            if (unlinkError) {
                console.error('Error unlinking products:', unlinkError)
                // Continue anyway - there might not be any products
            }

            // Now delete the category
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Delete error:', error)
                showToast(`Failed to delete: ${error.message}`, 'error')
            } else {
                console.log('Category deleted successfully')
                showToast('Category deleted', 'success')
                setCategories(prev => prev.filter(c => c.id !== id))
            }
        } catch (err: any) {
            console.error('Delete exception:', err)
            showToast(err.message || 'Failed to delete category', 'error')
        }
    }

    const totalProducts = categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0)

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.titleRow}>
                        <FolderOpen size={28} className={styles.titleIcon} />
                        <h1 className={styles.title}>Categories</h1>
                    </div>
                    <p className={styles.subtitle}>Organize your products into categories for better navigation</p>
                    {!loading && categories.length > 0 && (
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <Layers size={16} />
                                <strong>{categories.length}</strong> categories
                            </div>
                            <div className={styles.stat}>
                                <Package size={16} />
                                <strong>{totalProducts}</strong> total products
                            </div>
                        </div>
                    )}
                </div>
                <button className={styles.addBtn} onClick={() => openModal()}>
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className={styles.loadingState}>
                    <Loader2 size={32} className={styles.spinner} />
                    <p>Loading categories...</p>
                </div>
            ) : categories.length === 0 ? (
                <div className={styles.emptyState}>
                    <FolderOpen size={56} className={styles.emptyIcon} />
                    <h2>No categories yet</h2>
                    <p>Create categories to organize your products and improve discoverability.</p>
                    <button className={styles.addBtn} onClick={() => openModal()} style={{ marginTop: '1.5rem' }}>
                        <Plus size={20} />
                        Create Your First Category
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {categories.map(category => (
                        <div key={category.id} className={styles.categoryCard}>
                            <div className={styles.cardContent}>
                                <div className={styles.categoryInfo}>
                                    <div className={styles.categoryName}>
                                        {category.name}
                                    </div>
                                    {category.name_bengali && (
                                        <div className={styles.categoryBengali}>
                                            {category.name_bengali}
                                        </div>
                                    )}
                                    <div className={styles.categoryMeta}>
                                        <span className={styles.categorySlug}>
                                            <Hash size={12} />
                                            {category.slug}
                                        </span>
                                        <span className={styles.categoryCount}>
                                            <Package size={14} />
                                            {category.product_count || 0} products
                                        </span>
                                    </div>
                                    {category.description && (
                                        <p className={styles.categoryDescription}>
                                            {category.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className={styles.cardFooter}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => openModal(category)}
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(category.id, category.name)}
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>
                                <FolderOpen size={20} />
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button className={styles.closeBtn} onClick={closeModal}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.form}>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>
                                                Name <span className={styles.required}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className={styles.input}
                                                value={formData.name}
                                                onChange={e => {
                                                    setFormData({
                                                        ...formData,
                                                        name: e.target.value,
                                                        slug: formData.slug || generateSlug(e.target.value)
                                                    })
                                                }}
                                                placeholder="e.g., Streaming Services"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Name (Bengali)</label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                value={formData.name_bengali}
                                                onChange={e => setFormData({ ...formData, name_bengali: e.target.value })}
                                                placeholder="e.g., স্ট্রিমিং সার্ভিস"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Slug</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                            placeholder="streaming-services"
                                        />
                                        <span className={styles.hint}>URL-friendly identifier</span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Description</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Brief description of this category..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn} disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 size={18} className={styles.spinner} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            {editingCategory ? 'Update Category' : 'Create Category'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
