'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import type { Product, SubscriptionPlan, CartItem } from '@/types'
import { Clock, CheckCircle } from 'lucide-react'

interface PlanSelectorProps {
    product: Product
    dict: any
    isBn?: boolean
    buttonClassName?: string
}

export default function PlanSelector({ product, dict, isBn = false, buttonClassName }: PlanSelectorProps) {
    const plans = product.subscription_plans || []
    const [selectedIndex, setSelectedIndex] = useState(0)
    const { addToCart, cart } = useCart()
    const { showToast } = useToast()

    const selectedPlan = plans[selectedIndex]
    const effectivePrice = selectedPlan ? (selectedPlan.sale_price || selectedPlan.price) : (product.sale_price || product.price)
    const originalPrice = selectedPlan ? selectedPlan.price : product.price
    const hasSale = selectedPlan ? (selectedPlan.sale_price && selectedPlan.sale_price < selectedPlan.price) : (product.sale_price && product.sale_price < product.price)
    const duration = selectedPlan ? selectedPlan.duration : product.duration

    const isInCart = cart.some(item => item.id === product.id)

    const handleAddToCart = () => {
        if (isInCart) return

        const cartItem: CartItem = {
            id: product.id,
            title: product.title,
            price: selectedPlan ? selectedPlan.price : product.price,
            sale_price: selectedPlan ? selectedPlan.sale_price : product.sale_price,
            image_url: product.image_url,
            subscription_type: product.subscription_type,
            duration: duration || undefined,
            quantity: 1,
        }

        addToCart(cartItem)
        showToast(dict?.added_to_cart || `Added ${product.title} to cart`)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {/* Plan Cards */}
            {plans.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary, #8899aa)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                    }}>
                        {isBn ? 'প্ল্যান বেছে নিন' : 'Choose Your Plan'}
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {plans.map((plan, idx) => {
                            const isSelected = selectedIndex === idx
                            const planPrice = plan.sale_price || plan.price
                            const planHasSale = plan.sale_price && plan.sale_price < plan.price

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedIndex(idx)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.85rem 1rem',
                                        borderRadius: '10px',
                                        border: isSelected
                                            ? '2px solid var(--guardian-blue, #1B4DFF)'
                                            : '1px solid var(--border, #1E3A5F)',
                                        background: isSelected
                                            ? 'rgba(27, 77, 255, 0.1)'
                                            : 'var(--card, #111F38)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'left',
                                        width: '100%',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        {/* Radio indicator */}
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            border: isSelected
                                                ? '2px solid var(--guardian-blue, #1B4DFF)'
                                                : '2px solid var(--border, #1E3A5F)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            {isSelected && (
                                                <div style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '50%',
                                                    background: 'var(--guardian-blue, #1B4DFF)',
                                                }} />
                                            )}
                                        </div>

                                        <div>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                fontWeight: 700,
                                                color: isSelected
                                                    ? 'var(--guardian-blue-light, #5B8DFF)'
                                                    : 'var(--text, #e2e8f0)',
                                            }}>
                                                <Clock size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                                                {plan.duration}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div style={{ textAlign: 'right' }}>
                                        {planHasSale && (
                                            <span style={{
                                                fontSize: '0.75rem',
                                                textDecoration: 'line-through',
                                                color: 'var(--muted, #667788)',
                                                marginRight: '6px',
                                            }}>
                                                ৳{plan.price.toLocaleString()}
                                            </span>
                                        )}
                                        <span style={{
                                            fontSize: '1rem',
                                            fontWeight: 800,
                                            color: isSelected
                                                ? 'var(--guardian-blue-light, #5B8DFF)'
                                                : 'var(--text, #e2e8f0)',
                                            fontFamily: 'var(--font-mono, monospace)',
                                        }}>
                                            ৳{planPrice.toLocaleString()}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Single plan display (when only 1 plan) */}
            {plans.length === 1 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1rem',
                    background: 'rgba(27, 77, 255, 0.08)',
                    border: '1px solid rgba(27, 77, 255, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--guardian-blue-light, #5B8DFF)'
                }}>
                    <Clock size={16} />
                    <span>{isBn ? 'মেয়াদ:' : 'Duration:'} {plans[0].duration}</span>
                </div>
            )}

            {/* Price summary */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                {hasSale && (
                    <span style={{
                        fontSize: '1rem',
                        textDecoration: 'line-through',
                        color: 'var(--muted, #667788)',
                        fontFamily: 'var(--font-mono, monospace)',
                    }}>
                        ৳{originalPrice.toLocaleString()}
                    </span>
                )}
                <span style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: 'var(--guardian-blue-light, #5B8DFF)',
                    fontFamily: 'var(--font-mono, monospace)',
                }}>
                    ৳{effectivePrice.toLocaleString()}
                </span>
                {duration && (
                    <span style={{
                        fontSize: '0.85rem',
                        color: 'var(--muted, #667788)',
                        fontWeight: 500,
                    }}>
                        / {duration}
                    </span>
                )}
                {hasSale && (
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#00E676',
                        background: 'rgba(0, 230, 118, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                    }}>
                        {isBn ? 'সাশ্রয়' : 'Save'} {Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)}%
                    </span>
                )}
            </div>

            {/* Add to Cart CTA */}
            <button
                onClick={handleAddToCart}
                className={buttonClassName}
                disabled={isInCart}
                style={isInCart ? { opacity: 0.7, cursor: 'default' } : {}}
            >
                {isInCart
                    ? (dict?.in_cart || 'In Cart')
                    : (isBn
                        ? `সাবস্ক্রিপশন নিশ্চিত করুন${duration ? ` — ${duration}` : ''}`
                        : `Secure My Subscription${duration ? ` — ${duration}` : ''}`)
                }
            </button>
        </div>
    )
}
