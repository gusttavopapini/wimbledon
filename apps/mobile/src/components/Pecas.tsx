import { useState, type ReactNode } from 'react';
import { Alert, Platform, Pressable, TextInput, View } from 'react-native';

import type { StatusChamado, Urgencia } from '@/api/atendimento';
import { useTema } from '@/hooks/useTema';
import type { NomeCor } from '@/theme/tema';
import { focoVeioDoTeclado } from '@/utils/focoPorTeclado';

import { estiloFoco } from './foco';
import { Icone, type NomeIcone } from './Icone';
import { Texto } from './Texto';

// ---------------------------------------------------------------------------
// Selo de status: sempre ícone + texto (cor nunca sozinha carrega o sentido).
// ---------------------------------------------------------------------------
const STATUS: Record<StatusChamado, { rotulo: string; icone: NomeIcone; cor: NomeCor }> = {
  agendado: { rotulo: 'Agendada', icone: 'calendar-check', cor: 'primaria' },
  aguardando_recepcao: { rotulo: 'Aguardando chegada', icone: 'clock', cor: 'primaria' },
  aguardando_medico: { rotulo: 'Na sala de espera', icone: 'users', cor: 'atencao' },
  chamando: { rotulo: 'Chamando', icone: 'megaphone', cor: 'atencao' },
  em_atendimento: { rotulo: 'Em atendimento', icone: 'stethoscope', cor: 'sucesso' },
  concluido: { rotulo: 'Realizada', icone: 'circle-check', cor: 'sucesso' },
  cancelado: { rotulo: 'Cancelada', icone: 'calendar-x', cor: 'textoSecundario' },
  nao_compareceu: { rotulo: 'Não compareceu', icone: 'x', cor: 'erro' },
  encaminhado_emergencia: { rotulo: 'Encaminhado à emergência', icone: 'siren', cor: 'erro' },
};

export function rotuloStatus(status: StatusChamado): string {
  return STATUS[status].rotulo;
}

export function Selo({ status }: { status: StatusChamado }) {
  const def = STATUS[status];
  return <Etiqueta icone={def.icone} cor={def.cor} texto={def.rotulo} />;
}

const URGENCIA: Record<Urgencia, { rotulo: string; icone: NomeIcone; cor: NomeCor }> = {
  rotina: { rotulo: 'Rotina', icone: 'clock', cor: 'textoSecundario' },
  prioritario: { rotulo: 'Prioritário', icone: 'triangle-alert', cor: 'atencao' },
  emergencia: { rotulo: 'Emergência', icone: 'siren', cor: 'erro' },
};

export function SeloUrgencia({ urgencia }: { urgencia: Urgencia }) {
  const def = URGENCIA[urgencia];
  return <Etiqueta icone={def.icone} cor={def.cor} texto={def.rotulo} />;
}

export function Etiqueta({ icone, cor, texto }: { icone: NomeIcone; cor: NomeCor; texto: string }) {
  const { cores, espacamento, raio, tamanho } = useTema();
  return (
    <View
      accessible
      accessibilityLabel={texto}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: espacamento.espacamento4,
        paddingVertical: espacamento.espacamento4,
        paddingHorizontal: espacamento.espacamento12,
        borderRadius: raio.raioChip,
        borderWidth: tamanho.espessuraBorda,
        borderColor: cores[cor],
        backgroundColor: cores.superficie,
      }}
    >
      <Icone nome={icone} cor={cor} tamanho={18} />
      <Texto estilo="rotulo" cor={cor}>
        {texto}
      </Texto>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Item de lista tocável.
// ---------------------------------------------------------------------------
export function ItemLista({
  titulo,
  subtitulo,
  detalhe,
  icone,
  aoTocar,
  depois,
  rotuloAcessivel,
}: {
  titulo: string;
  subtitulo?: string | null;
  detalhe?: string | null;
  icone?: NomeIcone;
  aoTocar?: () => void;
  depois?: ReactNode;
  rotuloAcessivel?: string;
}) {
  const { cores, espacamento, raio, tamanho } = useTema();
  const [focado, setFocado] = useState(false);
  const conteudo = (
    <>
      {icone ? (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: cores.teal50,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icone nome={icone} cor="primariaEscura" />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0, gap: espacamento.espacamento4 }}>
        <Texto estilo="corpoForte">{titulo}</Texto>
        {subtitulo ? (
          <Texto estilo="rotulo" cor="primaria">
            {subtitulo}
          </Texto>
        ) : null}
        {detalhe ? (
          <Texto estilo="apoio" cor="textoSecundario">
            {detalhe}
          </Texto>
        ) : null}
        {depois}
      </View>
      {aoTocar ? <Icone nome="chevron-right" cor="primaria" /> : null}
    </>
  );
  const estilo = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: espacamento.espacamento12,
    minHeight: tamanho.alvoToqueMinimo,
    padding: espacamento.espacamento16,
    borderWidth: tamanho.espessuraBorda,
    borderColor: cores.contorno,
    borderRadius: raio.raioCartaoInterno,
  };
  if (!aoTocar)
    return <View style={[estilo, { backgroundColor: cores.superficie }]}>{conteudo}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        rotuloAcessivel ?? [titulo, subtitulo, detalhe].filter(Boolean).join(', ')
      }
      onPress={aoTocar}
      onFocus={() => setFocado(focoVeioDoTeclado())}
      onBlur={() => setFocado(false)}
      style={({ pressed }) => [
        estilo,
        { backgroundColor: pressed ? cores.teal50 : cores.superficie },
        focado && estiloFoco(cores, tamanho.espessuraFoco),
      ]}
    >
      {conteudo}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Opções (uma escolha): chips grandes, com estado anunciado.
// ---------------------------------------------------------------------------
export function Opcoes<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoMudar,
  colunas,
}: {
  rotulo?: string;
  opcoes: { valor: T; rotulo: string; detalhe?: string }[];
  valor: T | null;
  aoMudar: (valor: T) => void;
  colunas?: number;
}) {
  const { cores, espacamento, raio, tamanho } = useTema();
  return (
    <View style={{ gap: espacamento.espacamento8 }}>
      {rotulo ? (
        <Texto estilo="rotulo" cor="primariaEscura">
          {rotulo}
        </Texto>
      ) : null}
      <View
        accessibilityRole="radiogroup"
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.espacamento8 }}
      >
        {opcoes.map((o) => {
          const marcado = o.valor === valor;
          return (
            <Pressable
              key={o.valor}
              accessibilityRole="radio"
              aria-checked={marcado}
              accessibilityLabel={o.detalhe ? `${o.rotulo}, ${o.detalhe}` : o.rotulo}
              onPress={() => aoMudar(o.valor)}
              style={({ pressed }) => ({
                minHeight: tamanho.alvoToqueMinimo,
                minWidth: colunas ? `${Math.floor(100 / colunas) - 3}%` : undefined,
                flexGrow: colunas ? 1 : 0,
                paddingVertical: espacamento.espacamento8,
                paddingHorizontal: espacamento.espacamento16,
                borderRadius: raio.raioChip,
                borderWidth: tamanho.espessuraBorda,
                borderColor: marcado ? cores.primaria : cores.contorno,
                backgroundColor: marcado
                  ? cores.primaria
                  : pressed
                    ? cores.teal50
                    : cores.superficie,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Texto
                estilo="corpoForte"
                cor={marcado ? 'textoSobrePrimaria' : 'primaria'}
                style={{ textAlign: 'center' }}
              >
                {o.rotulo}
              </Texto>
              {o.detalhe ? (
                <Texto estilo="apoio" cor={marcado ? 'textoSobrePrimaria' : 'textoSecundario'}>
                  {o.detalhe}
                </Texto>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Texto longo (relato, orientação, receita).
// ---------------------------------------------------------------------------
export function AreaTexto({
  rotulo,
  ajuda,
  valor,
  aoMudar,
  linhas = 4,
}: {
  rotulo: string;
  ajuda?: string;
  valor: string;
  aoMudar: (v: string) => void;
  linhas?: number;
}) {
  const { cores, espacamento, raio, tamanho, tipo } = useTema();
  const [focado, setFocado] = useState(false);
  return (
    <View style={{ gap: espacamento.espacamento8 }}>
      <Texto estilo="rotulo" cor="primariaEscura">
        {rotulo}
      </Texto>
      {ajuda ? (
        <Texto estilo="apoio" cor="textoSecundario">
          {ajuda}
        </Texto>
      ) : null}
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        multiline
        numberOfLines={linhas}
        accessibilityLabel={rotulo}
        accessibilityHint={ajuda}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        textAlignVertical="top"
        cursorColor={cores.primaria}
        style={{
          minHeight: linhas * tipo.corpo.lineHeight + espacamento.espacamento24,
          padding: espacamento.espacamento16,
          borderWidth: tamanho.espessuraBorda,
          borderRadius: raio.raioCampo > 24 ? 16 : raio.raioCampo,
          borderColor: focado ? cores.primaria : cores.bordaCampo,
          backgroundColor: cores.superficie,
          color: cores.texto,
          fontFamily: tipo.corpo.fontFamily,
          fontSize: tipo.corpo.fontSize,
        }}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Seção com título e linha "rótulo: valor".
// ---------------------------------------------------------------------------
export function Secao({
  titulo,
  children,
  acao,
}: {
  titulo: string;
  children: ReactNode;
  acao?: ReactNode;
}) {
  const { espacamento } = useTema();
  return (
    <View style={{ gap: espacamento.espacamento12 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Texto
          estilo="tituloSecao"
          cor="primariaEscura"
          accessibilityRole="header"
          style={{ flex: 1 }}
        >
          {titulo}
        </Texto>
        {acao}
      </View>
      {children}
    </View>
  );
}

export function Linha({
  icone,
  rotulo,
  valor,
}: {
  icone: NomeIcone;
  rotulo: string;
  valor: string;
}) {
  const { espacamento } = useTema();
  return (
    <View
      accessible
      accessibilityLabel={`${rotulo}: ${valor}`}
      style={{ flexDirection: 'row', gap: espacamento.espacamento12 }}
    >
      <Icone nome={icone} cor="primaria" />
      <View style={{ flex: 1, gap: 2 }}>
        <Texto estilo="apoio" cor="textoSecundario">
          {rotulo}
        </Texto>
        <Texto estilo="corpoForte">{valor}</Texto>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Confirmação antes de ação irreversível (funciona no celular e no navegador).
// ---------------------------------------------------------------------------
export function confirmar(
  titulo: string,
  mensagem: string,
  rotuloSim = 'Confirmar',
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.confirm?.(`${titulo}\n\n${mensagem}`) ?? true);
  }
  return new Promise((resolver) => {
    Alert.alert(titulo, mensagem, [
      { text: 'Voltar', style: 'cancel', onPress: () => resolver(false) },
      { text: rotuloSim, style: 'destructive', onPress: () => resolver(true) },
    ]);
  });
}

/** Aviso simples (ex.: senha provisória). */
export function avisar(titulo: string, mensagem: string) {
  if (Platform.OS === 'web') globalThis.alert?.(`${titulo}\n\n${mensagem}`);
  else Alert.alert(titulo, mensagem);
}

// ---------------------------------------------------------------------------
// Atalho da Home: ícone grande + rótulo, em grade de 2 colunas.
// ---------------------------------------------------------------------------
export function Atalho({
  icone,
  rotulo,
  aoTocar,
}: {
  icone: NomeIcone;
  rotulo: string;
  aoTocar: () => void;
}) {
  const { cores, espacamento, raio, tamanho } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      onPress={aoTocar}
      style={({ pressed }) => ({
        flexBasis: '47%',
        flexGrow: 1,
        minHeight: 112,
        padding: espacamento.espacamento16,
        gap: espacamento.espacamento8,
        borderRadius: raio.raioCartaoInterno,
        borderWidth: tamanho.espessuraBorda,
        borderColor: pressed ? cores.primaria : cores.teal50,
        backgroundColor: cores.teal50,
        justifyContent: 'center',
      })}
    >
      <Icone nome={icone} cor="primariaEscura" tamanho={32} />
      <Texto estilo="corpoForte" cor="primariaEscura">
        {rotulo}
      </Texto>
    </Pressable>
  );
}

export function GradeAtalhos({ children }: { children: ReactNode }) {
  const { espacamento } = useTema();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.espacamento12 }}>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Várias escolhas (especialidades de um médico, unidades…).
// ---------------------------------------------------------------------------
export function MultiOpcoes({
  rotulo,
  opcoes,
  valores,
  aoMudar,
}: {
  rotulo: string;
  opcoes: { valor: string; rotulo: string }[];
  valores: string[];
  aoMudar: (valores: string[]) => void;
}) {
  const { cores, espacamento, raio, tamanho } = useTema();
  return (
    <View style={{ gap: espacamento.espacamento8 }}>
      <Texto estilo="rotulo" cor="primariaEscura">
        {rotulo}
      </Texto>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.espacamento8 }}>
        {opcoes.map((o) => {
          const marcado = valores.includes(o.valor);
          return (
            <Pressable
              key={o.valor}
              accessibilityRole="checkbox"
              aria-checked={marcado}
              accessibilityLabel={o.rotulo}
              onPress={() =>
                aoMudar(marcado ? valores.filter((v) => v !== o.valor) : [...valores, o.valor])
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: espacamento.espacamento4,
                minHeight: tamanho.alvoToqueMinimo,
                paddingHorizontal: espacamento.espacamento16,
                borderRadius: raio.raioChip,
                borderWidth: tamanho.espessuraBorda,
                borderColor: marcado ? cores.primaria : cores.contorno,
                backgroundColor: marcado ? cores.teal50 : cores.superficie,
              }}
            >
              {marcado ? <Icone nome="check" cor="primariaEscura" tamanho={18} /> : null}
              <Texto estilo="rotulo" cor="primariaEscura">
                {o.rotulo}
              </Texto>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
