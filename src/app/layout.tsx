import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/sections/Navbar";
import CommandMenu from "@/components/ui/CommandMenu";
import ConsoleGreet from "@/components/ui/ConsoleGreet";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

// Self-hosted Google fonts: the build no longer fetches fonts.googleapis.com,
// which made CI flaky (next/font/google occasionally failed to parse a reply).
const inter = localFont({
  src: "./fonts/Inter-latin.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-latin.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "100 800",
});

const instrument = localFont({
  src: "./fonts/InstrumentSerif-latin.woff2",
  variable: "--font-editorial",
  display: "swap",
  weight: "400",
});

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-latin.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "300 700",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adityahq.me"),
  title: "Aditya Chitragar | Developer",
  description:
    "Aditya Chitragar's Portfolio of Developing & building autonomous agentic workflows, scalable backend architectures, and polished web experiences.",
  keywords: [
    "Aditya Chitragar",
    "Developer",
    "Full-Stack",
    "AI",
    "Next.js",
    "Python",
    "FastAPI",
  ],
  authors: [{ name: "Aditya Chitragar", url: "https://adityahq.me" }],
  creator: "Aditya Chitragar",
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Aditya Chitragar | Developer",
    description:
      "Aditya Chitragar's Portfolio of Developing & building autonomous agentic workflows, scalable backend architectures, and polished web experiences.",
    url: "https://adityahq.me",
    siteName: "Aditya Chitragar",
    images: [
      {
        url: "https://adityahq.me/og-image.jpg",
        width: 1077,
        height: 560,
        alt: "Aditya Chitragar — Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aditya Chitragar | Developer",
    description:
      "Aditya Chitragar's Portfolio of Developing & building autonomous agentic workflows, scalable backend architectures, and polished web experiences.",
    images: ["https://adityahq.me/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrument.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t="dark";}var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t;}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`,
          }}
        />
        <link rel="preload" as="image" href="/shigure-ui-smol.gif" />
        <Navbar />
        <main>{children}</main>
        <CommandMenu />
        <ConsoleGreet />
        <Analytics debug={false} />
      </body>
    </html>
  );
}