'use client'

import styles from './dashboard.module.css'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    ClipboardList,
    Package,
    DollarSign,
    Clock,
    Plus,
    Eye,
    FolderOpen,
    CheckCircle,
    Radio
} from 'lucide-react'

interface Stats {
    totalOrders: number
    totalProducts: number
    totalRevenue: number
    pendingOrders: number
}

interface RecentOrder {
    id: string
    user_email: string
    total_amount: number
    status: string
    created_at: string
}

export default function AdminDashboardPage() {
    const params = useParams()
    const lang = params.lang as string || 'en'
    const supabase = createClient()

    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        pendingOrders: 0
    })
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()

        // Subscribe to real-time changes on orders table
        const ordersChannel = supabase
            .channel('dashboard-orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    console.log('Orders changed, refreshing dashboard...')
                    fetchDashboardData()
                }
            )
            .subscribe()

        // Subscribe to real-time changes on products table
        const productsChannel = supabase
            .channel('dashboard-products')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'products' },
                () => {
                    console.log('Products changed, refreshing dashboard...')
                    fetchDashboardData()
                }
            )
            .subscribe()

        // Cleanup subscriptions on unmount
        return () => {
            supabase.removeChannel(ordersChannel)
            supabase.removeChannel(productsChannel)
        }
    }, [])

    async function fetchDashboardData() {
        try {
            // Fetch orders count
            const { count: ordersCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })

            // Fetch products count
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })

            // Fetch pending orders count
            const { count: pendingCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'payment_submitted')

            // Calculate total revenue from paid orders
            const { data: paidOrders } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('status', 'paid')

            const revenue = paidOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

            setStats({
                totalOrders: ordersCount || 0,
                totalProducts: productsCount || 0,
                totalRevenue: revenue,
                pendingOrders: pendingCount || 0
            })

            // Fetch recent orders
            const { data: orders } = await supabase
                .from('orders')
                .select('id, user_email, total_amount, status, created_at')
                .order('created_at', { ascending: false })
                .limit(5)

            setRecentOrders(orders || [])
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
            case 'completed':
                return { label: 'Paid', className: styles.statusPaid }
            default:
                return { label: status.replace(/_/g, ' '), className: styles.statusPending }
        }
    }

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <span className={styles.liveBadge}>
                        <Radio size={12} />
                        LIVE
                    </span>
                </div>
                <p className={styles.subtitle}>Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.orders}`}>
                        <ClipboardList size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statLabel}>Total Orders</div>
                        <div className={styles.statValue}>{stats.totalOrders}</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.products}`}>
                        <Package size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statLabel}>Products</div>
                        <div className={styles.statValue}>{stats.totalProducts}</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.revenue}`}>
                        <DollarSign size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statLabel}>Revenue</div>
                        <div className={styles.statValue}>৳{stats.totalRevenue.toLocaleString()}</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.pending}`}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <div className={styles.statLabel}>Pending Review</div>
                        <div className={styles.statValue}>{stats.pendingOrders}</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                </div>
                <div className={styles.actionsGrid}>
                    <Link href={`/${lang}/admin/products/new`} className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <Plus size={20} />
                        </div>
                        <div className={styles.actionText}>
                            <div className={styles.actionTitle}>Add Product</div>
                            <div className={styles.actionDesc}>Create a new product</div>
                        </div>
                    </Link>
                    <Link href={`/${lang}/admin/orders`} className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <Eye size={20} />
                        </div>
                        <div className={styles.actionText}>
                            <div className={styles.actionTitle}>Review Orders</div>
                            <div className={styles.actionDesc}>Approve pending payments</div>
                        </div>
                    </Link>
                    <Link href={`/${lang}/admin/categories`} className={styles.actionCard}>
                        <div className={styles.actionIcon}>
                            <FolderOpen size={20} />
                        </div>
                        <div className={styles.actionText}>
                            <div className={styles.actionTitle}>Manage Categories</div>
                            <div className={styles.actionDesc}>Organize your products</div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Recent Orders */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Recent Orders</h2>
                    <Link href={`/${lang}/admin/orders`} className={styles.viewAll}>
                        View all →
                    </Link>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.emptyRow}>
                                        No orders yet
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map(order => {
                                    const status = getStatusBadge(order.status)
                                    return (
                                        <tr key={order.id}>
                                            <td>
                                                <span className={styles.orderId}>
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td>{order.user_email}</td>
                                            <td>৳{order.total_amount.toLocaleString()}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
