import type * as React from 'react';

/** Nomes dos ícones de interface (Lucide) disponíveis em `Icone`. */
export type NomeIcone =
  | 'arrow-left' | 'chevron-right' | 'calendar' | 'calendar-check' | 'calendar-x' | 'calendar-plus' | 'clock' | 'hourglass'
  | 'megaphone' | 'stethoscope' | 'check' | 'circle-check' | 'circle-x' | 'user-x' | 'siren' | 'triangle-alert' | 'circle-alert'
  | 'phone' | 'house' | 'user-round' | 'settings' | 'search' | 'eye' | 'eye-off' | 'lock' | 'mail' | 'info' | 'loader-circle'
  | 'refresh-cw' | 'x' | 'map-pin' | 'bell' | 'chevrons-up' | 'circle-dot' | 'wifi-off' | 'message-circle' | 'door-open'
  | 'list-ordered' | 'tv' | 'hospital' | 'log-in' | 'clipboard-list';

export type Especialidade =
  | 'cardiologia' | 'clinicoGeral' | 'gastroenterologia' | 'neurologia' | 'ortopedia' | 'ginecologia' | 'dermatologia'
  | 'imunologia' | 'obstetricia' | 'pediatria' | 'oftalmologia' | 'otorrinolaringologia' | 'pneumologia';

export type StatusAtendimento =
  | 'agendado' | 'aguardandoRecepcao' | 'aguardandoMedico' | 'chamando' | 'emAtendimento'
  | 'concluido' | 'cancelado' | 'naoCompareceu' | 'encaminhadoEmergencia';

export type NivelUrgencia = 'rotina' | 'prioritario' | 'emergencia';

/** Só para documentação: força a aparência de um estado que normalmente vem da interação. */
export type EstadoDemonstrado = 'pressionado' | 'foco';

export interface BotaoProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Padrão: 'primario'. Uma ação primária por tela. */
  variante?: 'primario' | 'secundario' | 'terciario' | 'destrutivo';
  /** Ação principal da tela: 64px de altura e largura total. */
  principal?: boolean;
  /** Largura total sem subir para 64px (ex.: secundário abaixo do principal). */
  larguraTotal?: boolean;
  desabilitado?: boolean;
  /** Mostra o indicador e troca o texto por `rotuloCarregando`; ignora novos toques. */
  carregando?: boolean;
  /** Texto no gerúndio durante o carregamento. Padrão: "Aguarde…". */
  rotuloCarregando?: string;
  /** Ícone antes do texto. Nunca use só o ícone. */
  icone?: NomeIcone;
  /** Ícone depois do texto (ex.: 'chevron-right'). */
  iconeFim?: NomeIcone;
  /** Vira um link com aparência de botão (ex.: 'tel:192'). */
  href?: string;
  aoTocar?: (e: React.MouseEvent) => void;
  demonstrarEstado?: EstadoDemonstrado;
  /** O rótulo: um verbo que diz o que acontece. */
  children: React.ReactNode;
}
export declare function Botao(props: BotaoProps): React.ReactElement;

export interface CampoProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  /** Padrão: 'texto'. 'cpf' e 'data' aplicam máscara e teclado numérico. */
  tipo?: 'texto' | 'senha' | 'data' | 'cpf' | 'busca';
  /** Rótulo sempre visível acima do campo. Obrigatório. */
  rotulo: string;
  /** Dica entre o rótulo e o campo: formato, exemplo, por que pedimos. */
  ajuda?: string;
  /** Mensagem de erro que diz o que fazer. Aparece acima do campo, com ícone. */
  erro?: string;
  /** Uso controlado. Para uso livre, `valorInicial`. */
  valor?: string;
  valorInicial?: string;
  /** Recebe o valor já mascarado (CPF "000.000.000-00", data "dd/mm/aaaa"). */
  aoMudar?: (valor: string) => void;
  desabilitado?: boolean;
  /** Passe `false` para escrever "(opcional)" ao lado do rótulo. */
  obrigatorio?: boolean;
  /** type do input quando tipo='texto' (ex.: 'email'). */
  tipoHtml?: string;
  demonstrarEstado?: 'foco';
}
export declare function Campo(props: CampoProps): React.ReactElement;

export interface ChipProps {
  /** Padrão: 'filtro' (liga e desliga, aria-pressed). */
  tipo?: 'filtro' | 'especialidade';
  selecionado?: boolean;
  /** Filtro: recebe o novo estado. Especialidade: torna o chip tocável. */
  aoTocar?: (selecionado?: boolean) => void;
  especialidade?: Especialidade;
  demonstrarEstado?: 'foco';
  children: React.ReactNode;
}
export declare function Chip(props: ChipProps): React.ReactElement;
export interface GrupoChipsProps { rotulo: string; children: React.ReactNode }
export declare function GrupoChips(props: GrupoChipsProps): React.ReactElement;

export interface CartaoProps {
  /** 'conteudo' (32px, sombra), 'interno' (16px, contorno) ou 'alternativo' (16px, fundo teal50). */
  variante?: 'conteudo' | 'interno' | 'alternativo';
  titulo?: string;
  idTitulo?: string;
  children?: React.ReactNode;
}
export declare function Cartao(props: CartaoProps): React.ReactElement;

export interface CartaoEspecialidadeProps {
  especialidade: Especialidade;
  /** Padrão: nome da lista ESPECIALIDADES. */
  nome?: string;
  /** 'grade' (círculo acima do nome) ou 'lista' (linha). No modo letra grande vira lista sozinho. */
  layout?: 'grade' | 'lista';
  aoTocar?: () => void;
  demonstrarEstado?: 'foco';
}
export declare function CartaoEspecialidade(props: CartaoEspecialidadeProps): React.ReactElement;
export interface GradeEspecialidadesProps { layout?: 'grade' | 'lista'; children: React.ReactNode }
export declare function GradeEspecialidades(props: GradeEspecialidadesProps): React.ReactElement;

export interface CartaoProfissionalProps {
  nome: string;
  especialidade: string;
  unidade: string;
  foto?: string;
  /** Uma linha extra, ex.: "Próximo horário: amanhã, às 8h". */
  detalhe?: string;
  aoTocar?: () => void;
  demonstrarEstado?: 'foco';
}
export declare function CartaoProfissional(props: CartaoProfissionalProps): React.ReactElement;

export interface AvatarProps {
  nome: string;
  foto?: string;
  /** Padrão: 64. */
  tamanho?: number;
  /** Texto alternativo quando o avatar não está ao lado do nome escrito. */
  descricao?: string;
}
export declare function Avatar(props: AvatarProps): React.ReactElement;

export interface TopoProps {
  titulo?: string;
  subtitulo?: string;
  /** Conteúdo acima do título (ex.: Avatar). */
  antes?: React.ReactNode;
  /** Conteúdo abaixo do subtítulo (ex.: botão "Contar meus sintomas"). */
  children?: React.ReactNode;
}
export declare function Topo(props: TopoProps): React.ReactElement;
export declare function Folha(props: { children: React.ReactNode; className?: string }): React.ReactElement;

export interface CabecalhoTelaProps {
  titulo: string;
  subtitulo?: string;
  /** Passe `null` para esconder o Voltar (só na tela inicial). */
  aoVoltar?: (() => void) | null;
  /** Padrão: "Voltar". Pode dizer para onde: "Voltar ao início". */
  rotuloVoltar?: string;
  demonstrarEstado?: 'foco';
}
export declare function CabecalhoTela(props: CabecalhoTelaProps): React.ReactElement;

export interface DestinoNavegacao { id: string; rotulo: string; icone: NomeIcone }
export interface NavegacaoInferiorProps {
  /** Padrão: Início, Consultas, Meu perfil, Ajustes. Sempre 4. */
  itens?: DestinoNavegacao[];
  ativo: string;
  aoNavegar?: (id: string) => void;
}
export declare function NavegacaoInferior(props: NavegacaoInferiorProps): React.ReactElement;

export declare function SeloStatus(props: { status: StatusAtendimento }): React.ReactElement;
export declare function SeloUrgencia(props: { nivel: NivelUrgencia }): React.ReactElement;

export interface ItemFila { posicao: number; nome: string; status?: StatusAtendimento; voce?: boolean }
export interface ListaFilaProps {
  titulo?: string;
  itens: ItemFila[];
  /** Frase depois do resumo, ex.: "Previsão: cerca de 20 minutos." */
  previsao?: string;
}
export declare function ListaFila(props: ListaFilaProps): React.ReactElement;

export interface BannerEmergenciaProps {
  titulo?: string;
  mensagem?: string;
  /** Padrão: '192'. */
  telefone?: string;
  /** Linha final; `null` para omitir. */
  complemento?: string | null;
  aoLigar?: () => void;
}
export declare function BannerEmergencia(props: BannerEmergenciaProps): React.ReactElement;

export declare function AvisoIA(props: { variante?: 'completo' | 'compacto' }): React.ReactElement;

export interface MensagemProps {
  tipo: 'sucesso' | 'erro' | 'atencao' | 'informacao';
  /** O que aconteceu, em poucas palavras. */
  titulo: string;
  /** O que fazer agora. */
  children?: React.ReactNode;
  acao?: React.ReactNode;
}
export declare function Mensagem(props: MensagemProps): React.ReactElement;

export interface EstadoTelaProps {
  tipo: 'carregando' | 'vazio' | 'erro';
  titulo?: string;
  mensagem?: string;
  icone?: NomeIcone;
  /** Vazio e erro mostram um botão principal com este texto. */
  rotuloAcao?: string;
  aoAgir?: () => void;
}
export declare function EstadoTela(props: EstadoTelaProps): React.ReactElement;

export interface DialogoConfirmacaoProps {
  aberto: boolean;
  /** A pergunta: "Cancelar a consulta?" */
  titulo: string;
  /** O que vai acontecer, com data por extenso. */
  mensagem: React.ReactNode;
  /** Ação inteira: "Sim, cancelar a consulta". */
  rotuloConfirmar: string;
  /** Ação inteira: "Não, manter a consulta". Recebe o foco ao abrir. */
  rotuloVoltar?: string;
  aoConfirmar: () => void;
  aoVoltar: () => void;
  /** Padrão: true (botão vermelho). */
  destrutivo?: boolean;
  carregando?: boolean;
  rotuloCarregando?: string;
  /** Renderiza sem véu fixo (documentação). */
  emLinha?: boolean;
}
export declare function DialogoConfirmacao(props: DialogoConfirmacaoProps): React.ReactElement | null;

export interface ChamadaPainel { nome: string; consultorio: string; especialidade?: string; senha?: string; andar?: string; horario?: Date }
export interface PainelTVProps {
  unidade: string;
  agora: ChamadaPainel;
  /** As três últimas; o resto é ignorado. */
  anteriores: ChamadaPainel[];
  horario?: Date;
  rodape?: string;
}
export declare function PainelTV(props: PainelTVProps): React.ReactElement;

export interface IconeProps { nome: NomeIcone | Especialidade; tamanho?: number; espessura?: number; rotulo?: string; className?: string }
export declare function Icone(props: IconeProps): React.ReactElement;
export declare function IconeEspecialidade(props: { especialidade: Especialidade; tamanho?: number; rotulo?: string }): React.ReactElement;

export declare function formatarDataPorExtenso(d: Date, opcoes?: { ano?: boolean; hora?: boolean; maiuscula?: boolean }): string;
export declare function formatarHora(d: Date): string;
export declare function mascararCPF(v: string): string;
export declare function mascararData(v: string): string;
export declare function lerData(texto: string): Date | null;
export declare function cpfValido(v: string): boolean;
export declare function razaoContraste(frente: string, fundo: string): number;
export declare const ESPECIALIDADES: { id: Especialidade; nome: string }[];

declare global {
  interface Window {
    SaudeNaPalma: {
      Botao: typeof Botao; Campo: typeof Campo; Chip: typeof Chip; GrupoChips: typeof GrupoChips; Cartao: typeof Cartao;
      CartaoEspecialidade: typeof CartaoEspecialidade; GradeEspecialidades: typeof GradeEspecialidades;
      CartaoProfissional: typeof CartaoProfissional; Avatar: typeof Avatar; Topo: typeof Topo; Folha: typeof Folha;
      CabecalhoTela: typeof CabecalhoTela; NavegacaoInferior: typeof NavegacaoInferior; SeloStatus: typeof SeloStatus;
      SeloUrgencia: typeof SeloUrgencia; ListaFila: typeof ListaFila; BannerEmergencia: typeof BannerEmergencia;
      AvisoIA: typeof AvisoIA; Mensagem: typeof Mensagem; EstadoTela: typeof EstadoTela; DialogoConfirmacao: typeof DialogoConfirmacao;
      PainelTV: typeof PainelTV; Icone: typeof Icone; IconeEspecialidade: typeof IconeEspecialidade;
      formatarDataPorExtenso: typeof formatarDataPorExtenso; formatarHora: typeof formatarHora; mascararCPF: typeof mascararCPF;
      mascararData: typeof mascararData; lerData: typeof lerData; cpfValido: typeof cpfValido; razaoContraste: typeof razaoContraste;
      ESPECIALIDADES: typeof ESPECIALIDADES;
    };
  }
}
