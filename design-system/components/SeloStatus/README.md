# SeloStatus

Selo do estado do atendimento em 9 variantes, sempre com cor, ícone e texto.

| status | Texto | Ícone | Cor | Estilo |
|---|---|---|---|---|
| agendado | Agendado | calendar-check | `primaria` | contorno |
| aguardandoRecepcao | Aguardando recepção | clock | `atencao` | contorno |
| aguardandoMedico | Aguardando médico | hourglass | `atencao` | contorno |
| chamando | Chamando você | megaphone | `primaria` | preenchido |
| emAtendimento | Em atendimento | stethoscope | `primariaEscura` | preenchido |
| concluido | Concluído | circle-check | `sucesso` | contorno |
| cancelado | Cancelado | circle-x | `textoSecundario` | contorno |
| naoCompareceu | Não compareceu | user-x | `erro` | contorno |
| encaminhadoEmergencia | Encaminhado para emergência | siren | `erro` | preenchido |

## Regras
- Os preenchidos são os que pedem ação ou atenção agora (chamando, em atendimento, emergência).
- `sucesso` e `erro` têm a mesma luminosidade: quem não distingue vermelho de verde depende do ícone e da palavra. Nunca remova os dois.
- O selo não é botão. Se tocar nele fizer algo, use um `Botao`.
