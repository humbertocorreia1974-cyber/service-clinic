import Link from "next/link";

/** Atalho fixo "Como usar a plataforma" (gerado pelo JGNEXT). */
export default function GuidePill() {
  return (
    <Link
      href="/primeiros-passos"
      className="fixed bottom-24 right-4 z-40 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg shadow-lg transition-colors hover:bg-brand hover:text-brand-fg"
    >
      Como usar a plataforma
    </Link>
  );
}
