import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { blogPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Engineering, design, and product essays from the TechAI team — on architecture, AI, cloud costs, and building software agencies that last.",
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Notes from the field"
        description="Essays from our engineers, designers, and leadership on how we actually build and ship software."
      />
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {blogPosts.map((post, idx) => (
            <Reveal key={post.slug} delay={idx * 0.05}>
              <Link href={`/blog/${post.slug}`} className="block h-full">
                <Card className="flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <Badge variant="accent" className="w-fit">
                    {post.category}
                  </Badge>
                  <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-foreground">
                    {post.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>
                      {format(new Date(post.date), "MMM d, yyyy")} · {post.readTime}
                    </span>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
