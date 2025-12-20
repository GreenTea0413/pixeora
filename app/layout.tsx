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
  verification: {
    google: 'lcnJKA7vmJdAeeH_r_Sj_uWnJt-qj0_kyd5Om9o3imA',
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
