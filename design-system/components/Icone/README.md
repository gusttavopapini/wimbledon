# Icone

Ícones de interface em traço de 2px, da biblioteca Lucide (licença ISC), sempre ao lado de um texto.

## O que você fornece
`nome` (um dos nomes da prévia), `tamanho` (24px padrão; 28px na navegação), `rotulo` só quando o ícone estiver sozinho — o que este sistema evita.

## Regras
- Ícone nunca carrega significado sozinho: sempre há uma palavra ao lado.
- Cor herdada do texto (`currentColor`).
- No React Native, use `lucide-react-native` com os mesmos nomes em PascalCase (`CalendarCheck`, `Siren`) e `strokeWidth={2}`.
