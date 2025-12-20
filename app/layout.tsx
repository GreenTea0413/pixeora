import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Pixeora - Free Pixel Art Editor",
  description: "Create beautiful pixel art with our free online editor. Modern UI, easy to use, perfect for game developers and artists.",
  keywords: ["pixel art", "pixel art editor", "픽셀 아트", "도트 그림", "무료 에디터", "온라인 에디터", "game dev", "pixel graphics"],
  authors: [{ name: "GreenTea" }],
  creator: "GreenTea",
  verification: {
    google: 'lcnJKA7vmJdAeeH_r_Sj_uWnJt-qj0_kyd5Om9o3imA',
  },
  metadataBase: new URL('https://pixeora.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://pixeora.vercel.app',
    title: 'Pixeora - Free Pixel Art Editor',
    description: 'Create beautiful pixel art with our free online editor. Modern UI, easy to use, perfect for game developers and artists.',
    siteName: 'Pixeora',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Pixeora - Free Pixel Art Editor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixeora - Free Pixel Art Editor',
    description: 'Create beautiful pixel art with our free online editor. Modern UI, easy to use, perfect for game developers and artists.',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${pixelFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
