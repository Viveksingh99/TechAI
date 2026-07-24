import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reveal } from "@/components/marketing/reveal";
import type { Testimonial } from "@/data/testimonials";

export function TestimonialCard({
  testimonial,
  delay = 0,
}: {
  testimonial: Testimonial;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <Card className="flex h-full flex-col justify-between p-6">
        <div>
          <div className="flex gap-0.5">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-primary text-primary" />
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/90">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{testimonial.avatarInitials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">
              {testimonial.role}, {testimonial.company}
            </p>
          </div>
        </div>
      </Card>
    </Reveal>
  );
}
