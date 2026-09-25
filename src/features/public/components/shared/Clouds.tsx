import { cn } from "@/lib/cn";

// Soft cloud-like shapes from blurred radial gradients. Decorative only.
export function Clouds({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -left-24 top-10 h-72 w-96 rounded-full bg-background/80 blur-3xl" />
      <div className="absolute right-[-10%] top-1/4 h-80 w-[36rem] rounded-full bg-background/70 blur-3xl" />
      <div className="absolute bottom-[-20%] left-1/4 h-96 w-[48rem] rounded-full bg-background/90 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-64 w-80 rounded-full bg-brand-sky/50 blur-3xl" />
    </div>
  );
}
