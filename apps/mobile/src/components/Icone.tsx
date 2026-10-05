import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CalendarPlus,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  House,
  Info,
  LoaderCircle,
  LogIn,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Settings,
  TriangleAlert,
  UserRound,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import { useTema } from '@/hooks/useTema';
import type { NomeCor } from '@/theme/tema';

const ICONES = {
  'arrow-left': ArrowLeft,
  calendar: Calendar,
  'calendar-check': CalendarCheck,
  'calendar-plus': CalendarPlus,
  'chevron-right': ChevronRight,
  house: House,
  'map-pin': MapPin,
  'refresh-cw': RefreshCw,
  search: Search,
  settings: Settings,
  'user-round': UserRound,
  'wifi-off': WifiOff,
  x: X,
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
  /** Espessura do traço; 2 por padrão (2,5 no item ativo da navegação). */
  espessura?: number;
}

/** Ícone Lucide com traço de 2px. Decorativo: o texto ao lado é quem informa. */
export function Icone({ nome, cor = 'primaria', tamanho, espessura = 2 }: IconeProps) {
  const { cores, letraGrande, tamanho: medidas } = useTema();
  const Componente = ICONES[nome];
  return (
    <Componente
      size={tamanho ?? (letraGrande ? medidas.tamanhoIconeNavegacao : medidas.tamanhoIcone)}
      color={cores[cor]}
      strokeWidth={espessura}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
