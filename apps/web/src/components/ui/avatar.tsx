"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

interface AvatarImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

function AvatarImage({ src, alt = "", className }: AvatarImageProps) {
  const [errored, setErrored] = React.useState(false);
  if (!src || errored) return null;
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="40px"
      className={cn("object-cover", className)}
      onError={() => setErrored(true)}
    />
  );
}

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
