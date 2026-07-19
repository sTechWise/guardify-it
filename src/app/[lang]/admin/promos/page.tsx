'use client'

import styles from './promos.module.css'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/context/ToastContext'
import {
    Plus,
    Trash2,
    Users,
    Tag,
    X,
    Check,
    ToggleLeft,
    ToggleRight
} from 'lucide-react'

interface Partner {
    id: string
    name: string
    email: string | null
    phone: string | null
    code_prefix: string
    created_at: string
    promo_codes?: PromoCode[]
}

interface PromoCode {
    id: string
    code: string
    partner_id: string | null
    discount_type: 'fixed' | 'percentage'
    discount_value: number
    usage_limit: number | null
    usage_count: number
    expiry_date: string | null
    is_active: boolean
    created_at: string
    partner?: {
        name: string
    } | null
}

export default function AdminPromosPage() {
    const supabase = createClient()
    const { showToast } = useToast()

    // UI state
    const [activeTab, setActiveTab] = useState<'promos' | 'partners'>('promos')
    const [loading, setLoading] = useState(true)
    const [partners, setPartners] = useState<Partner[]>([])
    const [promos, setPromos] = useState<PromoCode[]>([])

    // Modals
    const [partnerModalOpen, setPartnerModalOpen] = useState(false)
    const [promoModalOpen, setPromoModalOpen] = useState(false)

    // Form inputs: Partner
    const [partnerName, setPartnerName] = useState('')
    const [partnerEmail, setPartnerEmail] = useState('')
    const [partnerPhone, setPartnerPhone] = useState('')
    const [partnerPrefix, setPartnerPrefix] = useState('')
    
    // Auto-create promo with partner toggle ("merge" function)
    const [autoCreatePromo, setAutoCreatePromo] = useState(false)
    const [autoPromoValue, setAutoPromoValue] = useState(10)
    const [autoPromoType, setAutoPromoType] = useState<'fixed' | 'percentage'>('percentage')

    // Form inputs: Promo Code
    const [promoCodeString, setPromoCodeString] = useState('')
    const [selectedPartnerId, setSelectedPartnerId] = useState('')
    const [promoDiscountType, setPromoDiscountType] = useState<'fixed' | 'percentage'>('percentage')
    const [promoDiscountValue, setPromoDiscountValue] = useState(0)
    const [promoUsageLimit, setPromoUsageLimit] = useState('')
    const [promoExpiryDate, setPromoExpiryDate] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        try {
            // Fetch partners
            const { data: partnersData, error: partnersErr } = await supabase
                .from('partners')
                .select('*')
                .order('created_at', { ascending: false })

            if (partnersErr) throw partnersErr

            // Fetch promo codes and join with partners
            const { data: promosData, error: promosErr } = await supabase
                .from('promo_codes')
                .select('*, partner:partners(name)')
                .order('created_at', { ascending: false })

            if (promosErr) throw promosErr

            // Map promo codes into partners
            const mappedPartners = (partnersData || []).map(p => ({
                ...p,
                promo_codes: (promosData || []).filter(c => c.partner_id === p.id)
            }))

            setPartners(mappedPartners)
            setPromos(promosData || [])
        } catch (err: any) {
            console.error('Error fetching promo dashboard data:', err)
            showToast(`Failed to load promos: ${err.message}`, 'error')
        } finally {
            setLoading(false)
        }
    }

    // CREATE PARTNER (includes optional merged promo code generation)
    async function handleCreatePartner(e: React.FormEvent) {
        e.preventDefault()
        if (!partnerName.trim() || !partnerPrefix.trim()) {
            showToast('Name and Code Prefix are required.', 'error')
            return
        }

        try {
            // 1. Insert Partner
            const { data: partnerData, error: partnerErr } = await supabase
                .from('partners')
                .insert({
                    name: partnerName,
                    email: partnerEmail || null,
                    phone: partnerPhone || null,
                    code_prefix: partnerPrefix.toUpperCase().trim()
                })
                .select()
                .single()

            if (partnerErr) throw partnerErr

            // 2. Optional Merged Promo Code creation
            if (autoCreatePromo && partnerData) {
                const calculatedPromoCode = `${partnerPrefix.toUpperCase().trim()}${autoPromoValue}`
                const { error: promoErr } = await supabase
                    .from('promo_codes')
                    .insert({
                        code: calculatedPromoCode,
                        partner_id: partnerData.id,
                        discount_type: autoPromoType,
                        discount_value: autoPromoValue,
                        is_active: true
                    })

                if (promoErr) {
                    showToast(`Partner created, but failed to auto-generate promo: ${promoErr.message}`, 'error')
                } else {
                    showToast(`Partner and promo code ${calculatedPromoCode} successfully merged & created!`, 'success')
                }
            } else {
                showToast('Partner profile created successfully!', 'success')
            }

            // Reset inputs
            setPartnerName('')
            setPartnerEmail('')
            setPartnerPhone('')
            setPartnerPrefix('')
            setAutoCreatePromo(false)
            setPartnerModalOpen(false)
            fetchData()
        } catch (err: any) {
            showToast(`Failed to create partner: ${err.message}`, 'error')
        }
    }

    // CREATE PROMO CODE MANUALLY
    async function handleCreatePromo(e: React.FormEvent) {
        e.preventDefault()
        if (!promoCodeString.trim() || promoDiscountValue <= 0) {
            showToast('Valid promo code name and positive discount values are required.', 'error')
            return
        }

        try {
            const cleanLimit = promoUsageLimit ? parseInt(promoUsageLimit) : null
            const cleanExpiry = promoExpiryDate ? new Date(promoExpiryDate).toISOString() : null

            const { error } = await supabase
                .from('promo_codes')
                .insert({
                    code: promoCodeString.toUpperCase().trim(),
                    partner_id: selectedPartnerId || null,
                    discount_type: promoDiscountType,
                    discount_value: promoDiscountValue,
                    usage_limit: cleanLimit,
                    expiry_date: cleanExpiry,
                    is_active: true
                })

            if (error) throw error

            showToast(`Promo code ${promoCodeString.toUpperCase()} created successfully!`, 'success')
            setPromoCodeString('')
            setSelectedPartnerId('')
            setPromoDiscountValue(0)
            setPromoUsageLimit('')
            setPromoExpiryDate('')
            setPromoModalOpen(false)
            fetchData()
        } catch (err: any) {
            showToast(`Failed to create promo code: ${err.message}`, 'error')
        }
    }

    // TOGGLE STATUS
    async function togglePromoStatus(id: string, currentStatus: boolean) {
        try {
            const { error } = await supabase
                .from('promo_codes')
                .update({ is_active: !currentStatus })
                .eq('id', id)

            if (error) throw error

            showToast(`Promo code status updated!`, 'success')
            fetchData()
        } catch (err: any) {
            showToast(`Failed to toggle status: ${err.message}`, 'error')
        }
    }

    // DELETE PROMO
    async function handleDeletePromo(id: string) {
        if (!confirm('Are you sure you want to delete this promo code? This action cannot be undone.')) return
        try {
            const { error } = await supabase
                .from('promo_codes')
                .delete()
                .eq('id', id)

            if (error) throw error

            showToast('Promo code deleted successfully.', 'success')
            fetchData()
        } catch (err: any) {
            showToast(`Failed to delete promo code: ${err.message}`, 'error')
        }
    }

    // DELETE PARTNER
    async function handleDeletePartner(id: string) {
        if (!confirm('Deleting this partner will unlink their associated promo codes. Continue?')) return
        try {
            const { error } = await supabase
                .from('partners')
                .delete()
                .eq('id', id)

            if (error) throw error

            showToast('Partner deleted successfully.', 'success')
            fetchData()
        } catch (err: any) {
            showToast(`Failed to delete partner: ${err.message}`, 'error')
        }
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1>Partners &amp; Promo Codes</h1>
                    <p>Manage influencer discount codes, commissions, and track customer referrals.</p>
                </div>
                <div className={styles.actions}>
                    {activeTab === 'promos' ? (
                        <button className={styles.primaryBtn} onClick={() => setPromoModalOpen(true)}>
                            <Plus size={18} /> Create Promo Code
                        </button>
                    ) : (
                        <button className={styles.primaryBtn} onClick={() => setPartnerModalOpen(true)}>
                            <Plus size={18} /> Add Partner
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'promos' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('promos')}
                >
                    <Tag size={16} style={{ marginRight: '8px', display: 'inline' }} />
                    Promo Codes ({promos.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'partners' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('partners')}
                >
                    <Users size={16} style={{ marginRight: '8px', display: 'inline' }} />
                    Partners ({partners.length})
                </button>
            </div>

            {/* Loading Indicator */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <p style={{ color: 'var(--muted)' }}>Loading promotional records...</p>
                </div>
            ) : (
                <div className={styles.card}>
                    {activeTab === 'promos' ? (
                        /* PROMO CODES TAB */
                        <div className={styles.tableWrapper}>
                            {promos.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Tag size={40} />
                                    <p>No promo codes found.</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Partner</th>
                                            <th>Discount Type</th>
                                            <th>Value</th>
                                            <th>Usage</th>
                                            <th>Expiry Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {promos.map((promo) => (
                                            <tr key={promo.id}>
                                                <td>
                                                    <span className={styles.codeBadge}>{promo.code}</span>
                                                </td>
                                                <td>
                                                    {promo.partner ? promo.partner.name : <span style={{ color: 'var(--muted)' }}>General public</span>}
                                                </td>
                                                <td style={{ textTransform: 'capitalize' }}>{promo.discount_type}</td>
                                                <td className={styles.mono}>
                                                    {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `৳${promo.discount_value}`}
                                                </td>
                                                <td className={styles.mono}>
                                                    {promo.usage_count} / {promo.usage_limit || '∞'}
                                                </td>
                                                <td>
                                                    {promo.expiry_date ? new Date(promo.expiry_date).toLocaleDateString() : <span style={{ color: 'var(--muted)' }}>Never</span>}
                                                </td>
                                                <td>
                                                    <span className={`${styles.badge} ${promo.is_active ? styles.activeBadge : styles.inactiveBadge}`}>
                                                        {promo.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.rowActions}>
                                                        <button
                                                            className={`${styles.iconBtn} ${styles.toggleBtn}`}
                                                            onClick={() => togglePromoStatus(promo.id, promo.is_active)}
                                                            title={promo.is_active ? 'Deactivate Code' : 'Activate Code'}
                                                        >
                                                            {promo.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                        </button>
                                                        <button
                                                            className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                                            onClick={() => handleDeletePromo(promo.id)}
                                                            title="Delete Code"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        /* PARTNERS TAB */
                        <div className={styles.tableWrapper}>
                            {partners.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Users size={40} />
                                    <p>No partner accounts registered.</p>
                                </div>
                            ) : (
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Partner Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Prefix</th>
                                            <th>Linked Promo Codes</th>
                                            <th>Date Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {partners.map((partner) => (
                                            <tr key={partner.id}>
                                                <td style={{ fontWeight: 600 }}>{partner.name}</td>
                                                <td>{partner.email || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                                                <td>{partner.phone || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                                                <td>
                                                    <span className={styles.codeBadge}>{partner.code_prefix}</span>
                                                </td>
                                                <td>
                                                    {partner.promo_codes && partner.promo_codes.length > 0 ? (
                                                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                            {partner.promo_codes.map(c => (
                                                                <span key={c.id} className={styles.codeBadge} style={{ fontSize: '0.8rem' }}>
                                                                    {c.code}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No active codes</span>
                                                    )}
                                                </td>
                                                <td>{new Date(partner.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <div className={styles.rowActions}>
                                                        <button
                                                            className={`${styles.iconBtn} ${styles.deleteBtn}`}
                                                            onClick={() => handleDeletePartner(partner.id)}
                                                            title="Delete Partner"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ADD PARTNER MODAL */}
            {partnerModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Register Partner</h2>
                            <button className={styles.closeBtn} onClick={() => setPartnerModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePartner}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="partnerName">Name *</label>
                                    <input
                                        id="partnerName"
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        value={partnerName}
                                        onChange={(e) => setPartnerName(e.target.value)}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="partnerEmail">Email Address</label>
                                    <input
                                        id="partnerEmail"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={partnerEmail}
                                        onChange={(e) => setPartnerEmail(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="partnerPhone">Contact Phone</label>
                                    <input
                                        id="partnerPhone"
                                        type="tel"
                                        placeholder="+88017..."
                                        value={partnerPhone}
                                        onChange={(e) => setPartnerPhone(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="partnerPrefix">Promo Code Prefix *</label>
                                    <input
                                        id="partnerPrefix"
                                        type="text"
                                        placeholder="e.g. JOHN"
                                        value={partnerPrefix}
                                        onChange={(e) => setPartnerPrefix(e.target.value.toUpperCase())}
                                        className={styles.input}
                                        required
                                    />
                                </div>

                                {/* Merged Creation option ("Merge Function") */}
                                <div className={styles.mergeSection}>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            id="autoCreatePromo"
                                            type="checkbox"
                                            checked={autoCreatePromo}
                                            onChange={(e) => setAutoCreatePromo(e.target.checked)}
                                            className={styles.checkbox}
                                        />
                                        <label htmlFor="autoCreatePromo" className={styles.checkboxLabel}>
                                            <strong>Auto-Create Promo Code</strong>
                                        </label>
                                    </div>
                                    {autoCreatePromo && (
                                        <>
                                            <div className={styles.formGroup}>
                                                <label>Discount Type</label>
                                                <div className={styles.inputRow}>
                                                    <button
                                                        type="button"
                                                        className={autoPromoType === 'percentage' ? styles.primaryBtn : styles.secondaryBtn}
                                                        onClick={() => setAutoPromoType('percentage')}
                                                    >
                                                        Percentage (%)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={autoPromoType === 'fixed' ? styles.primaryBtn : styles.secondaryBtn}
                                                        onClick={() => setAutoPromoType('fixed')}
                                                    >
                                                        Fixed (৳)
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label htmlFor="autoValue">Discount Value *</label>
                                                <input
                                                    id="autoValue"
                                                    type="number"
                                                    value={autoPromoValue}
                                                    onChange={(e) => setAutoPromoValue(parseFloat(e.target.value) || 0)}
                                                    className={styles.input}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setPartnerModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.primaryBtn}>
                                    Register Partner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE PROMO CODE MODAL */}
            {promoModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Create Promo Code</h2>
                            <button className={styles.closeBtn} onClick={() => setPromoModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePromo}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="promoCodeString">Promo Code *</label>
                                    <input
                                        id="promoCodeString"
                                        type="text"
                                        placeholder="e.g. SAVE20"
                                        value={promoCodeString}
                                        onChange={(e) => setPromoCodeString(e.target.value.toUpperCase())}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="selectedPartner">Link Partner (Optional)</label>
                                    <select
                                        id="selectedPartner"
                                        value={selectedPartnerId}
                                        onChange={(e) => setSelectedPartnerId(e.target.value)}
                                        className={styles.input}
                                    >
                                        <option value="">General Public (No partner link)</option>
                                        {partners.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.code_prefix})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Discount Type</label>
                                    <div className={styles.inputRow}>
                                        <button
                                            type="button"
                                            className={promoDiscountType === 'percentage' ? styles.primaryBtn : styles.secondaryBtn}
                                            onClick={() => setPromoDiscountType('percentage')}
                                        >
                                            Percentage (%)
                                        </button>
                                        <button
                                            type="button"
                                            className={promoDiscountType === 'fixed' ? styles.primaryBtn : styles.secondaryBtn}
                                            onClick={() => setPromoDiscountType('fixed')}
                                        >
                                            Fixed (৳)
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="promoDiscountValue">Discount Value *</label>
                                    <input
                                        id="promoDiscountValue"
                                        type="number"
                                        placeholder="Value"
                                        value={promoDiscountValue}
                                        onChange={(e) => setPromoDiscountValue(parseFloat(e.target.value) || 0)}
                                        className={styles.input}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="promoLimit">Usage Limit (Optional)</label>
                                    <input
                                        id="promoLimit"
                                        type="number"
                                        placeholder="No limit"
                                        value={promoUsageLimit}
                                        onChange={(e) => setPromoUsageLimit(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="promoExpiry">Expiry Date (Optional)</label>
                                    <input
                                        id="promoExpiry"
                                        type="date"
                                        value={promoExpiryDate}
                                        onChange={(e) => setPromoExpiryDate(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.secondaryBtn} onClick={() => setPromoModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.primaryBtn}>
                                    Create Promo Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
