"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NovoTecnicoForm({ cidades }: { cidades: string[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [criarAcesso, setCriarAcesso] = useState(true);
  const [cidadesSelecionadas, setCidadesSelecionadas] = useState<string[]>([]);

  function toggleCidade(c: string) {
    setCidadesSelecionadas((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErro(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      specialties: String(fd.get("specialties") ?? "").trim(),
      cities: cidadesSelecionadas,
      criarAcesso,
    };

    if (!cidadesSelecionadas.length) {
      setStatus("error");
      setErro("Selecione ao menos uma cidade atendida.");
      return;
    }

    try {
      const res = await fetch("/api/tecnicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Falha ao criar técnico");
      setStatus("ok");
      setSenhaGerada(data?.temporaryPassword ?? null);
      if (!data?.temporaryPassword) {
        router.push("/tecnicos");
        router.refresh();
      }
    } catch (err) {
      setStatus("error");
      setErro(err instanceof Error ? err.message : "Erro inesperado");
    }
  }

  if (status === "ok" && senhaGerada) {
    return (
      <div className="p-6">
        <p className="font-display text-lg font-semibold text-fg">Técnico criado com sucesso.</p>
        <p className="mt-2 text-sm text-fg-muted">
          Acesso provisionado. Anote a senha provisória abaixo — ela não será mostrada de novo
          (também tentamos enviar por e-mail):
        </p>
        <p className="mt-3 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg">
          {senhaGerada}
        </p>
        <Button
          className="mt-4"
          size="sm"
          onClick={() => {
            router.push("/tecnicos");
            router.refresh();
          }}
        >
          Voltar para técnicos
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm text-fg-muted">
            Nome *
          </label>
          <Input id="name" name="name" required placeholder="João Batista" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm text-fg-muted">
            Telefone *
          </label>
          <Input id="phone" name="phone" required placeholder="(24) 9 9999-9999" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-fg-muted">
          E-mail *
        </label>
        <Input id="email" name="email" type="email" required placeholder="tecnico@serviceclinic.com.br" />
      </div>

      <div>
        <label htmlFor="specialties" className="mb-1 block text-sm text-fg-muted">
          Especialidades (separadas por vírgula)
        </label>
        <Input id="specialties" name="specialties" placeholder="Cadeira odontológica, Autoclave, PMOC" />
      </div>

      <div>
        <p className="mb-2 block text-sm text-fg-muted">Cidades atendidas *</p>
        <div className="flex flex-wrap gap-3">
          {cidades.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm text-fg">
              <input
                type="checkbox"
                checked={cidadesSelecionadas.includes(c)}
                onChange={() => toggleCidade(c)}
                className="h-4 w-4 rounded border-border"
              />
              {c}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-fg">
        <input
          type="checkbox"
          checked={criarAcesso}
          onChange={(e) => setCriarAcesso(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        Criar acesso ao app do técnico com este e-mail
      </label>

      {status === "error" && erro && (
        <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-accent">{erro}</p>
      )}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Salvando…" : "Criar técnico"}
      </Button>
    </form>
  );
}
