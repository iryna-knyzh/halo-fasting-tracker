import type { Metadata } from 'next'
import './globals.css'
import styles from './layout.module.scss'

export const metadata: Metadata = {
  title: 'Halo · Fasting Tracker',
  description: 'Your calm fasting tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className={styles.body}>
        {children}
      </body>
    </html>
  )
}
