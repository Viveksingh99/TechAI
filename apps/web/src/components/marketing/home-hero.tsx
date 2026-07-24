"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 bg-mesh-gradient" aria-hidden />
      <div className="absolute inset-0 bg-grid-pattern opacity-50 mask-fade-b" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" aria-hidden />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-28 pb-24 text-center sm:px-6 sm:pt-36 sm:pb-32 lg:px-8"
      >
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-4 py-1.5 text-xs font-medium text-foreground/80">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Software engineering &amp; applied AI, done properly
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-8 font-display text-6xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-7xl md:text-8xl lg:text-[7.5rem]"
        >
          <span className="block">Tech</span>
          <span className="block text-gradient">AI</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          We design, engineer, and scale web, mobile, and AI products for
          startups and enterprises — one dedicated team, from first commit to
          production.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button size="lg" asChild>
            <Link href="/consultation">
              Book a Free Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/portfolio">See Our Work</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
