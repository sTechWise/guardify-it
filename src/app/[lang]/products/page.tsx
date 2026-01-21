import { createClient } from '@/utils/supabase/server'
import ShopClient from './ShopClient'
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";
import { Suspense } from 'react';

export const revalidate = 0;

export default async function ProductsPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const validLang = (lang === 'bn' ? 'bn' : 'en') as Locale;
    const dict = await getDictionary(validLang);
    const supabase = await createClient()

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching products:', error)
        return <div className="p-8 text-center text-red-500">Error loading products. Please try again later.</div>
    }

    // Fetch categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    return (
        <main style={{ background: '#020617', minHeight: '100vh' }}>
            <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>}>
                <ShopClient
                    products={products || []}
                    categories={(categories || []) as any}
                    lang={validLang}
                    dict={dict}
                />
            </Suspense>
        </main>
    )
}

