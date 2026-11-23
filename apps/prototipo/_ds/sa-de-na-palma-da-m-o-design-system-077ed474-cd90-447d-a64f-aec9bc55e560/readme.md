# Saúde na Palma da Mão — Design System

App for private clinics, designed first for **older patients**. Via the app (React Native + Expo, also as PWA) or WhatsApp, the patient finds the specialty and nearest clinic and books an appointment. Optionally, an AI pre-triage suggests a specialty (never a diagnosis). At the clinic, reception confirms arrival by CPF and the doctor receives the patient as "pronto para atendimento". Status: prototype + documentation; implementation planned in React Native, Node.js and Firestore.

## Sources
- `uploads/Saúde na Palma da Mão - Interface e Design System.pdf` (copy: `uploads/source.pdf`) — chapter of "Atividade v1.1", Nov 19 2026, @yasmin. All token values, the component inventory and the accessibility rules come from it.
- Referenced but not accessible: "Saúde na Palma da Mão — Design System" artifact (https://claude.ai/artifact/7fAJ1RTgyKMvCASDqrxSsu) and the Figma prototype (Figura 1: Login, Cadastro, Home, Especialidades, Cardiologia).

## Products / surfaces
- **Patient app** (mobile, primary) — covered by `ui_kits/patient-app`.
- Reception screen (desktop, CPF check-in), doctor queue (desktop), admin panels — profiles exist but no screens designed yet.
- WhatsApp channel — follows only the voice/content rules below.

## CONTENT FUNDAMENTALS
- **Language:** Brazilian Portuguese. Plain, everyday words; no medical jargon in patient UI.
- **Address:** "você" (second person, informal-respectful). The app speaks to the patient: "Sua consulta continua marcada."
- **Casing:** sentence case everywhere — buttons, titles, tabs ("Confirmar horário", "Acesso rápido", "Prefiro conversar pelo WhatsApp").
- **Buttons are verbs:** "Entrar", "Agendar", "Remarcar", "Confirmar horário".
- **Errors say what to do next** and offer an alternative: "Não conseguimos falar com o WhatsApp. Sua consulta continua marcada." Busy slot (HTTP 409): explain the time was taken and return to the slot list keeping filled data.
- **AI wording:** always "Sugestão de especialidade", never "diagnóstico"; manual choice always offered alongside.
- **Urgency:** red is reserved for real errors/urgency; an urgency notice tells the patient to seek in-person care, with text + icon.
- **Privacy:** WhatsApp notices carry no clinical content; the button leads into the authenticated app.
- **Doctor queue:** show freshness — "Atualizado há X segundos".
- **Status vocabulary** (from UML): "Agendado", "Pronto para atendimento", "Concluído". "A caminho" has no badge yet.
- **No emoji.** Icons always accompany text, never replace it.

## VISUAL FOUNDATIONS
- **Color:** teal identity. Primary `--teal-600 #03757f` (main button, titles, nav icons). Header gradient `--teal-700 #005170 → --teal-500 #017c94`. Selection `--teal-100 #d2e6e8`. Specialty circles `--rose-100 #f7e4e4`. WhatsApp pill `--cyan-50 #d7fcff` + `--mint-300 #85d2a9`. Ink `#17393d` / muted `#4f6b6e` (5.7:1). Signals success `#1f7a4d`, warning `#8a6100`, error `#b3261e`.
- **Quick access colors are fixed:** blue = consultas, lilac = exames, rose = receitas, sand = pré-triagem (`--qa-sand-ink #8a5a2b`, 5.9:1). Only sand-ink is specified; the other bg/ink pairs are approximations.
- **Contrast:** text ≥ 4.5:1; borders/icons ≥ 3:1. Field border `--border-control #6f969a` at 2px. The legacy `#d6e9ea` border is for dividers only.
- **Type:** Roboto only. display 40 · title-1 28 · title-2 22 · title-3 18 · body-lg 18 (default) · body 16 · label 16 · caption 14 (minimum). Must survive 200% OS font scaling without clipping. Weights/line-heights (700 titles, 500 label/title-3, 400 body) are DS defaults, not from the source.
- **Spacing:** 4px steps (4, 8, 12, 16, 24, 32, 48). Screen side margin 24px. Touch targets ≥ 48×48.
- **Radii:** 14px fields & buttons; 20px cards; 32px white sheet; full circle for avatars, specialties, chips, WhatsApp pill.
- **Signature layout:** gradient header with a white 32px-radius sheet that rises over it (Login, Cadastro, Home). Internal screens are plain white with a "Voltar" button top-left. Four-tab bottom bar on all patient screens.
- **Cards:** white, 20px radius, no border, soft teal-tinted shadow (`--shadow-card`). Quick-access tiles are flat tinted fills, no shadow.
- **Shadows:** soft and greenish — rgba of teal, never neutral grey/black heavy shadows.
- **Backgrounds:** white surfaces; only gradient is the teal header (and the ScheduleBanner reusing it). No textures, patterns or full-bleed photos. Imagery: 3D organ illustrations in specialty circles and a lungs image in the header (not yet exported).
- **Borders:** 2px on controls; cards borderless.
- **Hover/press:** press = scale .98 + slight darken; focus = 3px teal outline / teal border + teal-100 halo (visible for screen readers & keyboards). No hover-dependent information (touch first).
- **Animation:** minimal; 150–220ms, `cubic-bezier(.2,0,0,1)`, color/scale fades only. No bounces.
- **Transparency/blur:** none. Fields on the gradient get a solid white fill.
- **Labels** always visible above fields; placeholders are examples only.

## ICONOGRAPHY
- The source defines no icon set. **Substitution:** [Lucide](https://lucide.dev) outline icons (2px stroke, rounded caps), loaded from CDN (`lucide-static@0.460.0`) via the `Icon` component, tinted teal-600 by default.
- Icons always pair with a text label (bottom nav, back button, badges). Minimum size 20px; 24px default.
- No emoji, no unicode glyph icons.
- Specialty circles should use the 3D organ illustrations from Figma once exported (`SpecialtyItem image=…`); Lucide is the fallback.

## Logo
No logo was provided. The brand name "Saúde na Palma da Mão" is set in Roboto 700 wherever a mark would go.

## Index
- `styles.css` — entry; imports `tokens/fonts.css` (Roboto via Google Fonts), `colors.css`, `typography.css` (+ `.t-*` utility classes), `spacing.css` (space, radii, shadows, motion), `base.css`.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand).
- `components/` — React primitives (namespace `window.SaDeNaPalmaDaMODesignSystem_077ed4`).
- `ui_kits/patient-app/` — click-through patient app.
- `thumbnail.html`, `SKILL.md`.

## Components
From the source's 12-component inventory:
- `actions/` — **Button** (primary, outline, whatsapp, inverse), **BackButton**, **Icon**
- `forms/` — **TextField**, **SearchBar**, **CategoryChip**
- `layout/` — **HeroHeader**, **BottomNav**
- `cards/` — **SpecialtyItem**, **QuickAccessCard**, **DoctorCard**, **AppointmentCard**, **StatusBadge**, **ScheduleBanner**

### Intentional additions
- **Icon** — wrapper for the Lucide substitute set so every component tints icons consistently.
- **StatusBadge** split out of AppointmentCard ("AppointmentCard + selos de status") so badges can be reused in queues/lists.
- Button `inverse` variant — white button for use on the gradient (ScheduleBanner).

## Accessibility checklist (definition of done)
Text ≥ 14px (base 18) · contrast ≥ 4.5:1 · touch ≥ 48px · labels always visible · visible focus · works at 200% font · way back on every screen · errors explain what to do.
