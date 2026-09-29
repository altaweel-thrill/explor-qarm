import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'قَرم | إدارة الأراضي', description: 'اكتشف الأراضي المتاحة للبيع والإيجار، وقارن المواقع والمساحات والأسعار بسهولة مع قَرم.' };
export default function Layout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="ar" dir="rtl"><body>{children}</body></html>}
