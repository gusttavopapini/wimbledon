import {
  Activity,
  ArrowLeft,
  Bell,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  ClipboardList,
  Clock,
  DoorOpen,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  HeartPulse,
  House,
  Info,
  KeyRound,
  LoaderCircle,
  LogIn,
  LogOut,
  MapPin,
  Megaphone,
  MessageCircle,
  Phone,
  Pill,
  Play,
  Plus,
  Power,
  RefreshCw,
  Search,
  Settings,
  Siren,
  Sparkles,
  Stethoscope,
  Trash2,
  TriangleAlert,
  Tv,
  UserPlus,
  UserRound,
  Users,
  Volume2,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import { svgDecorativo } from './acessibilidade';

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
  stethoscope: Stethoscope,
  'clipboard-list': ClipboardList,
  'file-text': FileText,
  pill: Pill,
  bell: Bell,
  tv: Tv,
  users: Users,
  'building-2': Building2,
  'door-open': DoorOpen,
  phone: Phone,
  'message-circle': MessageCircle,
  play: Play,
  'check-check': CheckCheck,
  'user-plus': UserPlus,
  megaphone: Megaphone,
  activity: Activity,
  clock: Clock,
  siren: Siren,
  'key-round': KeyRound,
  power: Power,
  plus: Plus,
  'trash-2': Trash2,
  'heart-pulse': HeartPulse,
  'volume-2': Volume2,
  'calendar-x': CalendarX,
  'calendar-clock': CalendarClock,
  'flask-conical': FlaskConical,
  'clipboard-check': ClipboardCheck,
  sparkles: Sparkles,
  'chevron-left': ChevronLeft,
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
      {...svgDecorativo}
    />
  );
}
