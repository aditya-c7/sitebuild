import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/sections/Navbar";
import CommandMenu from "@/components/ui/CommandMenu";
import CanvasBackground from "@/components/ui/CanvasBackground";
import DevToolsGuard from "@/components/ui/DevToolsGuard";
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

export const metadata: Metadata = {
  title: "Aditya Chitragar | Developer",
  description:
    "Portfolio of Aditya Chitragar — Developer building autonomous agentic workflows, scalable backend architectures, and polished web experiences.",
  keywords: [
    "Aditya Chitragar",
    "Developer",
    "Full-Stack",
    "AI",
    "Next.js",
    "Python",
    "FastAPI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrument.variable} font-sans antialiased`}>
        <CanvasBackground />
        <Navbar />
        <main>{children}</main>
        <CommandMenu />
        <DevToolsGuard />
        <ConsoleGreet />
        <Analytics debug={false} />
        <script src="https://platform.linkedin.com/badges/js/profile.js" async defer type="text/javascript"></script>
      </body>
    </html>
  );
}
