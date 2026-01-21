'use client'

import styles from '../products.module.css'
import ProductForm from '@/components/ProductForm'
import { useParams } from 'next/navigation'
import { Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateProductPage() {
    const params = useParams()
    const lang = params.lang as string || 'en'

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
                        <h1 className={styles.title}>Add New Product</h1>
                    </div>
                    <p className={styles.subtitle}>Create a new digital product for your store</p>
                </div>
            </div>

            <div style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '800px'
            }}>
                <ProductForm mode="create" lang={lang} />
            </div>
        </div>
    )
}
