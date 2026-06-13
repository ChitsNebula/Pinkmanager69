import type { Metadata } from "next";
import { Sarabun, Outfit } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: "swap",
});

const outfit = Outfit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pink69 - ระบบจัดการหน้าที่กีฬาสี คณะสีชมพู โรงเรียนนารีรัตน์จังหวัดแพร่",
  description: "แอปพลิเคชันสำหรับจัดการหน้าที่สแตนเชียร์ ขบวนพาเหรด นักกีฬา และตำแหน่งพิเศษ คณะสีชมพู น.ร. เพื่อป้องกันการตกหล่นของนักเรียนทุกคน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${sarabun.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-thai">{children}</body>
    </html>
  );
}
