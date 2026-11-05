import { TECH_STACK } from "@/data/portfolioData";
import SectionHeading from "@/components/ui/SectionHeading";
import { getTechIcon } from "@/components/ui/TechIcons";

// Official multicolor Devicon artwork (served from /public/tech). The glyph
// keeps its real brand palette in both themes instead of being tinted by
// CSS, which is what made the monochrome icons look washed out in light mode.
const TECH_IMAGES: Record<string, string> = {
  python: "/tech/python.svg",
  javascript: "/tech/javascript.svg",
  typescript: "/tech/typescript.svg",
  html: "/tech/html.svg",
  c: "/tech/c.svg",
  sql: "/tech/sql.svg",
  numpy: "/tech/numpy.svg",
  linux: "/tech/linux.svg",
  fastapi: "/tech/fastapi.svg",
  "node-js": "/tech/node-js.svg",
  mongodb: "/tech/mongodb.svg",
  firebase: "/tech/firebase.svg",
  react: "/tech/react.svg",
  "next-js": "/tech/next-js.svg",
  "tailwind-css": "/tech/tailwind-css.svg",
  git: "/tech/git.svg",
  "github-actions": "/tech/github-actions.svg",
  postman: "/tech/postman.svg",
  playwright: "/tech/playwright.svg",
  vercel: "/tech/vercel.svg",
};

export default function TechStack() {
  return (
    <section id="tech-stack" className="mx-auto max-w-4xl px-5 pb-10 md:max-w-[832px] md:px-6 md:pb-16 no-select select-none">
      <SectionHeading title="Tech Stack" />

      <div className="flex flex-wrap justify-center gap-2">
        {TECH_STACK.map((tech) => {
          const { icon: Icon, className } = getTechIcon(tech.name);
          const slug = tech.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const imageSrc = TECH_IMAGES[slug];
          return (
            <span
              key={tech.name}
              className="tech-chip inline-flex items-center gap-1.5 rounded-lg bg-[linear-gradient(180deg,#1C1C1E_0%,#101012_45%,#0A0A0B_100%)] px-2.5 py-1 text-xs text-zinc-400 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_0_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:text-zinc-200 hover:brightness-[1.08] hover:shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.2),inset_0_-1px_0_0_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.45)] md:gap-1.5 md:px-3 md:py-1.5 md:text-[13px]"
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt=""
                  aria-hidden="true"
                  data-tech={slug}
                  className="tech-icon h-4 w-4 shrink-0 object-contain md:h-[18px] md:w-[18px]"
                />
              ) : (
                <Icon data-tech={slug} className={`h-4 w-4 shrink-0 ${className}`} />
              )}
              {tech.name}
            </span>
          );
        })}
      </div>
    </section>
  );
}
