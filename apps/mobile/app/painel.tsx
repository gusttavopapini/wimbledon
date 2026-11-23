import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useKeepAwake } from 'expo-keep-awake';
import * as Speech from 'expo-speech';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, View, useWindowDimensions, type TextStyle } from 'react-native';

import {
  consultarPareamento,
  estadoDoPainel,
  iniciarPareamento,
  tokenRecusado,
  type EstadoPainel,
} from '@/api/painel';
import { useTema } from '@/hooks/useTema';
import { tipoPainel } from '@/theme/tokens';

const CHAVE_TOKEN = 'painel.tokenDispositivo';
const INTERVALO_MS = 3000;

type NomeEstiloPainel = keyof typeof tipoPainel;

/**
 * Painel de TV da recepção (RN25/RN26). Sem login de pessoa: a TV é pareada
 * por um código de 6 números que a manutenção digita no app, e daí em diante
 * usa só o token de dispositivo. Legível a 5 m, sem piscar; o som é um aviso
 * de ~1 s seguido da voz, e a tela funciona mesmo se o áudio falhar.
 */
export default function TelaPainel() {
  useKeepAwake();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_TOKEN)
      .then(setToken)
      .catch(() => setToken(null));
  }, []);

  const salvar = useCallback(async (novo: string | null) => {
    if (novo) await AsyncStorage.setItem(CHAVE_TOKEN, novo);
    else await AsyncStorage.removeItem(CHAVE_TOKEN);
    setToken(novo);
  }, []);

  return (
    <Fundo>
      <StatusBar hidden />
      {token === undefined ? null : token ? (
        <Chamadas token={token} aoPerderAcesso={() => void salvar(null)} />
      ) : (
        <Pareamento aoParear={(t) => void salvar(t)} />
      )}
    </Fundo>
  );
}

function useEscala() {
  const { width, height } = useWindowDimensions();
  // Tokens pensados para 1920 x 1080. Numa TV 1080p o Android informa ~960 dp de largura.
  return Math.max(0.35, Math.min(width / 1920, height / 1080));
}

function T({
  estilo,
  cor = 'painelTexto',
  children,
  style,
  numberOfLines,
}: {
  estilo: NomeEstiloPainel;
  cor?: 'painelTexto' | 'painelDestaque';
  children: React.ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
}) {
  const { cores } = useTema();
  const escala = useEscala();
  const base = tipoPainel[estilo];
  return (
    <Text
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={Boolean(numberOfLines)}
      style={[
        {
          fontFamily: base.fontFamily,
          fontWeight: base.fontWeight,
          fontSize: Math.round(base.fontSize * escala),
          lineHeight: Math.round(base.lineHeight * escala),
          color: cores[cor],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

function Fundo({ children }: { children: React.ReactNode }) {
  const { cores } = useTema();
  const escala = useEscala();
  return (
    <View style={{ flex: 1, backgroundColor: cores.painelFundo, padding: Math.round(64 * escala) }}>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
function Pareamento({ aoParear }: { aoParear: (token: string) => void }) {
  const escala = useEscala();
  const [codigo, setCodigo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function novoCodigo() {
      try {
        const p = await iniciarPareamento();
        if (!ativo) return;
        setCodigo(p.codigo);
        setErro(null);
        const verificar = async () => {
          if (!ativo) return;
          try {
            const r = await consultarPareamento(p.codigo, p.segredo);
            if (r.status === 'aprovado') {
              aoParear(r.token);
              return;
            }
            timer = setTimeout(() => void verificar(), INTERVALO_MS);
          } catch {
            // Código vencido (10 min) ou falha de rede: pede outro.
            timer = setTimeout(() => void novoCodigo(), INTERVALO_MS);
          }
        };
        void verificar();
      } catch {
        if (!ativo) return;
        setErro('Sem conexão com o servidor. Tentando de novo…');
        timer = setTimeout(() => void novoCodigo(), 5000);
      }
    }
    void novoCodigo();
    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
    };
  }, [aoParear]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 32 * escala }}>
      <T estilo="painelUnidade">Saúde na Palma da Mão · Painel da recepção</T>
      <T estilo="painelRotulo">Para ligar esta TV, digite o código no app:</T>
      <T estilo="painelConsultorio" cor="painelDestaque" style={{ letterSpacing: 24 * escala }}>
        {codigo ? `${codigo.slice(0, 3)} ${codigo.slice(3)}` : '··· ···'}
      </T>
      <T estilo="painelApoio" style={{ textAlign: 'center' }}>
        {erro ?? 'Entre no app como Manutenção, abra "TVs da unidade" e toque em "Ligar uma TV".'}
      </T>
    </View>
  );
}

// ---------------------------------------------------------------------------
function Chamadas({ token, aoPerderAcesso }: { token: string; aoPerderAcesso: () => void }) {
  const escala = useEscala();
  const { cores } = useTema();
  const [estado, setEstado] = useState<EstadoPainel | null>(null);
  const [offline, setOffline] = useState(false);
  const [agora, setAgora] = useState(() => new Date());
  const [somLiberado, setSomLiberado] = useState(Platform.OS !== 'web');
  const ultimaChamada = useRef<string | null | undefined>(undefined);
  const player = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      player.current = createAudioPlayer(require('../assets/sons/alerta.wav'));
    } catch {
      player.current = null;
    }
    return () => player.current?.remove();
  }, []);

  const anunciar = useCallback(
    (nome: string, consultorio: string) => {
      if (!somLiberado) return;
      try {
        void player.current?.seekTo(0);
        player.current?.play();
      } catch {
        // Sem som: a tela continua mostrando a chamada.
      }
      setTimeout(() => {
        try {
          Speech.stop();
          Speech.speak(`${nome}. ${consultorio}.`, { language: 'pt-BR', rate: 0.85 });
        } catch {
          // Sem voz: idem.
        }
      }, 1100);
    },
    [somLiberado],
  );

  useEffect(() => {
    let ativo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const buscar = async () => {
      try {
        const novo = await estadoDoPainel(token);
        if (!ativo) return;
        setEstado(novo);
        setOffline(false);
        const id = novo.atual?.id ?? null;
        // Na primeira leitura não anuncia (a TV acabou de ligar).
        if (
          ultimaChamada.current !== undefined &&
          id &&
          id !== ultimaChamada.current &&
          novo.atual
        ) {
          anunciar(novo.atual.nome, novo.atual.consultorio);
        }
        ultimaChamada.current = id;
      } catch (erro) {
        if (tokenRecusado(erro)) {
          aoPerderAcesso();
          return;
        }
        if (ativo) setOffline(true);
      }
      if (ativo) timer = setTimeout(() => void buscar(), INTERVALO_MS);
    };
    void buscar();
    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
    };
  }, [token, anunciar, aoPerderAcesso]);

  useEffect(() => {
    const relogio = setInterval(() => setAgora(new Date()), 15_000);
    return () => clearInterval(relogio);
  }, []);

  const hora = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Recife',
  });

  return (
    <View style={{ flex: 1, gap: 32 * escala }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Segure para desligar esta TV do painel"
          onLongPress={aoPerderAcesso}
          delayLongPress={4000}
          style={{ flex: 1 }}
        >
          <T estilo="painelUnidade" numberOfLines={1}>
            {estado?.unidade.nome ?? 'Painel de chamadas'}
          </T>
        </Pressable>
        <T estilo="painelRelogio">{hora}</T>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          borderWidth: Math.max(2, 4 * escala),
          borderColor: cores.painelDestaque,
          borderRadius: 32 * escala,
          padding: 48 * escala,
          gap: 16 * escala,
        }}
        accessibilityLiveRegion="assertive"
      >
        {estado?.atual ? (
          <>
            <T estilo="painelRotulo">Chamando agora</T>
            <T estilo="painelNome" numberOfLines={2}>
              {estado.atual.nome}
            </T>
            <T estilo="painelConsultorio" cor="painelDestaque" numberOfLines={1}>
              {estado.atual.consultorio}
            </T>
            <T estilo="painelApoio">{estado.atual.medico}</T>
          </>
        ) : (
          <T estilo="painelRotulo" style={{ textAlign: 'center' }}>
            Aguarde: seu nome aparecerá aqui quando for a sua vez.
          </T>
        )}
      </View>

      {estado && estado.anteriores.length > 0 ? (
        <View style={{ gap: 12 * escala }}>
          <T estilo="painelApoio">Chamados antes</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32 * escala }}>
            {estado.anteriores.map((c) => (
              <T key={c.id} estilo="painelAnterior">
                {c.nome} · {c.consultorio}
              </T>
            ))}
          </View>
        </View>
      ) : null}

      {offline ? (
        <T estilo="painelApoio" cor="painelDestaque">
          Sem conexão. Tentando de novo…
        </T>
      ) : null}
      {!somLiberado ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setSomLiberado(true)}
          style={{
            alignSelf: 'flex-start',
            padding: 16 * escala,
            borderWidth: 2,
            borderColor: cores.painelDestaque,
            borderRadius: 16,
          }}
        >
          <T estilo="painelApoio" cor="painelDestaque">
            Toque aqui para ligar o som das chamadas
          </T>
        </Pressable>
      ) : null}
    </View>
  );
}
