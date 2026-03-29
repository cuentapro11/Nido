import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Contact { nombre: string; relacion: string; telefono: string; }
export interface TimelineItem {
  icon: string; bg: string; title: string; desc: string; time: string; type: string;
  hasImg?: boolean; photo?: string | null; video?: string | null; duracion?: string | null;
  extra?: string; liked?: boolean;
}
export interface ChildDocument {
  id: string; nombre: string; tipo: string; url: string; uploadedAt: string;
}

export interface Child {
  id: number; name: string; emoji: string; bg: string; tc: string; group: string;
  age: string; present: boolean; lastMin: number | null; photo: string | null;
  alerts: string[]; cumpleanos: string; medicamentos: string; contactos: Contact[];
  notas: string; tl: TimelineItem[];
  // Parent-editable extended fields
  apellido?: string;
  estado?: string;
  aulaPrincipal?: string;
  aulaOtros?: string;
  medicoNombre?: string;
  medicoTelefono?: string;
  direccion1?: string;
  direccion2?: string;
  ciudad?: string;
  codigoPostal?: string;
  pais?: string;
  estadoTerritorio?: string;
  documentos?: ChildDocument[];
  // Admin-only fields
  fechaIngreso?: string; historialPagos?: string[]; notasPrivadas?: string;
}
export interface Parent {
  id: number; name: string; hijo: string; initials: string; bg: string; tc: string;
  msg: string; time: string; unread: number;
}
export interface CuidoEvent { title: string; date: string; desc: string; color: string; }
export interface PendingPayment { name: string; sub: string; amount: string; reminded: boolean; }
export interface Solicitud { name: string; hijo: string; code: string; initials: string; bg: string; tc: string; }
export interface Cuidador { id: number; nombre: string; rol: string; emoji: string; activo: boolean; capacidadMax?: number; }

export interface Aula {
  id: number;
  nombre: string;
  color: string;
  emoji: string;
  categoria?: string;
}

export interface AppNotification {
  id: string;
  childId: number;
  childName: string;
  field: string;
  oldValue: string;
  newValue: string;
  time: string;
  read: boolean;
  /** 'admin' = shown in Dashboard bell; 'parent' = shown in ParentChat badge */
  target: 'admin' | 'parent';
}

export interface ReporteDiario {
  id: string;
  childId: number;
  fecha: string;
  actividades: string;
  comidas: string;
  siesta: string;
  notas: string;
}

export interface ConfiguracionGeneral {
  notificaciones: boolean;
  idioma: 'es' | 'en';
  notifEntradaSalida: boolean;
  notifActividades: boolean;
  notifPagos: boolean;
}
export interface CuidoInfo {
  nombre: string; direccion: string; telefono: string; horarioApertura: string;
  horarioCierre: string; capacidadMax: number | null; emoji: string;
}
export interface PagoConfig {
  tarifaMensual: string; diaCobro: string; metodo: 'efectivo' | 'transferencia' | 'mixto';
}

const DEFAULT_CHILDREN: Child[] = [
  {id:0,name:'Sofía',emoji:'👶',bg:'#FFF0F0',tc:'#C0354D',group:'Bebés',age:'14 meses',present:true,lastMin:-70,photo:null,
   alerts:['Alergia al maní'],cumpleanos:'15 enero 2025',medicamentos:'Vitamina D 3 gotas 10am',
   contactos:[{nombre:'María Pérez',relacion:'Mamá',telefono:'829-555-0101'},{nombre:'Carlos Pérez',relacion:'Papá',telefono:'829-555-0110'}],
   notas:'Le gusta la música suave.',fechaIngreso:'3 enero 2025',historialPagos:['Enero 2025 - RD$900','Febrero 2025 - RD$900'],notasPrivadas:'Familia puntual en pagos.',
   tl:[
     {icon:'🚪',bg:'#E8F9EE',title:'Entrada',desc:'',time:'8:00 AM',type:'entry'},
     {icon:'📸',bg:'#E8F9EE',title:'Foto del día',desc:'Jugando con los bloques de colores.',time:'9:15 AM',type:'foto',hasImg:true,photo:null},
     {icon:'🍼',bg:'#FFF4EC',title:'Desayuno',desc:'4 oz de leche, una galleta.',time:'8:45 AM',type:'comida'},
     {icon:'😴',bg:'#F2EEFF',title:'Siesta',desc:'Durmió 45 minutos tranquila.',time:'10:00 AM',type:'sueño',duracion:'45 min'},
   ]},
  {id:1,name:'Mateo',emoji:'🧒',bg:'#EDF4FF',tc:'#185FA5',group:'Caminadores',age:'2 años',present:true,lastMin:-12,photo:null,
   alerts:[],cumpleanos:'3 marzo 2024',medicamentos:'',contactos:[{nombre:'Juan González',relacion:'Papá',telefono:'829-555-0202'}],notas:'',
   fechaIngreso:'10 febrero 2025',historialPagos:['Febrero 2025 - RD$900'],notasPrivadas:'',tl:[
     {icon:'🚪',bg:'#E8F9EE',title:'Entrada',desc:'',time:'8:05 AM',type:'entry'},
     {icon:'🍼',bg:'#FFF4EC',title:'Desayuno',desc:'Comió bien, le gustaron los huevos.',time:'8:50 AM',type:'comida'},
   ]},
  {id:2,name:'Luna',emoji:'👼',bg:'#FFF4EC',tc:'#854F0B',group:'Bebés',age:'8 meses',present:false,lastMin:null,photo:null,
   alerts:[],cumpleanos:'10 julio 2025',medicamentos:'',contactos:[{nombre:'Carmen R.',relacion:'Mamá',telefono:'829-555-0303'}],notas:'Duerme 2 siestas al día.',
   fechaIngreso:'1 marzo 2025',historialPagos:[],notasPrivadas:'Pendiente pago marzo.',tl:[]},
  {id:3,name:'Diego',emoji:'🐣',bg:'#FFFBE8',tc:'#633806',group:'Caminadores',age:'18 meses',present:true,lastMin:-92,photo:null,
   alerts:['Medicamento 10am'],cumpleanos:'22 septiembre 2024',medicamentos:'Amoxicilina 5ml 10am',
   contactos:[{nombre:'Ana Torres',relacion:'Mamá',telefono:'829-555-0404'}],notas:'Está aprendiendo a hablar.',
   fechaIngreso:'15 enero 2025',historialPagos:['Enero 2025 - RD$900','Febrero 2025 - RD$900'],notasPrivadas:'',
   tl:[
     {icon:'🚪',bg:'#E8F9EE',title:'Entrada',desc:'',time:'7:55 AM',type:'entry'},
     {icon:'💊',bg:'#FEF3F2',title:'Medicamento',desc:'Amoxicilina 5ml administrada.',time:'10:00 AM',type:'salud'},
   ]},
];

const DEFAULT_PARENTS: Parent[] = [
  {id:0,name:'María Pérez',hijo:'Sofía',initials:'MP',bg:'#FFF0F0',tc:'#C0354D',msg:'Gracias por la foto 💕',time:'9:20',unread:1},
  {id:1,name:'Juan González',hijo:'Mateo',initials:'JG',bg:'#EDF4FF',tc:'#185FA5',msg:'¿Cómo va hoy?',time:'8:30',unread:0},
  {id:2,name:'Ana Torres',hijo:'Diego',initials:'AT',bg:'#FFFBE8',tc:'#633806',msg:'Le di la medicina antes de salir.',time:'7:50',unread:0},
];

const DEFAULT_EVENTS: CuidoEvent[] = [
  {title:'Día de disfraces',date:'15',desc:'Los niños pueden venir disfrazados.',color:'#AF52DE'},
  {title:'Reunión de padres',date:'22',desc:'Salón principal 5:00 PM.',color:'#007AFF'},
  {title:'Cierre por feriado',date:'28',desc:'No habrá servicio.',color:'#FF3B30'},
];

const DEFAULT_PAYMENTS: PendingPayment[] = [
  {name:'Carmen R.',sub:'Luna · Marzo 2026',amount:'$350',reminded:false},
  {name:'Ana Torres',sub:'Diego · Marzo 2026',amount:'$350',reminded:false},
];

const DEFAULT_SOLICITUDES: Solicitud[] = [
  {name:'Roberto Medina',hijo:'Valentina (2 años)',code:'RS-2891',initials:'RM',bg:'#EDF4FF',tc:'#185FA5'},
];

const DEFAULT_CUIDADORES: Cuidador[] = [
  {id:1,nombre:'Elena Martínez',rol:'Cuidadora principal',emoji:'👩',activo:true,capacidadMax:5},
  {id:2,nombre:'Carlos Romero',rol:'Asistente',emoji:'👨',activo:true,capacidadMax:5},
];

const DEFAULT_AULAS: Aula[] = [
  {id:1,nombre:'Bebés',color:'hsl(0,70%,55%)',emoji:'🍼',categoria:'Bebés'} as any,
  {id:2,nombre:'Caminadores',color:'hsl(25,90%,58%)',emoji:'👟',categoria:'Caminadores'} as any,
  {id:3,nombre:'Pre-escolar',color:'hsl(240,60%,62%)',emoji:'🎒',categoria:'Pre-escolar'} as any,
];

const DEFAULT_CONFIGURACION: ConfiguracionGeneral = {
  notificaciones: true, idioma: 'es',
  notifEntradaSalida: true, notifActividades: true, notifPagos: true,
};

const DEFAULT_CUIDO_INFO: CuidoInfo = {
  nombre:'Cuido Rayito de Sol ☀️',direccion:'',telefono:'',
  horarioApertura:'7:00 AM',horarioCierre:'6:00 PM',capacidadMax:null,emoji:'☀️',
};

const DEFAULT_PAGO_CONFIG: PagoConfig = {
  tarifaMensual:'900',diaCobro:'1',metodo:'efectivo',
};

export const LOG_OPTS = [
  {icon:'🚪',label:'Entrada',bg:'#E8F9EE',type:'entry'},
  {icon:'🔴',label:'Salida', bg:'#FFF0F0',type:'exit'},
  {icon:'🍼',label:'Comida', bg:'#FFF4EC',type:'comida'},
  {icon:'😴',label:'Siesta', bg:'#F2EEFF',type:'sueño'},
  {icon:'📸',label:'Foto',   bg:'#E8F9EE',type:'foto'},
  {icon:'📝',label:'Nota',   bg:'#FFFBE8',type:'nota'},
  {icon:'🎨',label:'Actividad',bg:'#EDF4FF',type:'actividad'},
  {icon:'💊',label:'Salud',  bg:'#FEF3F2',type:'salud'},
  {icon:'🎬',label:'Video',  bg:'#F0EDFF',type:'video'},
  {icon:'📢',label:'Aviso',  bg:'#FFF4EC',type:'aviso'},
];

interface AppState {
  role: 'cuido' | 'parent' | null;
  children: Child[];
  parents: Parent[];
  cuidoEvents: CuidoEvent[];
  pendingPayments: PendingPayment[];
  pendingSolicitudes: Solicitud[];
  chatMessages: Record<number, {from: string; text: string; ts: string}[]>;
  selectedChildId: number | null;
  parentChildId: number | null;
  activeChatParentId: number | null;
  searchQuery: string;
  parentFilter: string;
  parentRange: string;
  // New state
  planActivo: 'basico' | 'pro' | 'premium';
  planLimit: number;
  cuidadores: Cuidador[];
  cuidoInfo: CuidoInfo;
  pagoConfig: PagoConfig;
  cuidoCode: string;
  parentOnboardingStep: number;
  aulas: Aula[];
  aulaAsignaciones: Record<number, number>;
  cuidadorAulaMap: Record<number, number>;
  reportesDiarios: ReporteDiario[];
  configuracion: ConfiguracionGeneral;
  notifications: AppNotification[];
}

interface AppContextType extends AppState {
  setRole: (role: 'cuido' | 'parent' | null) => void;
  setSelectedChildId: (id: number | null) => void;
  setParentChildId: (id: number | null) => void;
  setActiveChatParentId: (id: number | null) => void;
  setSearchQuery: (q: string) => void;
  setParentFilter: (f: string) => void;
  setParentRange: (r: string) => void;
  togglePresence: (childId: number) => void;
  addActivity: (childId: number, item: TimelineItem) => void;
  addEvent: (event: CuidoEvent) => void;
  removeEvent: (index: number) => void;
  sendMessage: (parentId: number, text: string) => void;
  approveSolicitud: (index: number) => void;
  rejectSolicitud: (index: number) => void;
  remindPayment: (index: number) => void;
  logout: () => void;
  // New actions
  setPlan: (plan: 'basico' | 'pro' | 'premium') => void;
  addCuidador: (c: Omit<Cuidador, 'id'>) => void;
  removeCuidador: (id: number) => void;
  updateCuidoInfo: (info: Partial<CuidoInfo>) => void;
  updatePagoConfig: (cfg: Partial<PagoConfig>) => void;
  setParentOnboardingStep: (step: number) => void;
  addChild: (child: Child) => void;
  updateChild: (childId: number, updates: Partial<Child>) => void;
  removeParent: (id: number) => void;
  addAula: (aula: Omit<Aula, 'id'>) => void;
  updateAula: (id: number, updates: Partial<Aula>) => void;
  removeAula: (id: number) => void;
  asignarNinoAula: (childId: number, aulaId: number) => void;
  asignarCuidadorAula: (cuidadorId: number, aulaId: number) => void;
  updateCuidador: (id: number, updates: Partial<Cuidador>) => void;
  addReporteDiario: (r: Omit<ReporteDiario, 'id'>) => void;
  updateReporteDiario: (id: string, updates: Partial<ReporteDiario>) => void;
  updateConfiguracion: (cfg: Partial<ConfiguracionGeneral>) => void;
  addNotification: (n: Omit<AppNotification, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (target: 'admin' | 'parent') => void;
  updateChildAndNotify: (childId: number, updates: Partial<Child>, fields: { field: string; oldValue: string; newValue: string; childName: string }[]) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const PLAN_LIMITS: Record<string, number> = { basico: 15, pro: 30, premium: Infinity };

export function AppProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [role, setRole] = useState<'cuido' | 'parent' | null>(null);
  const [children, setChildren] = useState<Child[]>(DEFAULT_CHILDREN);
  const [parents, setParents] = useState<Parent[]>(DEFAULT_PARENTS);
  const [cuidoEvents, setCuidoEvents] = useState<CuidoEvent[]>(DEFAULT_EVENTS);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>(DEFAULT_PAYMENTS);
  const [pendingSolicitudes, setPendingSolicitudes] = useState<Solicitud[]>(DEFAULT_SOLICITUDES);
  const [chatMessages, setChatMessages] = useState<Record<number, {from: string; text: string; ts: string}[]>>({});
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [parentChildId, setParentChildId] = useState<number | null>(null);
  const [activeChatParentId, setActiveChatParentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [parentFilter, setParentFilter] = useState('todo');
  const [parentRange, setParentRange] = useState('30d');
  const [planActivo, setPlanActivo] = useState<'basico' | 'pro' | 'premium'>('basico');
  const [planLimit, setPlanLimit] = useState(15);
  const [cuidadores, setCuidadores] = useState<Cuidador[]>(DEFAULT_CUIDADORES);
  const [cuidoInfo, setCuidoInfo] = useState<CuidoInfo>(DEFAULT_CUIDO_INFO);
  const [pagoConfig, setPagoConfigState] = useState<PagoConfig>(DEFAULT_PAGO_CONFIG);
  const [cuidoCode] = useState('RS-2891');
  const [parentOnboardingStep, setParentOnboardingStep] = useState(0);
  const [aulas, setAulas] = useState<Aula[]>(DEFAULT_AULAS);
  const [aulaAsignaciones, setAulaAsignaciones] = useState<Record<number, number>>({ 0:1, 2:1, 1:2, 3:2 });
  const [cuidadorAulaMap, setCuidadorAulaMap] = useState<Record<number, number>>({ 1:1, 2:2 });
  const [reportesDiarios, setReportesDiarios] = useState<ReporteDiario[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionGeneral>(DEFAULT_CONFIGURACION);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const now = () => {
    const d = new Date(); let h = d.getHours(); const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  };

  const togglePresence = useCallback((childId: number) => {
    setChildren(prev => prev.map(c => {
      if (c.id !== childId) return c;
      const newPresent = !c.present;
      const newTl = [{icon: newPresent ? '🚪' : '🔴', bg: newPresent ? '#E8F9EE' : '#FFF0F0',
        title: newPresent ? `${c.name} llegó al cuido` : `${c.name} salió del cuido`,
        desc: '', time: now(),
        type: newPresent ? 'entry' : 'exit'},...c.tl];
      return { ...c, present: newPresent, lastMin: newPresent ? 0 : c.lastMin, tl: newTl };
    }));
  }, []);

  const addActivity = useCallback((childId: number, item: TimelineItem) => {
    setChildren(prev => prev.map(c => c.id !== childId ? c : { ...c, tl: [item, ...c.tl], lastMin: 0 }));
  }, []);

  const addEvent = useCallback((event: CuidoEvent) => { setCuidoEvents(prev => [...prev, event]); }, []);
  const removeEvent = useCallback((index: number) => { setCuidoEvents(prev => prev.filter((_, i) => i !== index)); }, []);

  const sendMessage = useCallback((parentId: number, text: string) => {
    setChatMessages(prev => ({ ...prev, [parentId]: [...(prev[parentId] || []), { from: 's', text, ts: now() }] }));
  }, []);

  const approveSolicitud = useCallback((index: number) => {
    setPendingSolicitudes(prev => prev.filter((_, i) => i !== index));
  }, []);
  const rejectSolicitud = useCallback((index: number) => {
    setPendingSolicitudes(prev => prev.filter((_, i) => i !== index));
  }, []);
  const remindPayment = useCallback((index: number) => {
    setPendingPayments(prev => prev.map((p, i) => i === index ? { ...p, reminded: true } : p));
  }, []);

  const logout = useCallback(() => { setRole(null); }, []);

  const setPlan = useCallback((plan: 'basico' | 'pro' | 'premium') => {
    setPlanActivo(plan);
    setPlanLimit(PLAN_LIMITS[plan]);
  }, []);

  const addCuidador = useCallback((c: Omit<Cuidador, 'id'>) => {
    setCuidadores(prev => [...prev, { ...c, id: Date.now() }]);
  }, []);

  const removeCuidador = useCallback((id: number) => {
    setCuidadores(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateCuidoInfo = useCallback((info: Partial<CuidoInfo>) => {
    setCuidoInfo(prev => ({ ...prev, ...info }));
  }, []);

  const updatePagoConfig = useCallback((cfg: Partial<PagoConfig>) => {
    setPagoConfigState(prev => ({ ...prev, ...cfg }));
  }, []);

  const addChild = useCallback((child: Child) => {
    setChildren(prev => [...prev, child]);
  }, []);

  const updateChild = useCallback((childId: number, updates: Partial<Child>) => {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, ...updates } : c));
  }, []);

  const removeParent = useCallback((id: number) => {
    setParents(prev => prev.filter(p => p.id !== id));
  }, []);

  const addAula = useCallback((aula: Omit<Aula, 'id'>) => {
    setAulas(prev => [...prev, { ...aula, id: Date.now() }]);
  }, []);

  const updateAula = useCallback((id: number, updates: Partial<Aula>) => {
    setAulas(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const removeAula = useCallback((id: number) => {
    setAulas(prev => prev.filter(a => a.id !== id));
  }, []);

  const asignarNinoAula = useCallback((childId: number, aulaId: number) => {
    setAulaAsignaciones(prev => ({ ...prev, [childId]: aulaId }));
  }, []);

  const asignarCuidadorAula = useCallback((cuidadorId: number, aulaId: number) => {
    setCuidadorAulaMap(prev => ({ ...prev, [cuidadorId]: aulaId }));
  }, []);

  const updateCuidador = useCallback((id: number, updates: Partial<Cuidador>) => {
    setCuidadores(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const addReporteDiario = useCallback((r: Omit<ReporteDiario, 'id'>) => {
    setReportesDiarios(prev => [...prev, { ...r, id: Date.now().toString() }]);
  }, []);

  const updateReporteDiario = useCallback((id: string, updates: Partial<ReporteDiario>) => {
    setReportesDiarios(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const updateConfiguracion = useCallback((cfg: Partial<ConfiguracionGeneral>) => {
    setConfiguracion(prev => ({ ...prev, ...cfg }));
  }, []);

  const addNotification = useCallback((n: Omit<AppNotification, 'id'>) => {
    setNotifications(prev => [{ ...n, id: Date.now().toString() + Math.random() }, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback((target: 'admin' | 'parent') => {
    setNotifications(prev => prev.map(n => n.target === target ? { ...n, read: true } : n));
  }, []);


  const updateChildAndNotify = useCallback((childId: number, updates: Partial<Child>, fields: { field: string; oldValue: string; newValue: string; childName: string }[]) => {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, ...updates } : c));
    fields.forEach(f => {
      setNotifications(prev => [
        { id: Date.now().toString() + Math.random(), childId, childName: f.childName, field: f.field, oldValue: f.oldValue, newValue: f.newValue, time: 'Ahora mismo', read: false, target: 'admin' as const },
        ...prev,
      ]);
    });
  }, []);

  return (
    <AppContext.Provider value={{
      role, children, parents, cuidoEvents, pendingPayments, pendingSolicitudes,
      chatMessages, selectedChildId, parentChildId, activeChatParentId,
      searchQuery, parentFilter, parentRange,
      planActivo, planLimit, cuidadores, cuidoInfo, pagoConfig, cuidoCode, parentOnboardingStep,
      aulas, aulaAsignaciones, cuidadorAulaMap, reportesDiarios, configuracion, notifications,
      setRole, setSelectedChildId, setParentChildId, setActiveChatParentId,
      setSearchQuery, setParentFilter, setParentRange,
      togglePresence, addActivity, addEvent, removeEvent, sendMessage,
      approveSolicitud, rejectSolicitud, remindPayment, logout,
      setPlan, addCuidador, removeCuidador, updateCuidoInfo, updatePagoConfig,
      setParentOnboardingStep, addChild, updateChild, removeParent,
      addAula, updateAula, removeAula, asignarNinoAula, asignarCuidadorAula,
      updateCuidador, addReporteDiario, updateReporteDiario, updateConfiguracion,
      addNotification, markNotificationRead, markAllNotificationsRead, updateChildAndNotify,
    }}>
      {reactChildren}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
