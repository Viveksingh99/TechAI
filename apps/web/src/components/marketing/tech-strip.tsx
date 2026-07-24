import { DynamicIcon } from "@/components/dynamic-icon";
import { Reveal } from "@/components/marketing/reveal";
import { technologyCategories } from "@/data/technologies";

export function TechStrip() {
  const items = technologyCategories.flatMap((category) => category.items);

  return (
    <div className="relative overflow-hidden py-4">
      <div className="flex w-max animate-[scroll_36s_linear_infinite] gap-3">
        {[...items, ...items].map((tech, idx) => (
          <span
            key={`${tech.name}-${idx}`}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80"
          >
            <DynamicIcon name={tech.icon} className="h-4 w-4 text-primary" />
            {tech.name}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export function TechCategoryGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {technologyCategories.map((category, idx) => (
        <Reveal key={category.category} delay={idx * 0.05}>
          <div className="h-full rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-base font-semibold text-foreground">
              {category.category}
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{category.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {category.items.map((item) => (
                <span
                  key={item.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground/80"
                >
                  <DynamicIcon name={item.icon} className="h-3.5 w-3.5 text-primary" />
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
