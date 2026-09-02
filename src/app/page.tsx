import { Spotlight } from "@/components/ui/Spotlight";
import HeroBanner from "@/components/HeroBanner";
import Hero from "@/components/sections/Hero";
import TechStack from "@/components/sections/TechStack";
import Projects from "@/components/sections/Projects";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <Spotlight>
      <div id="top">
        <HeroBanner imageSrc="/banner.jpg" />
        <Hero />
        <TechStack />
        <Projects />
        <Footer />
      </div>
    </Spotlight>
  );
}
