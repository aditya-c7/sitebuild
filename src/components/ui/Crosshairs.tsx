export function Crosshairs() {
  return (
    <>
      <span className="absolute -top-2 -left-2 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
      <span className="absolute -top-2 -right-2 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
      <span className="absolute -bottom-2 -left-2 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
      <span className="absolute -bottom-2 -right-2 text-zinc-600 font-mono text-xs select-none pointer-events-none">+</span>
    </>
  );
}
