import type { Metadata } from "next";
import HeroBanner from "@/components/HeroBanner";
import Hero from "@/components/sections/Hero";
import TechStack from "@/components/sections/TechStack";
import Experience from "@/components/sections/Experience";
import GitHubActivity from "@/components/sections/GitHubActivity";
import Projects from "@/components/sections/Projects";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "Aditya Chitragar | Developer",
  description:
    "Portfolio of Aditya Chitragar, a Computer Science student and developer in India. Explore his experience, projects, tech stack, and GitHub activity.",
  alternates: {
    canonical: "https://adityahq.me/",
  },
};

// Facts below mirror visible page content and public profile links only:
// name, role, bio, and socials come from src/data/portfolioData.ts.
// The twitter/discord entries there are placeholders, so sameAs lists only
// the real GitHub and LinkedIn profiles.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Aditya Chitragar",
  url: "https://adityahq.me/",
  image: "https://adityahq.me/og-image.jpg",
  description:
    "Computer Science student and developer in India. SDET Intern at Marvedge.",
  jobTitle: "Developer",
  worksFor: {
    "@type": "Organization",
    name: "Marvedge",
  },
  sameAs: [
    "https://github.com/aditya-c7",
    "https://linkedin.com/in/adityachitragar",
  ],
  knowsAbout: [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "FastAPI",
    "MongoDB",
    "AI",
    "RAG",
  ],
};

export default function Home() {
  return (
    <div id="top">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <HeroBanner imageSrc="/banner.jpg" />
        <Hero />
        <TechStack />
        <Experience />
        <GitHubActivity />
        <Projects />
        <Footer />
    </div>
  );
}
