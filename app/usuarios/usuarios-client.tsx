"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  gerente: "Gerente",
  atendente: "Atendente",
  comercial: "Comercial",
  vendas: "Vendas",
  compras: "Compras",
  financeiro: "Financeiro",
  engenheiro: "Engenheiro",
  tecnico: "Técnico",
  cliente: "Cliente",
};

const CREATABLE_ROLES = [
  "admin",
  "gerente",
  "atendente",
  "comercial",
  "vendas",
  "compras",
  "financeiro",
  "engenheiro",
];

type UserRow = { id: string; name: string | null; email: string; role: string; createdAt: string };

export function UsuariosClient({
  currentUserId,
  initialUsers,
}: {
  currentUserId: string;
  initialUsers: UserRow[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);

  async function criarUsuario(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErro(null);
    setSenhaGerada(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      role: String(fd.get("role") ?? "").trim(),
      password: String(fd.get("password") ?? "").trim() || null,
    };

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Falha ao criar usuário");
      setUsers((prev) => [{ ...data.user, createdAt: new Date().toISOString() }, ...prev]);
      if (data.temporaryPassword) setSenhaGerada(data.temporaryPassword);
      (document.getElementById("form-novo-usuario") as HTMLFormElement | null)?.reset();
      setStatus("idle");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErro(err instanceof Error ? err.message : "Erro inesperado");
    }
  }

  async function mudarFuncao(id: string, role: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    try {
      await fetch(`/api/usuarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      router.refresh();
    } catch {
      // mantem a troca otimista mesmo se o refresh falhar silenciosamente
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">{users.length} usuário(s) cadastrado(s).</p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "+ Novo usuário"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardTitle>Novo usuário de equipe</CardTitle>
          <form id="form-novo-usuario" onSubmit={criarUsuario} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm text-fg-muted">
                  Nome *
                </label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-fg-muted">
                  E-mail *
                </label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="role" className="mb-1 block text-sm text-fg-muted">
                  Função *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  defaultValue=""
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus-visible:border-brand"
                >
                  <option value="" disabled>
                    Selecione…
                  </option>
                  {CREATABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm text-fg-muted">
                  Senha (opcional — gera uma se deixar em branco)
                </label>
                <Input id="password" name="password" type="text" placeholder="Deixe em branco pra gerar" />
              </div>
            </div>
            {status === "error" && erro ? (
              <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-accent">{erro}</p>
            ) : null}
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Criando…" : "Criar usuário"}
            </Button>
          </form>
        </Card>
      ) : null}

      {senhaGerada ? (
        <Card>
          <p className="text-sm text-fg">
            Usuário criado. Senha provisória (anote — não será mostrada de novo):
          </p>
          <p className="mt-2 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-fg">
            {senhaGerada}
          </p>
        </Card>
      ) : null}

      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.id} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-medium text-fg">
                {u.name || u.email}
                {u.id === currentUserId ? <span className="ml-2 text-xs text-accent">(você)</span> : null}
              </p>
              <p className="truncate text-xs text-fg-muted">{u.email}</p>
            </div>
            <select
              value={u.role}
              onChange={(e) => mudarFuncao(u.id, e.target.value)}
              className="shrink-0 rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-fg outline-none focus-visible:border-brand"
            >
              {Object.keys(ROLE_LABEL).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </Card>
        ))}
      </div>
    </div>
  );
}
