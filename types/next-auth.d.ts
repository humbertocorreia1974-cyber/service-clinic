import type { DefaultSession, DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

// lib/auth.ts anexa `role` na sessão em runtime (callbacks jwt/session) mas o
// next-auth não conhece esse campo por padrão -- isso fazia TODO acesso a
// `session.user.role` falhar o type-check estrito (17 ocorrências reais,
// achado na auditoria de 2026-10-02). Esta augmentação de módulo declara o
// campo de verdade, sem mudar nenhum comportamento em runtime.
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role?: string;
    id?: string;
  }
}
