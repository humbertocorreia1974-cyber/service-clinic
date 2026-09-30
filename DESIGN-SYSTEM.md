# Sistema de design — Service Clinic
Gerado com **UI/UX Pro Max** (curadoria de estilo + paleta + tipografia).
- **Estilo:** Dark Mode (OLED)
- **Palavras-chave:** Dark theme, low light, high contrast, deep black, midnight blue, eye-friendly, OLED, night mode, power efficient
- **Modo:** dark
- **Fontes:** Archivo (títulos) / Inter (corpo)
- **Efeitos:** Minimal glow (text-shadow: 0 0 10px), dark-to-light transitions, low white emission, high readability, visible focus
- **Padrão de landing:** Real-Time / Operations Landing — Hero (product + live preview or status) > Key metrics/indicators > How it works > CTA (Start trial / Contact)
- **Evitar:** Slow dashboards + decorative charts + hidden error states
## Tokens (CSS vars em `app/globals.css`)
```css
--bg: 200 45% 8%;
--surface: 197 40% 11%;
--surface-2: 195 35% 16%;
--border: 193 25% 24%;
--fg: 190 30% 96%;
--fg-muted: 192 18% 72%;
--brand: 187 65% 32%;
--brand-fg: 0 0% 100%;
--accent: 38 92% 55%;
--accent-fg: 30 60% 10%;
```
_Use SEMPRE os tokens (`bg-brand`, `text-fg`, `border-border`…), nunca hex cru._