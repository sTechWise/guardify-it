'use client'

import styles from './products.module.css'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useToast } from '@/context/ToastContext'
import { Package, Plus, Loader2, Edit2, Trash2, CheckCircle, XCircle, ImageIcon } from 'lucide-react'

interface Product {
    id: string
    title: string
    price: number
    sale_price: number | null
    subscription_type: string
    image_url: string | null
    status: string
    is_featured: boolean
    created_at: string
}

export default function AdminProductsPage() {
    const params = useParams()
    const lang = params.lang as string || 'en'
    const { showToast } = useToast()
    const supabase = createClient()

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error(error)
            showToast('Failed to fetch products', 'error')
        } else {
            setProducts(data || [])
        }
        setLoading(false)
    }

    async function handleToggleStatus(product: Product) {
        setTogglingId(product.id)
        const newStatus = product.status === 'active' ? 'inactive' : 'active'

        const { error } = await supabase
            .from('products')
            .update({ status: newStatus })
            .eq('id', product.id)

        if (error) {
            showToast('Failed to update status', 'error')
        } else {
            showToast(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success')
            setProducts(prev => prev.map(p =>
                p.id === product.id ? { ...p, status: newStatus } : p
            ))
        }
        setTogglingId(null)
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) {
            showToast('Delete failed. Product may be linked to orders.', 'error')
        } else {
            showToast('Product deleted', 'success')
            setProducts(prev => prev.filter(p => p.id !== id))
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return { label: 'Active', className: styles.statusActive, icon: <CheckCircle size={14} /> }
            case 'inactive':
                return { label: 'Inactive', className: styles.statusInactive, icon: <XCircle size={14} /> }
            default:
                return { label: status, className: styles.statusDraft, icon: null }
        }
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.titleRow}>
                        <Package size={28} className={styles.titleIcon} />
                        <h1 className={styles.title}>Products</h1>
                    </div>
                    <p className={styles.subtitle}>Manage your digital products and subscriptions</p>
                </div>
                <Link href={`/${lang}/admin/products/new`} className={styles.addBtn}>
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* Content */}
            {loading ? (
                <div className={styles.loadingState}>
                    <Loader2 size={24} className={styles.spinner} />
                    <p>Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                    <Package size={48} className={styles.emptyIcon} />
                    <h2>No products yet</h2>
                    <p>Create your first product to get started.</p>
                    <Link href={`/${lang}/admin/products/new`} className={styles.addBtn} style={{ marginTop: '1rem' }}>
                        <Plus size={18} />
                        Add Product
                    </Link>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.imageCell}>Image</th>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => {
                                const status = getStatusBadge(product.status)
                                const isToggling = togglingId === product.id

                                return (
                                    <tr key={product.id}>
                                        <td className={styles.imageCell}>
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.title}
                                                    className={styles.productImage}
                                                />
                                            ) : (
                                                <div className={styles.noImage}>
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={styles.productTitle}>{product.title}</span>
                                        </td>
                                        <td>
                                            <span className={styles.price}>
                                                ৳{(product.sale_price || product.price).toLocaleString()}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.type}>{product.subscription_type}</span>
                                        </td>
                                        <td>
                                            <div className={styles.toggleWrapper}>
                                                <button
                                                    className={`${styles.toggle} ${product.status === 'active' ? styles.active : ''}`}
                                                    onClick={() => handleToggleStatus(product)}
                                                    disabled={isToggling}
                                                    title={product.status === 'active' ? 'Click to deactivate' : 'Click to activate'}
                                                />
                                                <span className={`${styles.statusBadge} ${status.className}`}>
                                                    {status.icon}
                                                    {status.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Link
                                                    href={`/${lang}/admin/products/${product.id}`}
                                                    className={styles.editBtn}
                                                >
                                                    <Edit2 size={14} />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className={styles.deleteBtn}
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
