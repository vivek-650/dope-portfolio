import type { Metadata } from "next";
import { DATA } from "@/data/resume";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Geist, Geist_Mono } from "next/font/google";
import { RootLayoutClient } from "./app-content";
import type { ReactNode } from "react";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: `${DATA.name} · Frontend Engineer & Full-Stack Builder`,
  description: DATA.description,
  keywords: [
    "full-stack engineer",
    "frontend developer",
    "React",
    "Next.js",
    "TypeScript",
    "AI",
    "SaaS",
    "portfolio",
  ],
  authors: [{ name: DATA.name }],
  creator: DATA.name,
  publisher: DATA.name,
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: DATA.name,
    title: `${DATA.name} · Frontend Engineer & Full-Stack Builder`,
    description: DATA.description,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: DATA.name,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${DATA.name} · Frontend Engineer`,
    description: DATA.description,
    images: ["/opengraph-image.png"],
    creator: "@curious__Anand",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  category: "technology",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: DATA.name,
    url: baseUrl,
    image: new URL(DATA.avatarUrl || "", baseUrl).toString(),
    description: DATA.description,
    jobTitle: "Frontend-focused Full-Stack Engineer",
    location: {
      "@type": "Place",
      name: DATA.location,
    },
    sameAs: [
      "https://github.com/vivek-650",
      "https://linkedin.com/in/curiousvivek",
      "https://x.com/curious__Anand",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased relative",
          geist.variable,
          geistMono.variable
        )}
      >
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}