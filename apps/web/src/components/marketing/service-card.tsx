import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DynamicIcon } from "@/components/dynamic-icon";
import { Reveal } from "@/components/marketing/reveal";
import type { Service } from "@/data/services";

export function ServiceCard({ service, delay = 0 }: { service: Service; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Link href={`/services/${service.slug}`} className="group block h-full">
        <Card className="h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <DynamicIcon name={service.icon} className="h-5 w-5" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
            {service.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {service.summary}
          </p>
        </Card>
      </Link>
    </Reveal>
  );
}
