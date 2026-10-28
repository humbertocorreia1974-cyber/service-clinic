# Sistema de design — Service Clinic
Gerado com **UI/UX Pro Max** (curadoria de estilo + paleta + tipografia).
- **Estilo:** Light Mode (clinico, alto contraste)
- **Palavras-chave:** Light theme, clean, high contrast, deep teal brand, warm amber accent, eye-friendly, clinical, trustworthy
- **Modo:** light
- **Fontes:** Archivo (titulos) / Inter (corpo)
- **Efeitos:** Minimal glow (text-shadow: 0 0 10px), subtle depth via shadows (nao glow em tema claro), high readability, visible focus
- **Padrao de landing:** Real-Time / Operations Landing — Hero (product + live preview or status) > Key metrics/indicators > How it works > CTA (Start trial / Contact)
- **Evitar:** Slow dashboards + decorative charts + hidden error states
## Tokens (CSS vars em `app/globals.css`)
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
_Use SEMPRE os tokens (`bg-brand`, `text-fg`, `border-border`...), nunca hex cru. Overlays de hover/active usam o token de texto (`bg-fg/5`, `bg-fg/10`), nunca branco/preto cru — o tema e claro, nao escuro._

> Nota (2026-10-28): este arquivo estava desatualizado — ainda descrevia o
> tema escuro original mesmo depois da migracao pro tema claro em 01/10.
> Documentacao gerada no build nao e re-executada em correcoes manuais
> pos-build; revisar manualmente quando a paleta mudar de novo.