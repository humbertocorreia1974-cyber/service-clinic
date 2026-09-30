"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NovoClienteForm({ cidades }: { cidades: string[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [criarAcesso, setCriarAcesso] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErro(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      razaoSocial: String(fd.get("razaoSocial") ?? "").trim(),
      nomeFantasia: String(fd.get("nomeFantasia") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      whatsapp: String(fd.get("whatsapp") ?? "").trim() || null,
      cnpj: String(fd.get("cnpj") ?? "").trim() || null,
      addressCity: String(fd.get("addressCity") ?? "").trim(),
      addressStreet: String(fd.get("addressStreet") ?? "").trim() || null,
      addressNumber: String(fd.get("addressNumber") ?? "").trim() || null,
      criarAcesso,
    };

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Falha ao criar cliente");
      setStatus("ok");
      setSenhaGerada(data?.temporaryPassword ?? null);
      if (!data?.temporaryPassword) {
        router.push("/clientes");
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
        <p className="font-display text-lg font-semibold text-fg">Cliente criado com sucesso.</p>
        <p className="mt-2 text-sm text-fg-muted">
          Acesso ao portal provisionado. Anote a senha provisória abaixo — ela não será mostrada de novo
          (também tentamos enviar por e-mail):
        </p>
        <p className="mt-3 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg">
          {senhaGerada}
        </p>
        <Button
          className="mt-4"
          size="sm"
          onClick={() => {
            router.push("/clientes");
            router.refresh();
          }}
        >
          Voltar para clientes
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nomeFantasia" className="mb-1 block text-sm text-fg-muted">
            Nome fantasia *
          </label>
          <Input id="nomeFantasia" name="nomeFantasia" required placeholder="Clínica OdontoVida" />
        </div>
        <div>
          <label htmlFor="razaoSocial" className="mb-1 block text-sm text-fg-muted">
            Razão social *
          </label>
          <Input id="razaoSocial" name="razaoSocial" required placeholder="OdontoVida Serviços Odontológicos LTDA" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-fg-muted">
            E-mail *
          </label>
          <Input id="email" name="email" type="email" required placeholder="contato@clinica.com.br" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm text-fg-muted">
            Telefone *
          </label>
          <Input id="phone" name="phone" required placeholder="(24) 3333-4444" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="whatsapp" className="mb-1 block text-sm text-fg-muted">
            WhatsApp
          </label>
          <Input id="whatsapp" name="whatsapp" placeholder="(24) 9 9999-9999" />
        </div>
        <div>
          <label htmlFor="cnpj" className="mb-1 block text-sm text-fg-muted">
            CNPJ
          </label>
          <Input id="cnpj" name="cnpj" placeholder="00.000.000/0001-00" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="addressCity" className="mb-1 block text-sm text-fg-muted">
            Cidade *
          </label>
          <select
            id="addressCity"
            name="addressCity"
            required
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 focus-visible:border-brand"
          >
            <option value="">Selecione…</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="addressStreet" className="mb-1 block text-sm text-fg-muted">
            Rua
          </label>
          <Input id="addressStreet" name="addressStreet" placeholder="Av. Central" />
        </div>
        <div>
          <label htmlFor="addressNumber" className="mb-1 block text-sm text-fg-muted">
            Número
          </label>
          <Input id="addressNumber" name="addressNumber" placeholder="123" />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-fg">
        <input
          type="checkbox"
          checked={criarAcesso}
          onChange={(e) => setCriarAcesso(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        Criar acesso ao portal do cliente com este e-mail
      </label>

      {status === "error" && erro && (
        <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-accent">{erro}</p>
      )}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Salvando…" : "Criar cliente"}
      </Button>
    </form>
  );
}
