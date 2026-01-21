'use client'

import { usePathname, useRouter } from 'next/navigation'
import styles from './language-switcher.module.css'
import { i18n } from '@/i18n-config'

export default function LanguageSwitcher() {
    const pathname = usePathname()
    const router = useRouter()

    const currentLocale = pathname?.split('/')[1] || i18n.defaultLocale

    const switchLanguage = (newLocale: string) => {
        if (!pathname) return

        // Replace the locale in the pathname
        // Assuming pathname always starts with /locale/ or is just /locale
        const segments = pathname.split('/')
        segments[1] = newLocale
        const newPath = segments.join('/')

        // Set cookie
        document.cookie = `lang=${newLocale}; path=/; max-age=31536000` // 1 year

        router.push(newPath)
    }

    return (
        <div className={styles.switcher}>
            <button
                className={`${styles.btn} ${currentLocale === 'bn' ? styles.active : ''}`}
                onClick={() => switchLanguage('bn')}
            >
                বাংলা
            </button>
            <span className={styles.divider}>|</span>
            <button
                className={`${styles.btn} ${currentLocale === 'en' ? styles.active : ''}`}
                onClick={() => switchLanguage('en')}
            >
                EN
            </button>
        </div>
    )
}
