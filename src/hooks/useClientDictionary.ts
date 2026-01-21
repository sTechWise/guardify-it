'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'
import type { Locale } from '@/i18n-config'

// Import both dictionaries statically for client-side use
import enDict from '@/locales/en/common.json'
import bnDict from '@/locales/bn/common.json'

export type Dictionary = typeof enDict

const dictionaries: Record<Locale, Dictionary> = {
    en: enDict,
    bn: bnDict,
}

/**
 * Client-side hook for internationalization
 * Use this in 'use client' components to get translated strings
 */
export function useClientDictionary() {
    const params = useParams()
    const lang = (params.lang as Locale) || 'en'

    const dict = useMemo(() => {
        return dictionaries[lang] || dictionaries.en
    }, [lang])

    return { dict, lang }
}

/**
 * Helper function to get a translation with fallback
 * Use when accessing dynamic keys that may not exist
 */
export function t(dict: Dictionary, key: keyof Dictionary, fallback?: string): string {
    return dict[key] || fallback || key
}
