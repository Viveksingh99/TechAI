import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reveal } from "@/components/marketing/reveal";
import { CtaBand } from "@/components/marketing/cta-band";
import { blogPosts, getBlogPostBySlug } from "@/data/blog";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return { title: post.title, description: post.excerpt };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <Reveal>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← All Posts
          </Link>
          <Badge variant="accent" className="mt-6">
            {post.category}
          </Badge>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-6 flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{post.author}</p>
              <p className="text-xs text-muted-foreground">
                {post.authorRole} · {format(new Date(post.date), "MMMM d, yyyy")} ·{" "}
                {post.readTime}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="prose-techai mt-12 space-y-6">
          {post.content.map((paragraph, idx) => (
            <p key={idx} className="text-base leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
      <CtaBand
        title="Want to talk through an idea like this?"
        description="We love a good architecture debate. Book time with our engineering team."
      />
    </>
  );
}
