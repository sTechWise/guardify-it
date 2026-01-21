import { createClient } from '@/utils/supabase/server'
import ShopClient from './ShopClient'
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

export const revalidate = 0;

export default async function ProductsPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
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
            <ShopClient
                products={products || []}
                categories={(categories || []) as any}
                lang={lang}
                dict={dict}
            />
        </main>
    )
}
