import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://guardifyit.com'
    const locales = ['en', 'bn']
    const staticPaths = ['', '/about', '/contact', '/faq', '/how-it-works', '/products']

    // 1. Static routes in all languages
    const staticRoutes = locales.flatMap(locale => 
        staticPaths.map(path => ({
            url: `${baseUrl}/${locale}${path}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: path === '' ? 1.0 : 0.8
        }))
    )

    // 2. Fetch products dynamically to include in sitemap
    let productRoutes: any[] = []
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: products } = await supabase
            .from('products')
            .select('id, updated_at')
            .eq('status', 'active')

        if (products) {
            productRoutes = locales.flatMap(locale => 
                products.map(product => ({
                    url: `${baseUrl}/${locale}/products/${product.id}`,
                    lastModified: new Date(product.updated_at || new Date()),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6
                }))
            )
        }
    } catch (err) {
        console.error('Sitemap generation error fetching products:', err)
    }

    return [...staticRoutes, ...productRoutes]
}
