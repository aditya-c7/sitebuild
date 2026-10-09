import type { Metadata, Viewport } from "next";

// AI-only viewport: Android Chrome + Firefox shrink the layout cleanly
// with the keyboard instead of overlay-bouncing. iOS Safari ignores this
// key (open WebKit bug) and is handled via visualViewport JS in page.tsx.
export const viewport: Viewport = {
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "AI Assistant | Aditya Chitragar",
  description:
    "Chat with an AI assistant that answers questions about Aditya Chitragar — his skills, experience, and projects.",
  alternates: {
    canonical: "https://adityahq.me/ai",
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
