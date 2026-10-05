import {
  CalendarCheck,
  Check,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
  LogIn,
  LogOut,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';

import { useTema } from '@/hooks/useTema';
import type { NomeCor } from '@/theme/tema';

const ICONES = {
  'calendar-check': CalendarCheck,
  check: Check,
  'circle-alert': CircleAlert,
  'circle-check': CircleCheck,
  eye: Eye,
  'eye-off': EyeOff,
  info: Info,
  'loader-circle': LoaderCircle,
  'log-in': LogIn,
  'log-out': LogOut,
  'triangle-alert': TriangleAlert,
} satisfies Record<string, LucideIcon>;

export type NomeIcone = keyof typeof ICONES;

interface IconeProps {
  nome: NomeIcone;
  cor?: NomeCor;
  /** Padrão: 24px, ou 28px com letra grande. */
  tamanho?: number;
}

/** Ícone Lucide com traço de 2px. Decorativo: o texto ao lado é quem informa. */
export function Icone({ nome, cor = 'primaria', tamanho }: IconeProps) {
  const { cores, letraGrande, tamanho: medidas } = useTema();
  const Componente = ICONES[nome];
  return (
    <Componente
      size={tamanho ?? (letraGrande ? medidas.tamanhoIconeNavegacao : medidas.tamanhoIcone)}
      color={cores[cor]}
      strokeWidth={2}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
