import { TECH_STACK } from "@/data/portfolioData";
import SectionHeading from "@/components/ui/SectionHeading";
import { getTechIcon } from "@/components/ui/TechIcons";

export default function TechStack() {
  return (
    <section id="tech-stack" className="mx-auto max-w-4xl px-5 pb-10 md:max-w-[960px] md:px-6 md:pb-16 no-select select-none">
      <SectionHeading index="01" title="Tech Stack" />

      <div className="flex flex-wrap gap-2.5">
        {TECH_STACK.map((tech) => {
          const { icon: Icon, className } = getTechIcon(tech.name);
          return (
            <span
              key={tech.name}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#38332F] px-2.5 py-1.5 text-xs text-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-[#44403C] hover:text-zinc-100 md:px-3.5 md:py-2 md:text-sm"
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 md:h-4 md:w-4 ${className}`} />
              {tech.name}
            </span>
          );
        })}
      </div>
    </section>
  );
}
