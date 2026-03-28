import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useSupabase } from '@/contexts/SupabaseContext';
import ChildAvatar from '@/components/ChildAvatar';
import ActivityModal from '@/components/ActivityModal';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Palette, Download, Info, Heart, FileText, ArrowLeft, CreditCard, Lock, User, Pill, Users, ImageIcon, Calendar, ListFilter, ChevronDown, Image, MessageSquare, X } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import ActivityIcon from '@/components/ActivityIcon';

export default function ChildProfile() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { children, role, updateChild, addNotification, aulas, aulaAsignaciones } = useApp();
  const [showFab, setShowFab] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showExpediente, setShowExpediente] = useState(false);
  const { profile } = useSupabase();

  const isAdmin = profile?.role === 'admin';
  const isCuido = role === 'cuido';
  const canLogActivity = isAdmin || isCuido;
  const isParent = role === 'parent';
  const [likedItems, setLikedItems] = useState({});

  // Full-screen image viewer
  const [fullScreenImg, setFullScreenImg] = useState(null);

  // Filtros
  const [dayFilter, setDayFilter] = useState('Últimos 30 días');
  const [showDayDrop, setShowDayDrop] = useState(false);
  const [typeFilter, setTypeFilter] = useState('todo');
  const [showTypeDrop, setShowTypeDrop] = useState(false);

  const cid = Number(childId);
  const child = children.find(c => c.id === cid);
  if (!child) return null;

  const smartDateLabel = () => {
    const now = new Date();
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return days[now.getDay()] + ', ' + now.getDate() + ' ' + months[now.getMonth()];
  };

  const filteredTl = child.tl.filter(item => typeFilter === 'todo' || item.type === typeFilter);

  const InfoField = ({ label, value, field }: { label: string; value: string; field: string }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const canEdit = isParent;
    const save = () => {
      const oldValue = value;
      const newValue = draft;
      if (oldValue === newValue) { setEditing(false); return; }
      if (field === 'alerts') {
        updateChild(child.id, { alerts: draft ? draft.split(',').map(s => s.trim()) : [] });
      } else {
        updateChild(child.id, { [field]: draft });
      }
      // Notify admin when parent edits
      if (isParent) {
        addNotification({
          childId: child.id,
          childName: child.name,
          field: label,
          oldValue,
          newValue,
          time: 'Ahora mismo',
          read: false,
          target: 'admin',
        });
      }
      setEditing(false);
    };
    return (
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0">
        <span className="text-sm font-semibold text-foreground min-w-[110px]">{label}</span>
        {canEdit ? (
          editing ? (
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={e => e.key === 'Enter' && save()}
              autoFocus
              className="flex-1 text-right text-sm text-foreground bg-secondary border-b-2 border-primary outline-none px-2 py-0.5 ml-3"
            />
          ) : (
            <button onClick={() => { setDraft(field === 'alerts' ? child.alerts.join(', ') : value); setEditing(true); }}
              className="flex-1 text-right text-sm text-muted-foreground active:opacity-60 ml-3">
              {value || <span className="text-muted-foreground/40">Añadir</span>}
            </button>
          )
        ) : (
          <span className="flex-1 text-right text-sm text-muted-foreground ml-3">
            {value || <span className="text-muted-foreground/40">—</span>}
          </span>
        )}
      </div>
    );
  };

  const actions = [
    ...(canLogActivity ? [{ icon: <Palette size={19} className="text-white" />, label: 'Actividad', fn: () => setShowFab(true), gradient: 'from-[#1E3A8A] to-[#2563EB]' }] : []),
    { icon: <Phone size={19} className="text-white" />, label: 'Llamar', fn: () => setShowPhone(true), gradient: 'from-[#1E3A8A] to-[#2563EB]' },
    { icon: <Info size={19} className="text-white" />, label: 'Información', fn: () => setShowInfo(true), gradient: 'from-[#2563EB] to-[#1E3A8A]' },
  ];

  // ── Helper: section title (matches ParentProfile SectionHeader) ──
  const SectionTitle = ({ label }: { label: string }) => (
    <div className="bg-muted px-4 py-2.5 flex items-center justify-between">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
  );

  const ExpedienteScreen = () => {
    // Read-only row — same visual as ParentProfile EditRow but no edit
    const ReadRow = ({ label, value, placeholder = 'Sin datos' }: { label: string; value: string; placeholder?: string }) => (
      <div className="flex items-center justify-between px-5 py-4 border-b border-border last:border-0">
        <span className="text-base font-semibold text-foreground min-w-[120px]">{label}</span>
        <span className="flex-1 text-right text-base text-muted-foreground ml-3">
          {value || <span className="text-muted-foreground/40">{placeholder}</span>}
        </span>
      </div>
    );

    return (
      <AnimatePresence>
        {showExpediente && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto pb-10"
          >
            {/* Header — mirrors ParentProfile header */}
            <div className="bg-primary px-4 py-3.5 flex items-center justify-between flex-shrink-0">
              <button onClick={() => setShowExpediente(false)} className="text-primary-foreground">
                <ArrowLeft size={22} />
              </button>
              <span className="text-lg font-bold text-primary-foreground">Perfil de {child.name}</span>
              <span className="text-[10px] font-bold bg-primary-foreground/20 text-primary-foreground px-2.5 py-1 rounded-full">Admin</span>
            </div>

            {/* Photo — same layout as ParentProfile */}
            <div className="bg-muted h-52 flex flex-col items-center justify-center gap-3">
              {child.photo ? (
                <img src={child.photo} alt={child.name}
                  className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-soft" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-background border-4 border-white shadow-soft flex flex-col items-center justify-center gap-1">
                  <ChildAvatar child={child} size={112} />
                </div>
              )}
              <p className="text-sm font-bold text-foreground">{child.name}</p>
              <p className="text-xs text-muted-foreground">{child.age} · {child.group}</p>
            </div>

            {/* ── DATOS BÁSICOS — igual que ParentProfile ── */}
            <div className="bg-card mt-0">
              <ReadRow label="Nombre" value={child.name.split(' ')[0]} />
              <ReadRow label="Apellido" value={child.apellido || ''} />
              <ReadRow label="Cumpleaños" value={child.cumpleanos} />
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <span className="text-base font-semibold text-foreground">Estado</span>
                <span className="text-base text-muted-foreground">{child.estado || 'Activo'}</span>
              </div>
            </div>

            <div className="h-3 bg-muted" />

            {/* ── INFORMACIÓN ── */}
            <SectionTitle label="Información" />
            <div className="bg-card">
              <ReadRow label="Notas" value={child.notas} />
              <ReadRow label="Alergias" value={child.alerts.join(', ')} />
              <ReadRow label="Medicamento" value={child.medicamentos} />
            </div>

            <div className="h-3 bg-muted" />

            {/* ── AULAS ── */}
            <SectionTitle label="Aulas" />
            <div className="bg-card">
              <ReadRow label="Aula Principal" value={child.aulaPrincipal || ''} />
              <ReadRow label="Otros" value={child.aulaOtros || ''} />
            </div>

            <div className="h-3 bg-muted" />

            {/* ── CONTACTOS ── */}
            <SectionTitle label="Contactos" />
            <div className="bg-card">
              {child.contactos.length === 0 ? (
                <p className="px-5 py-4 text-base text-muted-foreground/40">Sin contactos registrados</p>
              ) : (
                child.contactos.map((ct, i) => (
                  <div key={i} className="flex items-center px-4 py-3.5 border-b border-border gap-3 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{ct.nombre}</p>
                      <p className="text-xs text-muted-foreground">{ct.relacion} · {ct.telefono}</p>
                    </div>
                    <a href={`tel:${ct.telefono}`}
                      className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold">
                      Llamar
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="h-3 bg-muted" />

            {/* ── INFORMACIÓN DEL MÉDICO ── */}
            <SectionTitle label="Información del médico" />
            <div className="bg-card">
              <ReadRow label="Nombre del médico" value={child.medicoNombre || ''} />
              <ReadRow label="Teléfono del médico" value={child.medicoTelefono || ''} />
            </div>

            <div className="h-3 bg-muted" />

            {/* ── DIRECCIÓN ── */}
            <SectionTitle label="Dirección" />
            <div className="bg-card">
              <ReadRow label="Dirección 1" value={child.direccion1 || ''} />
              <ReadRow label="Dirección 2" value={child.direccion2 || ''} />
              <ReadRow label="Ciudad" value={child.ciudad || ''} />
              <ReadRow label="Código postal" value={child.codigoPostal || ''} />
              <ReadRow label="País" value={child.pais || ''} />
              <ReadRow label="Estado / territorio" value={child.estadoTerritorio || ''} />
            </div>

            <div className="h-3 bg-muted" />

            {/* ── DOCUMENTOS ── */}
            <SectionTitle label="Documentos" />
            <div className="bg-card">
              {(child.documentos || []).length === 0 ? (
                <p className="px-5 py-4 text-base text-muted-foreground/40">Sin documentos</p>
              ) : (
                (child.documentos || []).map(doc => (
                  <div key={doc.id} className="flex items-center px-4 py-3.5 border-b border-border gap-3 last:border-0">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      {doc.tipo === 'imagen'
                        ? <ImageIcon size={18} className="text-primary" />
                        : <FileText size={18} className="text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{doc.nombre}</p>
                      <p className="text-xs text-muted-foreground">{doc.uploadedAt}</p>
                    </div>
                    <a href={doc.url} target="_blank" rel="noreferrer"
                      className="text-xs font-bold text-primary">Ver</a>
                  </div>
                ))
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  return (
    <div className="min-h-screen bg-background pb-6">

      {/* ── VISOR DE IMAGEN FULL SCREEN ── */}
      <AnimatePresence>
        {fullScreenImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setFullScreenImg(null)}
          >
            <button className="absolute top-12 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white">
              <X size={24} />
            </button>
            <img src={fullScreenImg} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Navegación */}
      <div className="flex items-center justify-between px-4 pt-8 pb-3 border-b border-border bg-card">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center active:scale-90 transition-transform">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${child.present ? 'bg-success' : 'bg-destructive'}`} />
          <span className="text-base font-bold text-foreground">{child.name}</span>
        </div>
        {isAdmin ? (
          <button onClick={() => setShowExpediente(true)} className="text-sm font-bold text-primary active:opacity-70">Expediente</button>
        ) : <div className="w-16" />}
      </div>

      {/* Perfil Niño — menos espacio vertical */}
      <div className="flex flex-col items-center pt-3 pb-2 bg-card">
        <ChildAvatar child={child} size={88} className="border-[3px] border-border shadow-soft" />
        <p className="text-xs text-muted-foreground mt-1.5">{child.age} · {child.group}</p>
      </div>

      {/* Acciones Rápidas */}
      <div className="flex border-b border-border bg-card py-2.5 px-2">
        {actions.map(a => (
          <button key={a.label} onClick={a.fn} className="flex-1 flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shadow-soft`}>{a.icon}</div>
            <span className="text-[10px] font-bold text-muted-foreground leading-tight text-center">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Filtros de Timeline */}
      <div className="bg-background">
        <div className="flex gap-2.5 px-4 py-3">
          <div className="relative flex-1">
            <button onClick={() => { setShowDayDrop(!showDayDrop); setShowTypeDrop(false); }}
              className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-3 py-2.5 text-xs font-semibold shadow-soft">
              <span className="flex items-center gap-1.5 truncate"><Calendar size={13} className="text-primary" />{dayFilter}</span>
              <ChevronDown size={13} className={showDayDrop ? 'rotate-180' : ''} />
            </button>
            {showDayDrop && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-30 overflow-hidden">
                {['Hoy', 'Últimos 7 días', 'Últimos 30 días', 'Todo'].map(d => (
                  <button key={d} onClick={() => { setDayFilter(d); setShowDayDrop(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs ${dayFilter === d ? 'bg-primary/10 text-primary' : ''}`}>{d}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex-1">
            <button onClick={() => { setShowTypeDrop(!showTypeDrop); setShowDayDrop(false); }}
              className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-3 py-2.5 text-xs font-semibold shadow-soft">
              <span className="flex items-center gap-1.5 truncate"><ListFilter size={13} className="text-primary" />{typeFilter === 'todo' ? 'Todo' : typeFilter}</span>
              <ChevronDown size={13} className={showTypeDrop ? 'rotate-180' : ''} />
            </button>
            {showTypeDrop && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-30 overflow-hidden">
                {['todo', 'foto', 'nota', 'comida', 'sueño', 'actividad', 'salud'].map(f => (
                  <button key={f} onClick={() => { setTypeFilter(f); setShowTypeDrop(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs ${typeFilter === f ? 'bg-primary/10 text-primary' : ''}`}>{f}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 pb-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase">{smartDateLabel()}</span>
        </div>

        {/* FEED DE ACTIVIDADES */}
        <div className="px-3.5 pb-8">
          {filteredTl.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              {i > 0 && (
                <div className="flex items-center gap-2 my-2 px-1">
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
            <div className="bg-card rounded-2xl overflow-hidden shadow-card">

              {item.hasImg ? (
                /* --- TARJETA FOTO --- */
                <div className="flex items-stretch">
                  <div className="w-[72px] flex flex-col items-center py-4 flex-shrink-0 border-r border-border/50">
                    <div className="w-11 h-11 flex items-center justify-center mb-3">
                      <ActivityIcon type={item.type} size={44} iconSize={18} />
                    </div>
                    <div className="flex flex-col gap-4">
                      <button onClick={() => setLikedItems(prev => ({ ...prev, [i]: !prev[i] }))}
                        className="w-9 h-9 flex items-center justify-center active:scale-90 transition-transform">
                        <Heart size={20} className={likedItems[i] ? 'text-destructive fill-destructive' : 'text-muted-foreground/70'} strokeWidth={1.5} />
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center active:scale-90 transition-transform">
                        <Download size={20} className="text-muted-foreground/70" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                  <div onClick={() => setFullScreenImg(item.photo)} className="flex-1 aspect-square bg-muted cursor-pointer active:opacity-90 transition-opacity">
                    <img src={item.photo} alt="Activity" className="w-full h-full object-cover" />
                  </div>
                </div>
              ) : (
                /* --- TARJETA NORMAL --- */
                <div className="flex items-center gap-3.5 px-4 py-4">
                  <div className="flex-shrink-0">
                    <ActivityIcon type={item.type} size={48} iconSize={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-gray-900 leading-tight">{item.title}</p>
                    {item.desc && (
                      <p className="text-[13px] text-gray-500 mt-0.5 leading-snug line-clamp-2">{item.desc}</p>
                    )}
                    <p className="text-[12px] text-gray-400 mt-1 font-medium">{item.time}</p>
                  </div>
                  <button
                    onClick={() => setLikedItems(prev => ({ ...prev, [i]: !prev[i] }))}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center active:scale-90 transition-transform">
                    <Heart size={20} className={likedItems[i] ? 'text-destructive fill-destructive' : 'text-muted-foreground/60'} strokeWidth={1.5} />
                  </button>
                </div>
              )}

              {/* Descripción debajo en tarjeta foto */}
              {item.hasImg && (
                <div className="px-4 py-3 border-t border-border/50">
                  <p className="text-[12px] text-gray-400 font-medium mb-1">{item.time}</p>
                  {item.desc && <p className="text-[13px] text-gray-600 leading-relaxed">{item.desc}</p>}
                </div>
              )}
            </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modales Inferiores */}
      <BottomSheet open={showPhone} onClose={() => setShowPhone(false)}>
        <div className="p-4"><h3 className="text-lg font-extrabold mb-4 text-foreground">Contactos de {child.name}</h3>
        {child.contactos.map((ct, i) => (
          <div key={i} className="flex items-center gap-3 mb-2 bg-muted p-3.5 rounded-xl">
            <div className="flex-1"><p className="text-sm font-bold">{ct.nombre}</p><p className="text-xs text-muted-foreground">{ct.relacion} · {ct.telefono}</p></div>
            <a href={`tel:${ct.telefono}`} className="bg-success text-white px-4 py-2 rounded-full text-xs font-bold shadow-soft">Llamar</a>
          </div>
        ))}</div>
      </BottomSheet>

      <BottomSheet open={showInfo} onClose={() => setShowInfo(false)}>
        <div className="p-4 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-white"><Info size={20}/></div>
          <h3 className="text-lg font-extrabold">Información</h3>
        </div>
        <div className="px-4 mb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Datos generales</p>
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <InfoField label="Nombre" value={child.name} field="name" />
            <InfoField label="Edad" value={child.age} field="age" />
            <InfoField label="Grupo" value={child.group} field="group" />
            <InfoField label="Cumpleaños" value={child.cumpleanos || ''} field="cumpleanos" />
          </div>
        </div>
        <div className="px-4 mb-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Salud</p>
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <InfoField label="Alergias" value={child.alerts.join(', ')} field="alerts" />
            <InfoField label="Medicamentos" value={child.medicamentos || ''} field="medicamentos" />
            <InfoField label="Notas" value={child.notas || ''} field="notas" />
          </div>
        </div>
        {child.contactos.length > 0 && (
          <div className="px-4 mb-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Contactos de emergencia</p>
            <div className="space-y-2">
              {child.contactos.map((ct, i) => (
                <div key={i} className="bg-card rounded-2xl px-4 py-3 shadow-card flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{ct.nombre}</p>
                    <p className="text-xs text-muted-foreground">{ct.relacion} · {ct.telefono}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="h-6" />
      </BottomSheet>

      <ActivityModal open={showFab} onClose={() => setShowFab(false)} preselectedChildId={cid} />
      <ExpedienteScreen />
    </div>
  );
}
