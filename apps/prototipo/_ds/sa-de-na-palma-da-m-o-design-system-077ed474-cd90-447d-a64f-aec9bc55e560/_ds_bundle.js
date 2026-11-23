/* @ds-bundle: {"format":4,"namespace":"SaDeNaPalmaDaMODesignSystem_077ed4","components":[{"name":"BackButton","sourcePath":"components/actions/BackButton.jsx"},{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Icon","sourcePath":"components/actions/Icon.jsx"},{"name":"AppointmentCard","sourcePath":"components/cards/AppointmentCard.jsx"},{"name":"DoctorCard","sourcePath":"components/cards/DoctorCard.jsx"},{"name":"QuickAccessCard","sourcePath":"components/cards/QuickAccessCard.jsx"},{"name":"ScheduleBanner","sourcePath":"components/cards/ScheduleBanner.jsx"},{"name":"SpecialtyItem","sourcePath":"components/cards/SpecialtyItem.jsx"},{"name":"StatusBadge","sourcePath":"components/cards/StatusBadge.jsx"},{"name":"CategoryChip","sourcePath":"components/forms/CategoryChip.jsx"},{"name":"SearchBar","sourcePath":"components/forms/SearchBar.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"BottomNav","sourcePath":"components/layout/BottomNav.jsx"},{"name":"HeroHeader","sourcePath":"components/layout/HeroHeader.jsx"}],"sourceHashes":{"components/actions/BackButton.jsx":"ca930ef32e88","components/actions/Button.jsx":"4d6fcca9af15","components/actions/Icon.jsx":"14344e887ac8","components/cards/AppointmentCard.jsx":"85c7656211d0","components/cards/DoctorCard.jsx":"431f3f11e32f","components/cards/QuickAccessCard.jsx":"8f4ee75944e3","components/cards/ScheduleBanner.jsx":"f6721453c528","components/cards/SpecialtyItem.jsx":"9d5b64f2b6bb","components/cards/StatusBadge.jsx":"093cae1b4407","components/forms/CategoryChip.jsx":"2ebc426f3d5a","components/forms/SearchBar.jsx":"8c1b9230f8ec","components/forms/TextField.jsx":"aebd3d8712a3","components/layout/BottomNav.jsx":"7e8323c39aad","components/layout/HeroHeader.jsx":"f0d289406a5a","ui_kits/patient-app/Cadastro.jsx":"288cfedbd5cc","ui_kits/patient-app/Cardiologia.jsx":"398d603ad3f7","ui_kits/patient-app/Especialidades.jsx":"7f758528a675","ui_kits/patient-app/Home.jsx":"b8ab1638b85a","ui_kits/patient-app/Login.jsx":"dcc57849343a"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SaDeNaPalmaDaMODesignSystem_077ed4 = window.SaDeNaPalmaDaMODesignSystem_077ed4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Icon.jsx
try { (() => {
const LUCIDE = 'https://unpkg.com/lucide-static@0.460.0/icons/';
function Icon({
  name,
  size = 24,
  color = 'currentColor',
  label,
  style
}) {
  const url = 'url(' + LUCIDE + name + '.svg)';
  return React.createElement('span', {
    role: label ? 'img' : undefined,
    'aria-label': label,
    'aria-hidden': label ? undefined : true,
    style: {
      display: 'inline-block',
      flex: 'none',
      width: size,
      height: size,
      backgroundColor: color,
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      ...style
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/BackButton.jsx
try { (() => {
function BackButton({
  label = 'Voltar',
  onClick,
  inverse
}) {
  return React.createElement('button', {
    type: 'button',
    onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      minHeight: 48,
      padding: '0 12px 0 4px',
      marginLeft: -4,
      background: 'transparent',
      border: 0,
      borderRadius: 'var(--radius-control)',
      cursor: 'pointer',
      color: inverse ? 'var(--white)' : 'var(--teal-600)',
      font: '500 calc(16px*var(--fs,1))/calc(22px*var(--fs,1)) var(--font-family)'
    }
  }, React.createElement(__ds_scope.Icon, {
    name: 'chevron-left',
    size: 28
  }), label);
}
Object.assign(__ds_scope, { BackButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/BackButton.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
const V = {
  primary: {
    background: 'var(--teal-600)',
    color: 'var(--white)',
    border: '2px solid var(--teal-600)',
    borderRadius: 'var(--radius-control)'
  },
  outline: {
    background: 'var(--white)',
    color: 'var(--teal-600)',
    border: '2px solid var(--border-control)',
    borderRadius: 'var(--radius-control)'
  },
  whatsapp: {
    background: 'var(--cyan-50)',
    color: 'var(--ink)',
    border: '2px solid var(--mint-300)',
    borderRadius: 'var(--radius-full)'
  },
  inverse: {
    background: 'var(--white)',
    color: 'var(--teal-600)',
    border: '2px solid var(--white)',
    borderRadius: 'var(--radius-control)'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  disabled,
  children,
  onClick,
  type = 'button',
  elevated,
  style
}) {
  const [press, setPress] = React.useState(false);
  const v = V[variant] || V.primary;
  const icn = icon || (variant === 'whatsapp' ? 'message-circle' : null);
  return React.createElement('button', {
    type,
    onClick,
    disabled,
    onPointerDown: () => setPress(true),
    onPointerUp: () => setPress(false),
    onPointerLeave: () => setPress(false),
    style: {
      ...v,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      minHeight: size === 'lg' ? 56 : 48,
      padding: size === 'lg' ? '0 28px' : '0 20px',
      width: fullWidth ? '100%' : undefined,
      font: (elevated ? '700 ' : '500 ') + (size === 'lg' ? 'calc(18px*var(--fs,1))' : 'calc(16px*var(--fs,1))') + '/calc(22px*var(--fs,1)) var(--font-family)',
      boxShadow: elevated && !disabled ? '0 8px 20px rgba(3,117,127,.28)' : undefined,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transform: press && !disabled ? 'scale(.98)' : 'none',
      filter: press && !disabled ? 'brightness(.92)' : 'none',
      transition: 'transform var(--duration-fast) var(--ease-standard), filter var(--duration-fast)',
      ...style
    }
  }, icn && React.createElement(__ds_scope.Icon, {
    name: icn,
    size: 22,
    color: variant === 'whatsapp' ? 'var(--success)' : 'currentColor'
  }), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/cards/DoctorCard.jsx
try { (() => {
function DoctorCard({
  name,
  specialty,
  clinic,
  distance,
  photo,
  nextSlot,
  onSchedule
}) {
  const initials = String(name || '').replace(/^(Dra?\.)\s*/, '').split(' ').map(s => s[0]).slice(0, 2).join('');
  return React.createElement('article', {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-card)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center'
    }
  }, React.createElement('div', {
    style: {
      width: 64,
      height: 64,
      flex: 'none',
      borderRadius: '50%',
      background: 'var(--teal-100)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--teal-700)',
      font: '700 calc(22px*var(--fs,1))/1 var(--font-family)'
    }
  }, photo ? React.createElement('img', {
    src: photo,
    alt: '',
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials), React.createElement('div', {
    style: {
      minWidth: 0
    }
  }, React.createElement('div', {
    style: {
      font: '500 calc(18px*var(--fs,1))/calc(26px*var(--fs,1)) var(--font-family)',
      color: 'var(--ink)'
    }
  }, name), React.createElement('div', {
    style: {
      font: '400 calc(16px*var(--fs,1))/calc(24px*var(--fs,1)) var(--font-family)',
      color: 'var(--ink-muted)'
    }
  }, specialty), clinic && React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      font: '400 calc(14px*var(--fs,1))/calc(20px*var(--fs,1)) var(--font-family)',
      color: 'var(--ink-muted)'
    }
  }, React.createElement(__ds_scope.Icon, {
    name: 'map-pin',
    size: 16,
    color: 'var(--teal-600)'
  }), clinic + (distance ? ' · ' + distance : '')))), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, nextSlot && React.createElement('div', {
    style: {
      font: '400 calc(14px*var(--fs,1))/calc(20px*var(--fs,1)) var(--font-family)',
      color: 'var(--ink-muted)'
    }
  }, 'Próximo horário', React.createElement('br'), React.createElement('span', {
    style: {
      font: '500 calc(16px*var(--fs,1))/calc(22px*var(--fs,1)) var(--font-family)',
      color: 'var(--ink)'
    }
  }, nextSlot)), React.createElement(__ds_scope.Button, {
    onClick: onSchedule,
    icon: 'calendar-plus'
  }, 'Agendar')));
}
Object.assign(__ds_scope, { DoctorCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/DoctorCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/QuickAccessCard.jsx
try { (() => {
const K = {
  consultas: ['blue', 'calendar', 'Consultas'],
  exames: ['lilac', 'flask-conical', 'Exames'],
  receitas: ['rose', 'pill', 'Receitas'],
  pretriagem: ['sand', 'clipboard-list', 'Pré-triagem']
};
function QuickAccessCard({
  kind = 'consultas',
  label,
  onClick
}) {
  const [c, icon, def] = K[kind] || K.consultas;
  return React.createElement('button', {
    type: 'button',
    onClick,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      minHeight: 104,
      width: '100%',
      padding: 16,
      border: 0,
      borderRadius: 'var(--radius-card)',
      cursor: 'pointer',
      textAlign: 'left',
      background: 'var(--qa-' + c + '-bg)',
      color: 'var(--qa-' + c + '-ink)',
      font: '500 calc(16px*var(--fs,1))/calc(22px*var(--fs,1)) var(--font-family)'
    }
  }, React.createElement('span', {
    style: {
      width: 44,
      height: 44,
      borderRadius: 'var(--radius-control)',
      background: 'var(--white)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 24
  })), label || def);
}
Object.assign(__ds_scope, { QuickAccessCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/QuickAccessCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/ScheduleBanner.jsx
try { (() => {
function ScheduleBanner({
  title = 'Precisa de uma consulta?',
  text = 'Encontre a especialidade e a clínica mais perto de você.',
  cta = 'Agendar consulta',
  onClick
}) {
  return React.createElement('section', {
    style: {
      background: 'var(--header-gradient)',
      color: 'var(--white)',
      borderRadius: 'var(--radius-card)',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: 'var(--shadow-card)'
    }
  }, React.createElement('div', {
    style: {
      font: '700 calc(22px*var(--fs,1))/calc(30px*var(--fs,1)) var(--font-family)'
    }
  }, title), React.createElement('div', {
    style: {
      font: '400 calc(16px*var(--fs,1))/calc(24px*var(--fs,1)) var(--font-family)'
    }
  }, text), React.createElement('div', null, React.createElement(__ds_scope.Button, {
    variant: 'inverse',
    icon: 'calendar-plus',
    onClick
  }, cta)));
}
Object.assign(__ds_scope, { ScheduleBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/ScheduleBanner.jsx", error: String((e && e.message) || e) }); }

// components/cards/SpecialtyItem.jsx
try { (() => {
function SpecialtyItem({
  label,
  icon = 'heart-pulse',
  image,
  layout = 'tile',
  onClick
}) {
  const row = layout === 'row';
  const circle = React.createElement('span', {
    style: {
      width: row ? 56 : 72,
      height: row ? 56 : 72,
      flex: 'none',
      borderRadius: '50%',
      background: 'var(--rose-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }
  }, image ? React.createElement('img', {
    src: image,
    alt: '',
    style: {
      width: '78%',
      height: '78%',
      objectFit: 'contain'
    }
  }) : React.createElement(__ds_scope.Icon, {
    name: icon,
    size: row ? 28 : 34,
    color: 'var(--teal-600)'
  }));
  return React.createElement('button', {
    type: 'button',
    onClick,
    style: {
      display: 'flex',
      flexDirection: row ? 'row' : 'column',
      alignItems: 'center',
      gap: row ? 16 : 8,
      width: row ? '100%' : 96,
      minHeight: 48,
      padding: row ? '8px 12px' : 4,
      background: row ? 'var(--white)' : 'transparent',
      border: 0,
      borderRadius: row ? 'var(--radius-card)' : 'var(--radius-control)',
      boxShadow: row ? 'var(--shadow-card)' : 'none',
      cursor: 'pointer',
      textAlign: row ? 'left' : 'center',
      color: 'var(--ink)',
      font: (row ? '500 calc(18px*var(--fs,1))/calc(26px*var(--fs,1))' : '500 calc(14px*var(--fs,1))/calc(20px*var(--fs,1))') + ' var(--font-family)'
    }
  }, circle, React.createElement('span', {
    style: {
      flex: row ? 1 : 'none'
    }
  }, label), row && React.createElement(__ds_scope.Icon, {
    name: 'chevron-right',
    size: 24,
    color: 'var(--teal-600)'
  }));
}
Object.assign(__ds_scope, { SpecialtyItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/SpecialtyItem.jsx", error: String((e && e.message) || e) }); }

// components/cards/StatusBadge.jsx
try { (() => {
const S = {
  agendado: ['Agendado', 'calendar-check', 'var(--teal-100)', 'var(--teal-700)'],
  pronto: ['Pronto para atendimento', 'user-check', 'var(--success-bg)', 'var(--success)'],
  concluido: ['Concluído', 'circle-check', '#eef2f2', 'var(--ink-muted)'],
  aviso: ['Atenção', 'triangle-alert', 'var(--warning-bg)', 'var(--warning)'],
  urgente: ['Urgência', 'siren', 'var(--error-bg)', 'var(--error)']
};
function StatusBadge({
  status = 'agendado',
  label
}) {
  const [def, icon, bg, fg] = S[status] || S.agendado;
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      minHeight: 32,
      padding: '0 12px 0 10px',
      borderRadius: 'var(--radius-full)',
      background: bg,
      color: fg,
      font: '500 calc(14px*var(--fs,1))/calc(20px*var(--fs,1)) var(--font-family)'
    }
  }, React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  }), label || def);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/cards/AppointmentCard.jsx
try { (() => {
const line = (icon, text) => React.createElement('div', {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--ink-muted)',
    font: '400 calc(16px*var(--fs,1))/calc(24px*var(--fs,1)) var(--font-family)'
  }
}, React.createElement(__ds_scope.Icon, {
  name: icon,
  size: 20,
  color: 'var(--teal-600)'
}), text);
function AppointmentCard({
  date,
  time,
  doctor,
  specialty,
  clinic,
  status = 'agendado',
  onReschedule,
  onDetails
}) {
  return React.createElement('article', {
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-card)',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, React.createElement('div', null, React.createElement('div', {
    style: {
      font: '700 calc(22px*var(--fs,1))/calc(30px*var(--fs,1)) var(--font-family)',
      color: 'var(--ink)'
    }
  }, date + ' · ' + time), React.createElement('div', {
    style: {
      font: '500 calc(18px*var(--fs,1))/calc(26px*var(--fs,1)) var(--font-family)',
      color: 'var(--ink)'
    }
  }, doctor)), React.createElement(__ds_scope.StatusBadge, {
    status
  })), specialty && line('stethoscope', specialty), clinic && line('map-pin', clinic), (onReschedule || onDetails) && React.createElement('div', {
    style: {
      display: 'flex',
      gap: 12,
      marginTop: 4,
      flexWrap: 'wrap'
    }
  }, onReschedule && React.createElement(__ds_scope.Button, {
    variant: 'outline',
    icon: 'calendar-clock',
    onClick: onReschedule
  }, 'Remarcar'), onDetails && React.createElement(__ds_scope.Button, {
    onClick: onDetails
  }, 'Ver detalhes')));
}
Object.assign(__ds_scope, { AppointmentCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/AppointmentCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/CategoryChip.jsx
try { (() => {
function CategoryChip({
  label,
  selected,
  onClick
}) {
  return React.createElement('button', {
    type: 'button',
    onClick,
    'aria-pressed': !!selected,
    style: {
      minHeight: 48,
      padding: '0 20px',
      borderRadius: 'var(--radius-full)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      font: '500 calc(16px*var(--fs,1))/calc(22px*var(--fs,1)) var(--font-family)',
      transition: 'background var(--duration-fast)',
      background: selected ? 'var(--teal-600)' : 'var(--teal-100)',
      color: selected ? 'var(--white)' : 'var(--ink)',
      border: '2px solid ' + (selected ? 'var(--teal-600)' : 'var(--teal-100)')
    }
  }, label);
}
Object.assign(__ds_scope, { CategoryChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/CategoryChip.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchBar.jsx
try { (() => {
function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar especialidade',
  onMic,
  label = 'Buscar'
}) {
  return React.createElement('div', {
    role: 'search',
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minHeight: 56,
      padding: '0 4px 0 16px',
      background: 'var(--white)',
      border: '2px solid var(--border-control)',
      borderRadius: 'var(--radius-control)'
    }
  }, React.createElement(__ds_scope.Icon, {
    name: 'search',
    size: 22,
    color: 'var(--ink-muted)'
  }), React.createElement('input', {
    'aria-label': label,
    value,
    placeholder,
    onChange: e => onChange && onChange(e.target.value),
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 0,
      background: 'transparent',
      font: '400 calc(18px*var(--fs,1))/calc(26px*var(--fs,1)) var(--font-family)',
      color: 'var(--ink)'
    }
  }), React.createElement('button', {
    type: 'button',
    onClick: onMic,
    'aria-label': 'Buscar por voz',
    style: {
      width: 48,
      height: 48,
      border: 0,
      borderRadius: 'var(--radius-control)',
      background: 'var(--teal-100)',
      color: 'var(--teal-600)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, React.createElement(__ds_scope.Icon, {
    name: 'mic',
    size: 22
  })));
}
Object.assign(__ds_scope, { SearchBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchBar.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  type = 'text',
  icon,
  id,
  multiline,
  inputMode,
  variant = 'default',
  revealable
}) {
  const [focus, setFocus] = React.useState(false);
  const [reveal, setReveal] = React.useState(false);
  const soft = variant === 'soft';
  const glass = variant === 'glass';
  const pill = variant === 'pill';
  const canReveal = !!revealable && !multiline;
  const fid = id || 'tf-' + String(label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const border = error ? 'var(--error)' : glass ? '#ffffff' : focus ? 'var(--teal-600)' : 'var(--border-control)';
  const Tag = multiline ? 'textarea' : 'input';
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%'
    }
  }, label && React.createElement('label', {
    htmlFor: fid,
    style: {
      font: (soft ? '600' : '500') + ' calc(16px*var(--fs,1))/calc(22px*var(--fs,1)) var(--font-family)',
      color: soft ? 'var(--ink)' : 'var(--ink)'
    }
  }, label), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: multiline ? 'flex-start' : 'center',
      gap: 10,
      padding: multiline ? '14px 16px' : canReveal ? '0 4px 0 16px' : '0 16px',
      background: glass ? 'rgba(255,255,255,.10)' : 'var(--white)',
      borderRadius: glass || pill ? 'var(--radius-full)' : 'var(--radius-control)',
      minHeight: pill ? 48 : 56,
      border: (soft || glass || pill ? '1.5px' : '2px') + ' solid ' + (pill && !focus && !error ? 'var(--border-control)' : border),
      boxShadow: focus ? (glass ? '0 0 0 3px rgba(255,255,255,.35)' : '0 0 0 3px var(--teal-100)') : 'none',
      transition: 'box-shadow var(--duration-fast)'
    }
  }, icon && React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22,
    color: glass ? '#ffffff' : 'var(--ink-muted)'
  }), React.createElement(Tag, {
    id: fid,
    type: canReveal && reveal ? 'text' : type,
    className: glass ? 'ds-tf-glass' : pill ? 'ds-tf-pill' : undefined,
    'aria-label': (glass || pill) && !label && placeholder ? placeholder : undefined,
    value,
    placeholder,
    inputMode,
    rows: multiline ? 3 : undefined,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    'aria-invalid': !!error,
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 0,
      background: 'transparent',
      resize: 'none',
      font: glass ? '400 min(calc(15px*var(--fs,1)), 18px)/1.4 var(--font-family)' : soft || pill ? '400 calc(15px*var(--fs,1))/calc(22px*var(--fs,1)) var(--font-family)' : '400 calc(18px*var(--fs,1))/calc(26px*var(--fs,1)) var(--font-family)',
      color: glass ? '#ffffff' : soft ? 'var(--ink)' : 'var(--ink)'
    }
  }), canReveal && React.createElement('button', {
    type: 'button',
    onClick: () => setReveal(r => !r),
    'aria-label': reveal ? 'Ocultar senha' : 'Mostrar senha',
    'aria-pressed': reveal,
    'aria-controls': fid,
    style: {
      flex: 'none',
      width: 48,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      border: 0,
      borderRadius: 'var(--radius-control)',
      background: 'transparent',
      cursor: 'pointer'
    }
  }, React.createElement(__ds_scope.Icon, {
    name: reveal ? 'eye-off' : 'eye',
    size: 22,
    color: 'var(--ink-muted)'
  }))), error ? React.createElement('div', {
    role: 'alert',
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      color: 'var(--error)',
      font: '400 calc(14px*var(--fs,1))/calc(20px*var(--fs,1)) var(--font-family)'
    }
  }, React.createElement(__ds_scope.Icon, {
    name: 'circle-alert',
    size: 18
  }), error) : hint && React.createElement('div', {
    style: {
      color: 'var(--ink-muted)',
      font: '400 calc(14px*var(--fs,1))/calc(20px*var(--fs,1)) var(--font-family)'
    }
  }, hint));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/layout/BottomNav.jsx
try { (() => {
const DEFAULT = [{
  id: 'inicio',
  label: 'Início',
  icon: 'house'
}, {
  id: 'consultas',
  label: 'Consultas',
  icon: 'calendar'
}, {
  id: 'documentos',
  label: 'Documentos',
  icon: 'file-text'
}, {
  id: 'perfil',
  label: 'Perfil',
  icon: 'user'
}];
function BottomNav({
  items = DEFAULT,
  active = 'inicio',
  onChange,
  variant = 'default'
}) {
  const soft = variant === 'soft';
  return React.createElement('nav', {
    'aria-label': 'Navegação principal',
    style: soft ? {
      display: 'flex',
      background: '#ffffff',
      borderTop: '1px solid #d3dfe0',
      padding: '6px 8px 8px'
    } : {
      display: 'flex',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-nav)',
      borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
      padding: '8px 8px 12px'
    }
  }, items.map(it => {
    const on = it.id === active;
    return React.createElement('button', {
      key: it.id,
      type: 'button',
      'aria-current': on ? 'page' : undefined,
      onClick: () => onChange && onChange(it.id),
      style: {
        flex: 1,
        minHeight: 56,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: soft ? 4 : 2,
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        color: soft ? (on ? 'var(--teal-600)' : 'var(--ink-muted)') : on ? 'var(--teal-600)' : 'var(--ink-muted)',
        font: (on ? (soft ? 600 : 500) : 400) + ' calc(14px*var(--fs,1))/calc(20px*var(--fs,1)) var(--font-family)'
      }
    }, React.createElement('span', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: soft ? 64 : 56,
        height: 32,
        borderRadius: 'var(--radius-full)',
        background: on ? (soft ? 'var(--teal-100)' : 'var(--teal-100)') : 'transparent',
        transition: 'background var(--duration-base)'
      }
    }, React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 24
    })), it.label);
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/layout/HeroHeader.jsx
try { (() => {
function HeroHeader({
  top,
  children,
  headerHeight = 200,
  sheetOverlap = 32,
  style
}) {
  return React.createElement('div', {
    style: {
      position: 'relative',
      background: 'var(--header-gradient)',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, React.createElement('div', {
    style: {
      minHeight: headerHeight,
      padding: '16px var(--screen-margin) ' + (sheetOverlap + 16) + 'px',
      color: 'var(--white)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }
  }, top), React.createElement('div', {
    style: {
      flex: 1,
      marginTop: -sheetOverlap,
      background: 'var(--surface-sheet)',
      borderRadius: 'var(--radius-sheet) var(--radius-sheet) 0 0',
      boxShadow: 'var(--shadow-sheet)',
      padding: '28px var(--screen-margin) 24px'
    }
  }, children));
}
Object.assign(__ds_scope, { HeroHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/HeroHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/patient-app/Cadastro.jsx
try { (() => {
function CadastroScreen({
  go
}) {
  const {
    HeroHeader,
    TextField,
    Button,
    BackButton
  } = window.SaDeNaPalmaDaMODesignSystem_077ed4;
  const [f, setF] = React.useState({
    nome: '',
    cpf: '',
    nasc: '',
    cel: ''
  });
  const [err, setErr] = React.useState(false);
  const set = k => v => setF(s => ({
    ...s,
    [k]: v
  }));
  const submit = () => {
    if (f.cpf.replace(/\D/g, '').length !== 11) {
      setErr(true);
      return;
    }
    go('home');
  };
  return /*#__PURE__*/React.createElement(HeroHeader, {
    headerHeight: 170,
    top: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(BackButton, {
      inverse: true,
      onClick: () => go('login')
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        font: '700 calc(28px*var(--fs,1))/calc(36px*var(--fs,1)) var(--font-family)'
      }
    }, "Criar conta"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(TextField, {
    label: "Nome completo",
    value: f.nome,
    onChange: set('nome')
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "CPF",
    inputMode: "numeric",
    value: f.cpf,
    onChange: v => {
      set('cpf')(v);
      setErr(false);
    },
    hint: "S\xF3 os n\xFAmeros",
    error: err ? 'O CPF precisa ter 11 números. Confira e tente de novo.' : undefined
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Data de nascimento",
    inputMode: "numeric",
    placeholder: "dd/mm/aaaa",
    value: f.nasc,
    onChange: set('nasc')
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Celular com DDD",
    inputMode: "tel",
    value: f.cel,
    onChange: set('cel'),
    hint: "Usamos para lembrar voc\xEA da consulta"
  }), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    size: "lg",
    onClick: submit
  }, "Criar conta")));
}
window.CadastroScreen = CadastroScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/patient-app/Cadastro.jsx", error: String((e && e.message) || e) }); }

// ui_kits/patient-app/Cardiologia.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cardioDocs = [{
  name: 'Dra. Ana Ribeiro',
  clinic: 'Clínica Vida',
  distance: '1,2 km',
  nextSlot: 'Amanhã, 9:00'
}, {
  name: 'Dr. Paulo Mendes',
  clinic: 'Centro Médico Sul',
  distance: '2,8 km',
  nextSlot: 'Sex, 14:30'
}, {
  name: 'Dra. Lúcia Prado',
  clinic: 'Clínica Bem Estar',
  distance: '4,1 km',
  nextSlot: 'Seg, 10:00'
}];
function CardiologiaScreen({
  go,
  onBook
}) {
  const {
    BackButton,
    CategoryChip,
    DoctorCard,
    SpecialtyItem
  } = window.SaDeNaPalmaDaMODesignSystem_077ed4;
  const [f, setF] = React.useState('Mais perto');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px var(--screen-margin) 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(BackButton, {
    onClick: () => go('especialidades')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      background: 'var(--rose-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(window.SaDeNaPalmaDaMODesignSystem_077ed4.Icon, {
    name: "heart-pulse",
    size: 32,
    color: "var(--teal-600)"
  })), /*#__PURE__*/React.createElement("h1", {
    className: "t-title-1",
    style: {
      margin: 0
    }
  }, "Cardiologia")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      margin: '0 calc(-1 * var(--screen-margin))',
      padding: '0 var(--screen-margin) 4px'
    }
  }, ['Mais perto', 'Hoje', 'Esta semana'].map(c => /*#__PURE__*/React.createElement(CategoryChip, {
    key: c,
    label: c,
    selected: f === c,
    onClick: () => setF(c)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, cardioDocs.map(d => /*#__PURE__*/React.createElement(DoctorCard, _extends({
    key: d.name
  }, d, {
    specialty: "Cardiologista",
    onSchedule: () => onBook(d.name)
  })))));
}
window.CardiologiaScreen = CardiologiaScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/patient-app/Cardiologia.jsx", error: String((e && e.message) || e) }); }

// ui_kits/patient-app/Especialidades.jsx
try { (() => {
const allSpecs = [['Cardiologia', 'heart-pulse'], ['Clínica geral', 'stethoscope'], ['Dermatologia', 'hand'], ['Geriatria', 'accessibility'], ['Neurologia', 'brain'], ['Oftalmologia', 'eye'], ['Ortopedia', 'bone']];
function EspecialidadesScreen({
  go
}) {
  const {
    SearchBar,
    SpecialtyItem,
    BackButton
  } = window.SaDeNaPalmaDaMODesignSystem_077ed4;
  const [q, setQ] = React.useState('');
  const list = allSpecs.filter(([l]) => l.toLowerCase().includes(q.toLowerCase()));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px var(--screen-margin) 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(BackButton, {
    onClick: () => go('home')
  }), /*#__PURE__*/React.createElement("h1", {
    className: "t-title-1",
    style: {
      margin: 0
    }
  }, "Especialidades"), /*#__PURE__*/React.createElement(SearchBar, {
    value: q,
    onChange: setQ
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, list.map(([l, i]) => /*#__PURE__*/React.createElement(SpecialtyItem, {
    key: l,
    layout: "row",
    label: l,
    icon: i,
    onClick: () => go('cardiologia')
  })), !list.length && /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      color: 'var(--ink-muted)'
    }
  }, "N\xE3o encontramos \u201C", q, "\u201D. Tente outro nome ou fale pelo WhatsApp.")));
}
window.EspecialidadesScreen = EspecialidadesScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/patient-app/Especialidades.jsx", error: String((e && e.message) || e) }); }

// ui_kits/patient-app/Home.jsx
try { (() => {
const homeSpecs = [['Cardiologia', 'heart-pulse'], ['Neurologia', 'brain'], ['Ortopedia', 'bone'], ['Oftalmologia', 'eye']];
function HomeScreen({
  go,
  booked
}) {
  const {
    HeroHeader,
    TextField,
    QuickAccessCard,
    SpecialtyItem,
    AppointmentCard,
    ScheduleBanner
  } = window.SaDeNaPalmaDaMODesignSystem_077ed4;
  const [sym, setSym] = React.useState('');
  return /*#__PURE__*/React.createElement(HeroHeader, {
    headerHeight: 230,
    top: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: '400 calc(18px*var(--fs,1))/calc(26px*var(--fs,1)) var(--font-family)'
      }
    }, "Bom dia,"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: '700 calc(28px*var(--fs,1))/calc(36px*var(--fs,1)) var(--font-family)'
      }
    }, "Maria")), /*#__PURE__*/React.createElement("div", {
      style: {
        color: 'var(--ink)'
      }
    }, /*#__PURE__*/React.createElement(TextField, {
      label: "",
      icon: "message-square-text",
      placeholder: "Gostaria de relatar sintomas\u2026",
      value: sym,
      onChange: setSym
    })))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    }
  }, booked && /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "t-title-2",
    style: {
      margin: 0
    }
  }, "Pr\xF3xima consulta"), /*#__PURE__*/React.createElement(AppointmentCard, {
    date: "Qua, 26 nov",
    time: "9:00",
    doctor: booked,
    specialty: "Cardiologia",
    clinic: "Cl\xEDnica Vida \xB7 1,2 km",
    status: "agendado",
    onReschedule: () => go('cardiologia')
  })), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "t-title-2",
    style: {
      margin: 0
    }
  }, "Acesso r\xE1pido"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(QuickAccessCard, {
    kind: "consultas"
  }), /*#__PURE__*/React.createElement(QuickAccessCard, {
    kind: "exames"
  }), /*#__PURE__*/React.createElement(QuickAccessCard, {
    kind: "receitas"
  }), /*#__PURE__*/React.createElement(QuickAccessCard, {
    kind: "pretriagem"
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "t-title-2",
    style: {
      margin: 0
    }
  }, "Especialidades"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "t-label",
    onClick: e => {
      e.preventDefault();
      go('especialidades');
    }
  }, "Ver todas")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, homeSpecs.map(([l, i]) => /*#__PURE__*/React.createElement(SpecialtyItem, {
    key: l,
    label: l,
    icon: i,
    onClick: () => go(l === 'Cardiologia' ? 'cardiologia' : 'especialidades')
  })))), !booked && /*#__PURE__*/React.createElement(ScheduleBanner, {
    onClick: () => go('especialidades')
  })));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/patient-app/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/patient-app/Login.jsx
try { (() => {
function LoginScreen({
  go
}) {
  const {
    HeroHeader,
    TextField,
    Button
  } = window.SaDeNaPalmaDaMODesignSystem_077ed4;
  const [cpf, setCpf] = React.useState('');
  const [pw, setPw] = React.useState('');
  return /*#__PURE__*/React.createElement(HeroHeader, {
    headerHeight: 260,
    top: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: '700 calc(28px*var(--fs,1))/calc(36px*var(--fs,1)) var(--font-family)'
      }
    }, "Sa\xFAde na Palma da M\xE3o"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: '400 calc(18px*var(--fs,1))/calc(28px*var(--fs,1)) var(--font-family)'
      }
    }, "Sua consulta, mais perto de voc\xEA."))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("h1", {
    className: "t-title-1",
    style: {
      margin: 0
    }
  }, "Entrar"), /*#__PURE__*/React.createElement(TextField, {
    label: "CPF",
    inputMode: "numeric",
    placeholder: "000.000.000-00",
    value: cpf,
    onChange: setCpf
  }), /*#__PURE__*/React.createElement(TextField, {
    label: "Senha",
    type: "password",
    value: pw,
    onChange: setPw
  }), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    size: "lg",
    onClick: () => go('home')
  }, "Entrar"), /*#__PURE__*/React.createElement("div", {
    className: "t-body",
    style: {
      textAlign: 'center'
    }
  }, "Ainda n\xE3o tem conta? ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      go('cadastro');
    }
  }, "Criar conta")), /*#__PURE__*/React.createElement(Button, {
    variant: "whatsapp",
    fullWidth: true
  }, "Prefiro conversar pelo WhatsApp")));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/patient-app/Login.jsx", error: String((e && e.message) || e) }); }

__ds_ns.BackButton = __ds_scope.BackButton;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.AppointmentCard = __ds_scope.AppointmentCard;

__ds_ns.DoctorCard = __ds_scope.DoctorCard;

__ds_ns.QuickAccessCard = __ds_scope.QuickAccessCard;

__ds_ns.ScheduleBanner = __ds_scope.ScheduleBanner;

__ds_ns.SpecialtyItem = __ds_scope.SpecialtyItem;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.CategoryChip = __ds_scope.CategoryChip;

__ds_ns.SearchBar = __ds_scope.SearchBar;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.HeroHeader = __ds_scope.HeroHeader;

})();
