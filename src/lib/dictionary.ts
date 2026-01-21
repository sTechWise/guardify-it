import 'server-only'
import type { Locale } from '@/i18n-config'

const dictionaries = {
    en: () => import('@/locales/en/common.json').then((module) => module.default),
    bn: () => import('@/locales/bn/common.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
