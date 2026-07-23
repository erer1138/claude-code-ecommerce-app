import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Trirong } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { PromoBar } from "@/components/promo-bar";
import { SiteFooter } from "@/components/site-footer";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const trirong = Trirong({
  variable: "--font-trirong",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "CodingThailand — ร้านค้าออนไลน์สินค้าไอทีครบวงจร",
  description: "สมาร์ทโฟน แล็ปท็อป หูฟัง และอุปกรณ์เสริม คุณภาพดี ราคาคุ้มค่า ส่งฟรีทั่วประเทศ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        trirong.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <SiteHeader />
        <PromoBar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
