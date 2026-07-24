import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-mesh-gradient opacity-60" aria-hidden />
      <div className="absolute inset-0 bg-grid-pattern opacity-40" aria-hidden />

      <Link href="/" className="relative z-10 mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display text-sm font-bold">
          T
        </span>
        <span className="font-display text-xl font-bold tracking-tight text-foreground">
          TechAI
        </span>
      </Link>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
