import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/sections/Navbar";
import CommandMenu from "@/components/ui/CommandMenu";
import ConsoleGreet from "@/components/ui/ConsoleGreet";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-editorial",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adityahq.me"),
  title: "Aditya Chitragar | Developer",
  description:
    "Portfolio of Aditya Chitragar, a Computer Science student and developer in India building autonomous agentic workflows, scalable backend architectures, and polished web experiences.",
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
      "Portfolio of Aditya Chitragar, a Computer Science student and developer in India building autonomous agentic workflows, scalable backend architectures, and polished web experiences.",
    url: "https://adityahq.me",
    siteName: "adityahq",
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
      "Portfolio of Aditya Chitragar, a Computer Science student and developer in India building autonomous agentic workflows, scalable backend architectures, and polished web experiences.",
    images: ["https://adityahq.me/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrument.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Navbar />
        <main>{children}</main>
        <CommandMenu />
        <ConsoleGreet />
        <Analytics debug={false} />
      </body>
    </html>
  );
}
