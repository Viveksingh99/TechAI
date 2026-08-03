import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = "https://techai.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TechAI — Software Engineering & AI Product Studio",
    template: "%s · TechAI",
  },
  description:
    "TechAI is a software agency that designs, builds, and scales web, mobile, AI, and cloud products for startups and enterprises. From MVP to enterprise scale, we ship production software.",
  keywords: [
    "software agency",
    "software development company",
    "AI development",
    "web development agency",
    "mobile app development",
    "SaaS development",
    "cloud consulting",
    "DevOps services",
    "custom software",
  ],
  authors: [{ name: "TechAI" }],
  creator: "TechAI",
  publisher: "TechAI",
  icons: {
    icon: "/brand/techai-logo.png",
    apple: "/brand/techai-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "TechAI",
    title: "TechAI — Software Engineering & AI Product Studio",
    description:
      "We design, build, and scale web, mobile, AI, and cloud products for startups and enterprises.",
    images: [{ url: "/brand/techai-logo.png", width: 700, height: 256, alt: "TechAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechAI — Software Engineering & AI Product Studio",
    description:
      "We design, build, and scale web, mobile, AI, and cloud products for startups and enterprises.",
    images: ["/brand/techai-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
