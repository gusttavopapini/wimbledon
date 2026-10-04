Saúde na Palma da Mão é um app de pré-triagem com inteligência artificial, agendamento e gestão de fila presencial para hospitais e clínicas do polo médico do Recife. Ele roda em React Native com Expo (Android, PWA e TV). Este sistema define como cada tela fala, se parece e se comporta.

## Para quem desenhamos

A pessoa que usa o app é, na maioria das vezes, idosa, muitas vezes com baixa visão e pouca familiaridade com aplicativos. Ela pode estar numa sala de espera barulhenta, em casa com dor, ou com pressa. Toda decisão de contraste, tamanho e densidade favorece essa pessoa. Quando houver dúvida entre bonito e legível, escolha legível.

Meta: WCAG 2.2 nível AA em tudo, com 7:1 de contraste sempre que possível.

## Princípios

1. **Uma decisão por tela.** Cada tela pede uma coisa só. Se há duas perguntas, são duas telas.
2. **O botão principal fica sempre no mesmo lugar.** Embaixo, depois do conteúdo, largura total, 64px de altura (`Botao` com `principal`). A pessoa aprende onde tocar uma vez.
3. **Texto antes de tudo.** Toda informação existe em palavras. Cor e ícone reforçam, nunca carregam sozinhos.
4. **Nada some sozinho.** Sem tempo limite, sem mensagem que desaparece, sem carrossel, sem piscar.
5. **Gestos simples.** Só toque. Sem deslizar para apagar, sem pinça, sem toque longo, sem rolagem horizontal.
6. **Tudo cresce.** Alturas são mínimas. Com letra grande ou fonte do sistema a 200%, o layout se reorganiza (quebra linha, vira lista), nunca corta texto.

## Conteúdo e linguagem

Fale como uma recepcionista atenciosa: frases curtas, voz ativa, "você". Sem jargão médico quando houver palavra comum; sem jargão técnico nunca. Sem emoji, sem exclamação fora da saudação, sem letras maiúsculas para gritar.

- **Rótulos de botão são verbos que dizem o que acontece:** "Marcar consulta", "Confirmar chegada", "Ver outros horários", "Ligar para o 192". Nunca "Submeter", "Prosseguir", "Enviar", "OK".
- **Datas sempre por extenso:** "terça-feira, 13 de outubro, às 9h30". Use `formatarDataPorExtenso`. Hora no formato "9h30", "14h", "meio-dia".
- **Erro diz o que fazer:** "Falta 1 número. Confira no seu documento e digite os 11 números." e não "CPF inválido".
- **Carregando diz o quê:** "Carregando suas consultas", não "Carregando…".
- **Diálogo pergunta e explica:** "Cancelar a consulta?" + o que acontece depois + "Sim, cancelar a consulta" / "Não, manter a consulta".
- **Números:** "3º da fila", "cerca de 20 minutos". Previsões sempre aproximadas.
- **Privacidade:** em filas e no painel de TV, primeiro nome e inicial do sobrenome ("Ana S.").

A seção Linguagem traz o glossário completo de rótulos.

## Cores

A identidade é o azul-petróleo sobre branco, com o topo em gradiente. Use só os tokens; nunca escreva um hexadecimal num componente.

- `primaria` é a marca: texto de destaque, links, ícones, contornos (`contorno`) e o preenchimento do botão primário com `textoSobrePrimaria`.
- `primariaEscura` vai em títulos, rótulos de campo, item ativo da navegação e estado pressionado.
- `primariaClara` só em superfícies grandes: o canto do `Topo` e ilustrações. Nunca atrás de texto menor que 24px.
- `teal50` é fundo alternativo (círculos de especialidade, aviso da IA, item ativo), divisória e fundo do desabilitado. Nunca é borda nem separa dois elementos sozinho.
- `texto` sobre `superficie` em todo texto corrido. `textoSecundario` só para apoio (dica, rótulo inativo): passa AA (5,8:1) mas fica abaixo da meta, então nunca carrega informação essencial.
- `sucesso`, `erro` e `atencao` sempre com ícone **e** texto. Sobre eles, `textoSobreStatus`. `sucesso` e `erro` têm a mesma luminosidade: só a palavra e o ícone os separam para quem não distingue verde de vermelho.
- Vermelho cheio (`erro` como fundo) é reservado para o `BannerEmergencia`, o botão destrutivo e o selo de emergência.
- `bordaCampo` é a borda do campo em repouso, `primaria` a 40%. **Ela mede 1,98:1 e não passa no WCAG 1.4.11** — ver a seção Contraste para a correção recomendada.

## Tipografia

Uma família só: **Heebo** (fonte em `fonts/`, eixo de peso variável). Dois pesos: Regular 400 e Bold 700.

| Estilo | Tamanho / linha | Uso |
|---|---|---|
| `display` | 40/48 Bold | Saudação do `Topo` |
| `tituloTela` | 32/40 Bold | Título da tela (`h1`) |
| `tituloSecao` | 24/32 Bold | Seções, cartões, diálogos |
| `subtitulo` | 20/28 Regular | Linha sob o título |
| `corpo` | 18/28 Regular | Todo texto corrido |
| `corpoForte` | 18/28 Bold | Botões, nomes, ênfase |
| `rotulo` | 16/24 Bold | Rótulo de campo, selo, chip |
| `apoio` | 16/24 Regular | Dica, unidade, horário secundário |

- **Nenhum texto abaixo de 16px, em nenhuma circunstância.** 16px é sempre `rotulo` (negrito) ou `apoio`.
- Alinhe à esquerda. Centralize só estados de tela vazios e nomes sob ícones.
- Linhas de no máximo ~60 caracteres; parágrafos de no máximo 3 frases.
- **Letra grande:** `corpo` vai a 22px e toda a escala sobe pelo mesmo fator (×1,22) — grupo "Letra grande" nos tokens.
- Em CSS os tamanhos vão em `rem`; no React Native, `allowFontScaling` sempre ligado e sem `maxFontSizeMultiplier`. O layout precisa continuar íntegro com a fonte do sistema a 200%.

## Espaçamento, forma e alvos

- Escala de 4 em 4: `espacamento4`, `8`, `12`, `16`, `24`, `32`, `48`. Nada fora dela.
- Margem lateral `margemLateral` (24px) na tela de referência de 390px. Tudo funciona a partir de 320px.
- Raios: `raioCartao` 32px (cartão de conteúdo, folha, diálogo, banner, navegação), `raioBotao` e `raioCampo` 28px (pílulas), `raioCartaoInterno` 16px, `raioChip` totalmente arredondado.
- Botão: mínimo `alturaBotao` (56px); ação principal `alturaBotaoPrincipal` (64px), largura total.
- Alvo de toque: mínimo `alvoToqueMinimo` (48×48) e `respiroEntreAlvos` (8px) entre alvos vizinhos.
- Sombra só no modo claro (`sombraCartao`, `sombraNavegacao`, `sombraDialogo`); no alto contraste elas viram contornos brancos de 2px.

## Foco, estados e movimento

- Todo elemento interativo mostra o mesmo anel de foco, `sombraFoco`: 3px de `superficie` e mais 3px de `anelFoco`. Funciona sobre branco e sobre o gradiente.
- Pressionado: o primário escurece para `primariaEscura`; secundário e terciário ganham fundo `teal50`.
- Desabilitado: fundo `teal50`, borda tracejada e texto `textoSecundario`, ainda legível. Prefira não desabilitar: deixe o botão ativo e explique o que falta.
- Movimento: só o indicador de carregamento gira, e para quando o sistema pede menos movimento. Nada pisca, nada desliza, nada entra animado.

## Iconografia e imagens

- Ícones de interface: **Lucide** (licença ISC), traço de 2px, 24px ao lado do texto e 28px na navegação. No app use `lucide-react-native`.
- Ícones de especialidade: 13 vetores de traço simples (8 do Lucide e 5 desenhados no mesmo traço), em 48px dentro de um círculo `teal50` de 88px. Os SVG ficam no grupo de assets Especialidades.
- Ícone nunca aparece sozinho como única pista: sempre há uma palavra ao lado.
- As ilustrações de órgãos em 3D da prototipação ficam de fora: pesam demais no pacote. Use os ícones vetoriais.
- Não há logotipo neste sistema. O nome é escrito em Heebo Bold até que um logotipo seja fornecido.
- Avatares: foto redonda ou iniciais em `primaria`.

## Modos

| Modo | Como ligar | O que muda |
|---|---|---|
| Claro | `data-theme="claro"` (padrão) | A identidade completa |
| Alto contraste | `data-theme="altocontraste"` | Branco puro sobre preto puro, `primaria` vira amarelo #FFD54F, sem gradiente, sombras viram contornos, texto ≥13:1 |
| Letra grande | classe `letra-grande` em qualquer ancestral (ou `data-theme="letragrande"` = claro + letra grande) | Escala tipográfica ×1,22, ícones de 28px, grade de especialidades vira lista |

Letra grande combina com qualquer modo de cor. No app, os dois são ajustes separados em "Ajustes" e também seguem as preferências do sistema (contraste aumentado, tamanho da fonte).

## Painel de TV

Uma tela de 1920×1080 na recepção, lida a 5 metros, sem interação. Usa `painelFundo`, `painelTexto` e `painelDestaque` (iguais em todos os modos), nome do paciente com no mínimo 72px e consultório com no mínimo 96px, nada abaixo de 40px, sem piscar e funcionando totalmente sem áudio. Detalhes em `PainelTV`.

## Fora do escopo

Não desenhe nem construa: avaliação de profissionais por estrelas, seção de exames, login social (Facebook, Google, "entrar com WhatsApp"). A autenticação é só e-mail e senha.

## Usando o sistema

Os tokens estão em `tokens.json` (gerados como variáveis CSS em `tokens.css`). Os componentes de referência ficam em `components/bundle.js` como `window.SaudeNaPalma`, com estilos em `components/bundle.css`, e esperam React 18. Eles servem ao PWA e como especificação viva para o React Native: a seção React Native mostra como levar tokens e componentes para o Expo.
