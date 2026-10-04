# PainelTV

Tela única da smart TV da recepção: chamada atual em destaque, três chamadas anteriores, relógio e nome da unidade, lida a 5 metros sem ninguém interagir.

## Regras próprias
- Desenhado em 1920×1080. Fundo `painelFundo`, texto `painelTexto` (17,4:1), destaque `painelDestaque` (12,3:1).
- Nome do paciente em 104px (mínimo exigido 72px) e número do consultório em 200px (mínimo 96px). Nenhum texto abaixo de 40px.
- A chamada atual fica numa moldura amarela de 8px com o rótulo "Chamando agora". Ao chegar uma nova chamada, o conteúdo troca sem animação, sem piscar.
- Funciona sem áudio: tudo que um eventual aviso sonoro diria está escrito na tela. O rodapé orienta quem não viu o nome.
- Data por extenso e hora no formato "9h42".

## O que você fornece
`unidade`, `agora` (`nome`, `consultorio`, `especialidade`, `senha`, `andar`), `anteriores` (as três últimas, com `horario`) e `horario`.

## Privacidade
Mostre o nome social e só a inicial do sobrenome ("Maria das Graças S."), ou a senha quando a unidade preferir. Nunca CPF.

## No app de TV (Expo)
Renderize numa `View` de 1920×1080 escalada para a tela, sem foco navegável. Mantenha a tela acesa (`expo-keep-awake`).
