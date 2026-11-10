import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '옛날 옛적 뉴프론티어에서 | 모바일 수첩',
  description:
    '서부극 누아르 머더 미스터리 《옛날 옛적 뉴프론티어에서》 오프라인 대면 플레이용 스마트폰 보조 앱',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0c0a09'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-stone-950 text-stone-100 antialiased">
        {children}
      </body>
    </html>
  );
}
