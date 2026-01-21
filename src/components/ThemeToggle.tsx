'use client'

import { useTheme } from '@/context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import styles from './theme-toggle.module.css'

export default function ThemeToggle() {
    const { theme, toggleTheme, mounted } = useTheme()

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted) {
        return <div className={styles.toggle} style={{ opacity: 0 }} />
    }

    return (
        <button
            onClick={toggleTheme}
            className={styles.toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Sun size={20} className={styles.icon} />
            ) : (
                <Moon size={20} className={styles.icon} />
            )}
        </button>
    )
}
