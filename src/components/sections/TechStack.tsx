import { TECH_STACK } from "@/data/portfolioData";
import SectionHeading from "@/components/ui/SectionHeading";
import { getTechIcon } from "@/components/ui/TechIcons";

export default function TechStack() {
  return (
    <section id="tech-stack" className="mx-auto max-w-4xl px-5 pb-10 md:max-w-[960px] md:px-6 md:pb-16 no-select select-none">
      <SectionHeading index="01" title="Tech Stack" />

      <div className="flex flex-wrap justify-center gap-2.5">
        {TECH_STACK.map((tech) => {
          const { icon: Icon, className } = getTechIcon(tech.name);
          return (
            <span
              key={tech.name}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(180deg,#34302C_0%,#2E2A27_45%,#282524_100%)] px-2.5 py-1 text-xs text-zinc-400 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_0_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.55),0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:text-zinc-200 hover:brightness-[1.08] hover:shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.2),inset_0_-1px_0_0_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.55),0_4px_12px_rgba(0,0,0,0.45)] md:gap-2 md:px-3.5 md:py-2 md:text-sm"
            >
              <Icon className={`h-4 w-4 shrink-0 md:h-5 md:w-5 ${className}`} />
              {tech.name}
            </span>
          );
        })}
      </div>
    </section>
  );
}
