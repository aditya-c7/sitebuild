interface SectionHeadingProps {
  index: string;
  title: string;
}

export default function SectionHeading({ index, title }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span aria-hidden="true" className="shrink-0 font-mono text-sm text-zinc-500">
        {index}
      </span>
      <h2 className="shrink-0 font-display text-lg font-semibold tracking-tight text-zinc-100 md:text-2xl">{title}</h2>
      <span aria-hidden="true" className="h-[2px] flex-1 self-center rounded-full bg-gradient-to-r from-transparent via-white/[0.08] to-white/40" />
    </div>
  );
}
