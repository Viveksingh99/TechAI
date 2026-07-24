import { DynamicIcon } from "@/components/dynamic-icon";
import { Reveal } from "@/components/marketing/reveal";
import { processSteps } from "@/data/process";

export function ProcessTimeline({ showDeliverables = false }: { showDeliverables?: boolean }) {
  return (
    <div className="relative">
      <div
        className="absolute left-6 top-2 hidden h-[calc(100%-2rem)] w-px bg-border sm:block lg:left-1/2"
        aria-hidden
      />
      <div className="space-y-10">
        {processSteps.map((step, idx) => (
          <Reveal key={step.step} delay={idx * 0.06}>
            <div
              className={`relative flex flex-col gap-6 sm:flex-row lg:items-center ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="flex items-center gap-4 sm:w-14 lg:w-auto lg:justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-accent text-accent-foreground">
                  <DynamicIcon name={step.icon} className="h-5 w-5" />
                </span>
              </div>
              <div
                className={`flex-1 rounded-2xl border border-border bg-card p-6 lg:w-[calc(50%-3rem)] ${
                  idx % 2 === 1 ? "lg:ml-auto" : ""
                }`}
              >
                <span className="font-display text-sm font-bold text-primary">
                  {step.step}
                </span>
                <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {showDeliverables && (
                  <ul className="mt-4 space-y-1.5">
                    {step.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
