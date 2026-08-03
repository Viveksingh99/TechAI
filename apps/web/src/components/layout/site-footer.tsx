"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { COMPANY } from "@/data/company";
import { services } from "@/data/services";

const serviceLinks = services.slice(0, 6);

const companyLinks = [
  { label: "About & Team", href: "/team" },
  { label: "Our Process", href: "/process" },
  { label: "Careers", href: "/careers" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
];

const resourceLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Technologies", href: "/technologies" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQs", href: "/faqs" },
  { label: "Book a Consultation", href: "/consultation" },
];

export function SiteFooter() {
  const [email, setEmail] = React.useState("");

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("You're subscribed. Welcome to the TechAI newsletter.");
    setEmail("");
  }

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div className="max-w-sm">
            <BrandLogo size="md" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              A software agency designing and engineering web, mobile, AI, and
              cloud products for startups and enterprises — from first line
              of code to production scale.
            </p>
            <div className="mt-5 space-y-1.5 text-sm text-muted-foreground">
              <p>
                <a href={COMPANY.emailHref} className="hover:text-foreground hover:underline">
                  {COMPANY.email}
                </a>
              </p>
              <p>
                <a href={COMPANY.phoneHref} className="hover:text-foreground hover:underline">
                  {COMPANY.phone}
                </a>
              </p>
              <p className="leading-relaxed">
                {COMPANY.addressLine1}, {COMPANY.addressLine2}
                <span className="block text-xs">{COMPANY.locationNote}</span>
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <SocialLink href="https://twitter.com" label="Twitter">
                <XIcon className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="https://linkedin.com" label="LinkedIn">
                <LinkedInIcon className="h-4 w-4" />
              </SocialLink>
              <SocialLink href="https://github.com" label="GitHub">
                <GitHubIcon className="h-4 w-4" />
              </SocialLink>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Services
            </h3>
            <ul className="mt-4 space-y-3">
              {serviceLinks.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/services"
                  className="text-sm font-medium text-primary transition-colors hover:opacity-80"
                >
                  View all →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">
              Stay in the loop
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Engineering deep-dives and product updates, once or twice a
              month. No spam.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <Button type="submit" size="icon" aria-label="Subscribe">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <ul className="mt-6 space-y-3">
              {resourceLinks.slice(0, 3).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TechAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/faqs" className="text-xs text-muted-foreground hover:text-foreground">
              FAQs
            </Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground">
              Contact
            </Link>
            <Link href="/pricing" className="text-xs text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.5 8.6L22.9 22h-6.9l-5.4-7-6.2 7H1.3l8-9.2L1 2h7l4.9 6.4L18.9 2Zm-2.4 18h2L7.6 4h-2l11 16Z" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.11 20.45H3.56V9h3.55v11.45Z" />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.31 6.84 9.66.5.1.68-.22.68-.49v-1.9c-2.78.62-3.37-1.36-3.37-1.36-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.36 1.11 2.93.85.09-.66.35-1.11.64-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.9-1.32 2.74-1.05 2.74-1.05.56 1.41.2 2.46.1 2.72.65.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z"
      />
    </svg>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </a>
  );
}
