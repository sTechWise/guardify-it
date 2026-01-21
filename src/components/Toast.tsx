'use client'

import { useEffect, useState } from 'react'
import styles from './toast.module.css'
import classNames from 'classnames'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
    message: string
    type: ToastType
    onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, 3000)

        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className={classNames(styles.toast, styles[type])}>
            <span className={styles.message}>{message}</span>
        </div>
    )
}
