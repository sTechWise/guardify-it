
import Hero from "@/components/Hero";
import FlashDeal from "@/components/FlashDeal";
import CategoryGrid from "@/components/CategoryGrid";
import ProductCard from "@/components/ProductCard";
import TrustSection from "@/components/TrustSection";
import CallToAction from "@/components/CallToAction";
import styles from "./home.module.css";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts, getNewArrivals, getDiscountedProducts } from "@/lib/database";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Fetch data from Supabase
  const featuredProducts = await getFeaturedProducts(4);
  const newArrivals = await getNewArrivals(4);
  const discountedProducts = await getDiscountedProducts();

  return (
    <main className={styles.main}>
      <div className={styles.sectionDivider}>
        <Hero lang={lang} dict={dict} products={featuredProducts} />
      </div>

      <div className={styles.sectionDivider}>
        <FlashDeal lang={lang} dict={dict} products={discountedProducts} />
      </div>

      <div className={styles.sectionDivider}>
        <CategoryGrid lang={lang} dict={dict} />
      </div>

      {/* Top Selling Section */}
      <section className={`${styles.section} ${styles.sectionDivider}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>

              <h2 className={styles.sectionTitle}>
                {lang === 'bn' ? '🔥 সবচেয়ে বেশি বিক্রি হওয়া সাবস্ক্রিপশন' : '🔥 Top Selling Subscriptions'}
              </h2>
            </div>
            <Link href={`/${lang}/products`} className={styles.viewAll}>
              {lang === 'bn' ? 'সব দেখুন' : 'View All'} <ArrowRight size={20} />
            </Link>
          </div>

          <div className={styles.productGrid}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={lang === 'bn' ? (product.title_bengali || product.title) : (product.title || product.id)} // Fallback logic
                price={product.price}
                salePrice={product.sale_price || undefined}
                image={product.image_url || ''}
                rating={product.rating}
                reviewCount={product.review_count}
                badge={product.badge || undefined}
                stockStatus={product.stock_status as 'in_stock' | 'out_of_stock'}
                lang={lang}
                dict={dict}
              />
            ))}
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider}>
        <TrustSection lang={lang} dict={dict} />
      </div>

      <CallToAction lang={lang} dict={dict} />
    </main>
  );
}
