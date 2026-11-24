import Link from 'next/link';
import { copy } from '@/content/copy';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Boas-vindas · Service Clinic' };

export default function WelcomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-base font-semibold tracking-tight text-fg">
        <img src="/logo.svg" alt="Service Clinic" className="h-9 w-9 rounded-lg shadow-md shadow-brand/20" />
        Service Clinic
      </Link>
      <h1 className="font-display text-3xl font-bold tracking-tight text-fg">{copy.onboarding.welcomeTitle}</h1>
      <ol className="mt-6 space-y-3">
        {copy.onboarding.steps.map((step, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-border bg-surface p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">{i + 1}</span>
            <p className="text-sm text-fg">{step}</p>
          </li>
        ))}
      </ol>
      {copy.onboarding.helpTips.length > 0 && (
        <Card className="mt-8">
          <CardTitle>Dicas rápidas</CardTitle>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg-muted">
            {copy.onboarding.helpTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </Card>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/dashboard"><Button>Ir para o painel</Button></Link>
        <Link href="/primeiros-passos"><Button variant="ghost">Ver o passo a passo completo</Button></Link>
      </div>
    </main>
  );
}
