import { createClient } from '@/utils/supabase/server'
import { Product } from '@/types'
import styles from './product-detail.module.css'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/AddToCartButton'
import { Star, Shield, Zap, Headphones, ChevronLeft, CheckCircle } from 'lucide-react'
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

export const revalidate = 0;

interface PageProps {
    params: Promise<{ id: string; lang: Locale }>
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id, lang } = await params
    const dict = await getDictionary(lang);
    const supabase = await createClient()

    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !product) {
        console.error('Error fetching product:', error)
        notFound()
    }

    const p = product as Product
    const isBn = lang === 'bn'

    // Dynamic Sales Headline Logic
    const salesHeadline = isBn
        ? `${p.title_bengali || p.title} – প্রিমিয়াম সাবস্ক্রিপশন, সেরা দামে`
        : `${p.title} – Premium Features Without The Premium Price`

    // Benefit List (Generic fallbacks if specific data isn't available)
    const benefitList = [
        isBn ? 'মিনিটেই প্রফেশনাল কাজ করুন' : 'Unlock professional features instantly',
        isBn ? '১০০+ প্রিমিয়াম টেমপ্লেট এবং অ্যাসেট' : 'Access premium tools & assets',
        isBn ? 'ছাত্র, ফ্রিল্যান্সার এবং ব্যবসার জন্য সেরা' : 'Perfect for students & professionals',
    ]

    // Payment Logos
    const paymentMethods = [
        { name: 'bKash', color: '#e2136e' },
        { name: 'Nagad', color: '#ec1c24' },
        { name: 'Rocket', color: '#8c3494' }
    ]

    return (
        <main className={styles.container}>
            <Link href={`/${lang}/products`} className={styles.backLink}>
                <ChevronLeft size={18} /> {dict.back_to_products}
            </Link>

            <div className={styles.layout}>
                {/* Main Content: Visual + Comprehensive Sales Copy */}
                <div className={styles.mainContent}>
                    <div className={styles.imageContainer}>
                        {p.image_url ? (
                            <img src={p.image_url} alt={p.title} className={styles.image} />
                        ) : (
                            <div style={{ color: 'var(--muted)' }}>{dict.no_image_available}</div>
                        )}
                        {p.stock_status === 'in_stock' && (
                            <div className={styles.imageOverlayBadge}>
                                <Zap size={16} fill="currentColor" /> {dict.instant_delivery}
                            </div>
                        )}
                    </div>

                    {/* Desktop Highlight Section */}
                    <div className={styles.desktopHighlight}>
                        <h2 className={styles.sectionTitle}>
                            {isBn ? 'কেন Guardify IT থেকে নিবেন?' : `Why Choose ${p.title} from Guardify IT?`}
                        </h2>
                        <div className={styles.valueGrid}>
                            <div className={styles.valueCard}>
                                <Shield className={styles.valueIcon} />
                                <h3>{isBn ? '১২ মাসের ওয়ারেন্টি' : 'Full Warranty'}</h3>
                                <p>{isBn ? 'লাইসেন্স মেয়জুড়ে পূর্ণ ওয়ারেন্টি সুবিধা।' : 'Coverage for the entire subscription period.'}</p>
                            </div>
                            <div className={styles.valueCard}>
                                <Zap className={styles.valueIcon} />
                                <h3>{isBn ? 'দ্রুত ডেলিভারি' : 'Instant Delivery'}</h3>
                                <p>{isBn ? 'অর্ডার করার ১০ - ৩০ মিনিটের মধ্যে ডেলিভারি।' : 'Access sent to your email within minutes.'}</p>
                            </div>
                            <div className={styles.valueCard}>
                                <div className={styles.valueIcon}>৳</div>
                                <h3>{isBn ? 'সাশ্রয়ী মূল্য' : 'Best Price'}</h3>
                                <p>{isBn ? 'অফিসিয়াল পেমেন্ট মেথড ব্যবহার করে সস্তায় সাবস্ক্রিপশন।' : 'Save up to 80% compared to official prices.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>{isBn ? 'কেনার পর কী হবে?' : 'What Happens After Purchase?'}</h2>
                        <div className={styles.steps}>
                            <div className={styles.step}>
                                <span className={styles.stepNum}>1</span>
                                <p>{isBn ? 'অর্ডার প্লেস করুন এবং পেমেন্ট সম্পন্ন করুন' : 'Place order & complete payment securely'}</p>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNum}>2</span>
                                <p>{isBn ? 'আমাদের ভেরিফাইড হোয়াটসঅ্যাপ নাম্বারে স্ক্রিনশট দিন' : 'Send payment proof to our WhatsApp'}</p>
                            </div>
                            <div className={styles.step}>
                                <span className={styles.stepNum}>3</span>
                                <p>{isBn ? '১০-৩০ মিনিটের মধ্যে এক্সেস বুঝে নিন' : 'Receive premium access within 10-30 mins'}</p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Accordion */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>{isBn ? 'সচরাচর প্রশ্ন (FAQ)' : 'Frequently Asked Questions'}</h2>
                        <div className={styles.accordion}>
                            <details className={styles.accordionItem} open>
                                <summary>{isBn ? 'এটা কি নিজের একাউন্টে এক্টিভ করা যাবে?' : 'Can I activate this on my own account?'}</summary>
                                <p>{isBn ? 'হ্যাঁ, আমরা আপনার নিজের ইমেইল একাউন্টেই সাবস্ক্রিপশন এক্টিভ করে দিব।' : 'Yes! We upgrade your existing personal account securely via email invitation or login.'}</p>
                            </details>
                            <details className={styles.accordionItem}>
                                <summary>{isBn ? 'যদি কাজ না করে তাহলে কি রিফান্ড পাব?' : 'Do you offer refunds if it stops working?'}</summary>
                                <p>{isBn ? 'অবশ্যই! আমাদের সার্ভিসের মেয়াদ থাকাকালীন কোনো সমস্যা হলে আমরা ফিক্স করে দিব, অথবা রিফান্ড করব।' : 'Absolutely. You are covered by our replacement warranty. If we cannot fix an issue, we provide a pro-rated refund.'}</p>
                            </details>
                            <details className={styles.accordionItem}>
                                <summary>{isBn ? 'ডেলিভারি পেতে কতক্ষণ সময় লাগে?' : 'How long does delivery take?'}</summary>
                                <p>{isBn ? 'সাধারণত ১০ থেকে ৩০ মিনিটের মধ্যে, তবে মাঝে মাঝে ১ ঘন্টা পর্যন্ত লাগতে পারে।' : 'Usually 10-30 minutes during business hours (10 AM - 12 AM).'}</p>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Sticky Sidebar: High Conversion Sales Block */}
                <aside className={styles.sidebar}>
                    <h1 className={styles.salesHeadline}>
                        {salesHeadline}
                    </h1>

                    {/* Rating & Social Proof */}
                    <div className={styles.ratingRow}>
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={18} fill="#fbbf24" stroke="none" />
                            ))}
                        </div>
                        <span className={styles.ratingText}>4.9/5 ({isBn ? 'ভেরিফাইড কাস্টমার' : 'Verified'})</span>
                    </div>

                    {/* Benefit Bullets */}
                    <ul className={styles.benefitBullets}>
                        {benefitList.map((benefit, i) => (
                            <li key={i}><CheckCircle size={16} className={styles.checkIcon} /> {benefit}</li>
                        ))}
                    </ul>

                    {/* Price Block */}
                    <div className={styles.priceContainer}>
                        <div className={styles.priceWrapper}>
                            {p.sale_price ? (
                                <>
                                    <span className={styles.oldPrice}>৳{p.price.toLocaleString()}</span>
                                    <span className={styles.salePrice}>
                                        ৳{p.sale_price.toLocaleString()}
                                        {p.subscription_type && <span className={styles.perType}>/ {p.subscription_type}</span>}
                                    </span>
                                </>
                            ) : (
                                <span className={styles.salePrice}>
                                    ৳{p.price.toLocaleString()}
                                    {p.subscription_type && <span className={styles.perType}>/ {p.subscription_type}</span>}
                                </span>
                            )}
                        </div>
                        {p.sale_price && (
                            <div className={styles.savingsTag}>
                                {isBn ? 'সাশ্রয়' : 'Save'} {Math.round(((p.price - p.sale_price) / p.price) * 100)}%
                            </div>
                        )}
                    </div>

                    {/* Scarcity Indicator */}
                    <div className={styles.scarcityText}>
                        <Zap size={14} fill="currentColor" />
                        {isBn ? 'আজ সীমিত সংখ্যক অ্যাক্টিভেশন বাকি আছে' : 'Only limited activations available today'}
                    </div>

                    {/* Mobile Only: How to Pay Hint */}
                    <div className={styles.paymentHint}>
                        {isBn ? 'নিরাপদ পেমেন্ট: বিকাশ • নগদ • রকেট' : 'Pay securely with bKash, Nagad, Rocket'}
                    </div>

                    {/* Add to Cart Button */}
                    <div className={styles.ctaWrapper}>
                        <AddToCartButton
                            product={p}
                            className={styles.addToCartBtn}
                            dict={dict}
                            customLabel={isBn ? 'সাবস্ক্রিপশন নিশ্চিত করুন' : 'Secure My Subscription'}
                        />
                        <p className={styles.ctaSubtext}>
                            {isBn ? 'কোন অ্যাকাউন্টের প্রয়োজন নেই • ইনস্ট্যান্ট অ্যাক্টিভেশন' : 'No account required • Instant activation'}
                        </p>
                    </div>

                    {/* Brand Trust Block */}
                    <div className={styles.brandTrustBlock}>
                        <h4>{isBn ? 'Guardify IT কেন বিশ্বাস করবেন?' : 'Why Trust Guardify IT?'}</h4>
                        <ul className={styles.brandTrustList}>
                            <li>
                                <Shield size={16} /> <span>{isBn ? 'DBID ভেরিফাইড বিজনেস' : 'DBID Verified Business'}</span>
                            </li>
                            <li>
                                <CheckCircle size={16} /> <span>{isBn ? '৫,০০০+ সফল ডেলিভারি' : '5,000+ Successful Deliveries'}</span>
                            </li>
                            <li>
                                <Star size={16} /> <span>{isBn ? 'প্রফেশনালদের পছন্দ' : 'Trusted by Professionals'}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Payment Trust Strip */}
                    <div className={styles.paymentTrust}>
                        <span className={styles.paymentLabel}>{isBn ? 'সাপোর্টেড পেমেন্টঃ' : 'We Accept:'}</span>
                        <div className={styles.paymentIcons}>
                            {paymentMethods.map(m => (
                                <span key={m.name} className={styles.payIcon} style={{ borderColor: m.color, color: m.color }}>
                                    {m.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    )
}
