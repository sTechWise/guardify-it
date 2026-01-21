'use client'

import styles from '../products.module.css'
import ProductForm from '@/components/ProductForm'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/context/ToastContext'
import { Package, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage() {
    const params = useParams()
    const router = useRouter()
    const lang = params.lang as string || 'en'
    const productId = params.id as string
    const { showToast } = useToast()
    const supabase = createClient()

    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProduct()
    }, [productId])

    async function fetchProduct() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single()

        if (error) {
            console.error(error)
            showToast('Product not found', 'error')
            router.push(`/${lang}/admin/products`)
        } else {
            setProduct(data)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <Loader2 size={32} className={styles.spinner} />
                <p>Loading product...</p>
            </div>
        )
    }

    if (!product) {
        return (
            <div className={styles.emptyState}>
                <Package size={48} className={styles.emptyIcon} />
                <h2>Product not found</h2>
                <p>The product you're looking for doesn't exist or has been deleted.</p>
                <Link href={`/${lang}/admin/products`} className={styles.addBtn} style={{ marginTop: '1rem' }}>
                    <ArrowLeft size={18} />
                    Back to Products
                </Link>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link
                        href={`/${lang}/admin/products`}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--muted)',
                            fontSize: '0.9rem',
                            marginBottom: '0.5rem',
                            textDecoration: 'none'
                        }}
                    >
                        <ArrowLeft size={16} />
                        Back to Products
                    </Link>
                    <div className={styles.titleRow}>
                        <Package size={28} className={styles.titleIcon} />
                        <h1 className={styles.title}>Edit Product</h1>
                    </div>
                    <p className={styles.subtitle}>Update product details and settings</p>
                </div>
            </div>

            <div style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '800px'
            }}>
                <ProductForm mode="edit" initialData={product} lang={lang} />
            </div>
        </div>
    )
}
