# Sistema de design — Service Clinic
Gerado com **UI/UX Pro Max** (curadoria de estilo + paleta + tipografia).
- **Estilo:** Tema claro clinico (atualizado 2026-10-01, ver comentario em app/globals.css)
- **Palavras-chave:** Light theme, clinico, petroleo, ambar, alto contraste, acessivel, sem cara de SaaS generico de IA
- **Modo:** light
- **Fontes:** Archivo (titulos) / Inter (corpo)
- **Padrao de landing:** Real-Time / Operations Landing — Hero (product + live preview or status) > Key metrics/indicators > How it works > CTA (Start trial / Contact)
- **Evitar:** Slow dashboards + decorative charts + hidden error states
## Tokens (CSS vars em `app/globals.css`, atuais)
```css
--bg: 40 20% 99%;
--surface: 0 0% 100%;
--surface-2: 190 30% 95%;
--border: 195 20% 87%;
--fg: 200 45% 12%;
--fg-muted: 197 15% 38%;
--brand: 187 70% 26%;
--brand-fg: 0 0% 100%;
--accent: 32 88% 48%;
--accent-fg: 0 0% 100%;
```
_Use SEMPRE os tokens (`bg-brand`, `text-fg`, `border-border`…), nunca hex cru._

> Nota (2026-10-28): este arquivo estava desatualizado — ainda descrevia o
> tema escuro original mesmo depois da migracao pro tema claro em 01/10.
> Documentacao gerada no build nao e re-executada em correcoes manuais
> pos-build; revisar manualmente quando a paleta mudar de novo.