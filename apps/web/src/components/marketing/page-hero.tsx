import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  className,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-mesh-gradient opacity-60" aria-hidden />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 mask-fade-b" aria-hidden />
      <div
        className={cn(
          "relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8",
          className
        )}
      >
        {eyebrow && (
          <Badge variant="accent" className="mx-auto mb-5 w-fit">
            {eyebrow}
          </Badge>
        )}
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
