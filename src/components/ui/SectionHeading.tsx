interface SectionHeadingProps {
  index: string;
  title: string;
}

export default function SectionHeading({ index, title }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-baseline gap-3">
      <span className="font-mono text-sm text-blue-500">/{index}</span>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">{title}</h2>
      <span className="ml-2 hidden h-px flex-1 self-center bg-gradient-to-r from-zinc-800 to-transparent sm:block" />
    </div>
  );
}
