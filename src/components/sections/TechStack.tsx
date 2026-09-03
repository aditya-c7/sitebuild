import { TECH_STACK } from "@/data/portfolioData";
import SectionHeading from "@/components/ui/SectionHeading";
import { getTechIcon } from "@/components/ui/TechIcons";

export default function TechStack() {
  return (
    <section id="tech-stack" className="mx-auto max-w-4xl px-6 pb-14 md:pb-16 no-select select-none">
      <SectionHeading index="01" title="Tech Stack" />

      <div className="flex flex-wrap gap-2.5">
        {TECH_STACK.map((tech) => {
          const { icon: Icon, className } = getTechIcon(tech.name);
          return (
            <span
              key={tech.name}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#18181b] px-3.5 py-2 text-sm text-zinc-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-[#202023] hover:text-zinc-100"
            >
              <Icon className={`h-4 w-4 shrink-0 ${className}`} />
              {tech.name}
            </span>
          );
        })}
      </div>
    </section>
  );
}
