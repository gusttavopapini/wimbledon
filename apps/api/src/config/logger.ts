import { pino, type DestinationStream, type Logger } from 'pino';

/** "12345678901" -> "***.***.*89-01": guarda só o fim, suficiente para suporte. */
export function mascararCpf(cpf: unknown): string {
  const digitos = String(cpf ?? '').replace(/\D/g, '');
  if (digitos.length < 4) return '***';
  return `***.***.*${digitos.slice(-4, -2)}-${digitos.slice(-2)}`;
}

/** Mantém o esquema ("Bearer") e só os 6 últimos caracteres do token. */
export function mascararToken(token: unknown): string {
  const texto = String(token ?? '');
  const [esquema, valor] = texto.includes(' ') ? texto.split(' ', 2) : ['', texto];
  const fim = (valor ?? '').slice(-6);
  return `${esquema ? `${esquema} ` : ''}***${fim}`;
}

const CAMINHOS_CPF = ['cpf', '*.cpf', '*.*.cpf', 'req.body.cpf'];
const CAMINHOS_TOKEN = [
  'req.headers.authorization',
  'req.headers.cookie',
  'token',
  'idToken',
  '*.token',
  '*.idToken',
  '*.expoPushTokens',
];
const CAMINHOS_REMOVIDOS = [
  'senha',
  '*.senha',
  '*.*.senha',
  'req.body.senha',
  'password',
  '*.password',
];

export function criarLogger(nivel: string, destino?: DestinationStream): Logger {
  const opcoes: pino.LoggerOptions = {
    level: nivel,
    base: { servico: 'api' },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [...CAMINHOS_CPF, ...CAMINHOS_TOKEN, ...CAMINHOS_REMOVIDOS],
      censor: (valor, caminho) => {
        const chave = caminho.at(-1) ?? '';
        if (chave === 'cpf') return mascararCpf(valor);
        if (chave === 'senha' || chave === 'password') return '[removido]';
        if (Array.isArray(valor)) return valor.map(mascararToken);
        return mascararToken(valor);
      },
    },
  };
  return destino ? pino(opcoes, destino) : pino(opcoes);
}
