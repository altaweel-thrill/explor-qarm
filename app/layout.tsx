import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'قَرم | إدارة الأراضي', description: 'مساحة واحدة لإدارة أراضيك وبياناتها' };
export default function Layout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="ar" dir="rtl"><body>{children}</body></html>}
