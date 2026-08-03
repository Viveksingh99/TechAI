import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  /** compact = nav/sidebar, full = auth pages */
  size?: "sm" | "md" | "lg";
  priority?: boolean;
};

/** Native asset is 700×256 — keep aspect ratio when scaling */
const sizeMap = {
  sm: { height: 40, width: 110, className: "h-10 w-auto max-w-[160px]" },
  md: { height: 52, width: 142, className: "h-[52px] w-auto max-w-[200px]" },
  lg: { height: 72, width: 197, className: "h-[72px] w-auto max-w-[260px]" },
} as const;

export function BrandLogo({
  href = "/",
  className,
  size = "sm",
  priority = false,
}: BrandLogoProps) {
  const dims = sizeMap[size];

  const mark = (
    <span className={cn("relative inline-flex items-center", dims.className, className)}>
      <Image
        src="/brand/techai-logo.png"
        alt="TechAI — Digital Innovation Partners"
        width={dims.width}
        height={dims.height}
        priority={priority}
        className="h-full w-auto object-contain"
      />
    </span>
  );

  if (!href) return mark;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="TechAI home">
      {mark}
    </Link>
  );
}
