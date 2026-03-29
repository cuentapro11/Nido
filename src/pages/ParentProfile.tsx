import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, Child, ChildDocument } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import ChildAvatar from '@/components/ChildAvatar';
import { Plus, Trash2, Upload, FileText, Image as ImageIcon, X } from 'lucide-react';

// ─── Editable row ──────────────────────────────────────────────────────────
function EditRow({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const save = () => { onChange(draft); setEditing(false); };

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
      <span className="text-base font-semibold text-foreground min-w-[120px]">{label}</span>
      {editing ? (
        <input ref={inputRef} type={type} value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={save} onKeyDown={e => e.key === 'Enter' && save()}
          autoFocus
          className="flex-1 text-right text-base text-foreground bg-secondary border-b-2 border-primary outline-none px-2 py-0.5" />
      ) : (
        <button onClick={() => { setDraft(value); setEditing(true); }}
          className="flex-1 text-right text-base text-muted-foreground active:opacity-60">
          {value || <span className="text-muted-foreground/40">{placeholder || 'Añadir'}</span>}
        </button>
      )}
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────
function SectionHeader({ title, onAdd }: { title: string; onAdd?: () => void }) {
  return (
    <div className="bg-muted px-4 py-2.5 flex items-center justify-between">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{title}</span>
      {onAdd && (
        <button onClick={onAdd} className="text-primary active:scale-95 transition-transform">
          <Plus size={18} />
        </button>
      )}
    </div>
  );
}

export default function ParentProfile() {
  const navigate = useNavigate();
  const { children, parentChildId, updateChild, addNotification } = useApp();
  const { show } = useToast();
  const child = children.find(c => c.id === parentChildId);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ nombre: '', relacion: '', telefono: '' });

  if (!child) return null;

  const FIELD_LABELS: Record<string, string> = {
    cumpleanos: 'Cumpleaños', notas: 'Notas', medicamentos: 'Medicamentos',
    alerts: 'Alergias', medicoNombre: 'Médico', medicoTelefono: 'Tel. Médico',
    direccion1: 'Dirección', ciudad: 'Ciudad',
  };

  const upd = (field: keyof Child, label?: string) => (val: string) => {
    const oldVal = String((child as any)[field] ?? '');
    updateChild(child.id, { [field]: val });
    if (val !== oldVal) {
      addNotification({
        childId: child.id,
        childName: child.name,
        field: label ?? FIELD_LABELS[field] ?? String(field),
        oldValue: oldVal,
        newValue: val,
        time: 'Ahora mismo',
        read: false,
        target: 'admin',
      });
    }
  };

  const handleSave = () => show('✓ Perfil guardado');

  // Contacts
  const addContact = () => {
    if (!newContact.nombre) return;
    updateChild(child.id, { contactos: [...child.contactos, newContact] });
    setNewContact({ nombre: '', relacion: '', telefono: '' });
    setShowAddContact(false);
    show('✓ Contacto añadido');
  };
  const removeContact = (i: number) => {
    updateChild(child.id, { contactos: child.contactos.filter((_, idx) => idx !== i) });
  };

  // Documents
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const doc: ChildDocument = {
        id: Date.now().toString(),
        nombre: file.name,
        tipo: file.type.includes('image') ? 'imagen' : 'pdf',
        url: reader.result as string,
        uploadedAt: new Date().toLocaleDateString('es-DO'),
      };
      updateChild(child.id, { documentos: [...(child.documentos || []), doc] });
      show('✓ Documento subido');
    };
    reader.readAsDataURL(file);
  };
  const removeDoc = (id: string) => {
    updateChild(child.id, { documentos: (child.documentos || []).filter(d => d.id !== id) });
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="bg-primary px-4 py-3.5 flex items-center justify-between flex-shrink-0">
        <button onClick={() => navigate(-1)} className="text-primary-foreground">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14 5L8 11l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-lg font-bold text-primary-foreground">Perfil de {child.name}</span>
        <button onClick={handleSave} className="text-sm font-bold text-primary-foreground">Guardar</button>
      </div>

      {/* Photo — tap to upload/change/remove */}
      <div className="bg-muted h-52 flex flex-col items-center justify-center gap-3">
        <button onClick={() => photoRef.current?.click()}
          className="relative active:scale-95 transition-transform">
          {child.photo ? (
            <img src={child.photo} alt={child.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-soft" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-background border-4 border-white shadow-soft flex flex-col items-center justify-center gap-1">
              <span className="text-3xl">📷</span>
              <span className="text-xs text-muted-foreground font-bold">Subir foto</span>
            </div>
          )}
          {/* Camera badge */}
          <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-soft border-2 border-white">
            <span className="text-white text-sm">📷</span>
          </div>
        </button>
        {child.photo && (
          <button onClick={() => updateChild(child.id, { photo: null })}
            className="text-xs font-bold text-destructive active:opacity-60">
            Eliminar foto
          </button>
        )}
        <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              updateChild(child.id, { photo: reader.result as string });
              show('✓ Foto actualizada');
            };
            reader.readAsDataURL(file);
          }} />
      </div>

      {/* ── DATOS BÁSICOS ─────────────────────────────────────────── */}
      <div className="bg-card mt-0">
        <EditRow label="Nombre" value={child.name.split(' ')[0]} onChange={v => updateChild(child.id, { name: v + ' ' + (child.apellido || '') })} placeholder="Nombre de pila" />
        <EditRow label="Apellido" value={child.apellido || ''} onChange={upd('apellido')} placeholder="Apellido" />
        <EditRow label="Cumpleaños" value={child.cumpleanos} onChange={upd('cumpleanos')} placeholder="ej: 15 enero 2023" type="text" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-base font-semibold text-foreground">Estado</span>
          <select value={child.estado || 'Activo'}
            onChange={e => updateChild(child.id, { estado: e.target.value })}
            className="text-base text-muted-foreground bg-transparent outline-none text-right">
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </div>
      </div>

      <div className="h-3 bg-muted" />

      {/* ── INFORMACIÓN ───────────────────────────────────────────── */}
      <SectionHeader title="Información" />
      <div className="bg-card">
        <EditRow label="Notas" value={child.notas} onChange={upd('notas', 'Notas')} placeholder="Añadir nota" />
        <EditRow label="Alergias" value={child.alerts.join(', ')} onChange={v => {
          const oldVal = child.alerts.join(', ');
          const newAlerts = v ? v.split(',').map(s => s.trim()) : [];
          updateChild(child.id, { alerts: newAlerts });
          if (v !== oldVal) addNotification({ childId: child.id, childName: child.name, field: 'Alergias', oldValue: oldVal, newValue: v, time: 'Ahora mismo', read: false, target: 'admin' });
        }} placeholder="Añadir alergias" />
        <EditRow label="Medicamento" value={child.medicamentos} onChange={upd('medicamentos', 'Medicamentos')} placeholder="Añadir medicamento" />
      </div>

      <div className="h-3 bg-muted" />

      {/* ── AULAS ─────────────────────────────────────────────────── */}
      <SectionHeader title="Aulas" />
      <div className="bg-card">
        <EditRow label="Aula Principal" value={child.aulaPrincipal || ''} onChange={upd('aulaPrincipal')} placeholder="Sin aula asignada" />
        <EditRow label="Otros" value={child.aulaOtros || ''} onChange={upd('aulaOtros')} placeholder="Añadir" />
      </div>

      <div className="h-3 bg-muted" />

      {/* ── CONTACTOS ─────────────────────────────────────────────── */}
      <SectionHeader title="Contactos" onAdd={() => setShowAddContact(true)} />
      <div className="bg-card">
        {child.contactos.map((ct, i) => (
          <div key={i} className="flex items-center px-4 py-3.5 border-b border-border gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{ct.nombre}</p>
              <p className="text-xs text-muted-foreground">{ct.relacion} · {ct.telefono}</p>
            </div>
            <button onClick={() => removeContact(i)}
              className="w-7 h-7 bg-destructive/10 rounded-full flex items-center justify-center active:scale-95">
              <Trash2 size={13} className="text-destructive" />
            </button>
          </div>
        ))}
        <button onClick={() => setShowAddContact(true)}
          className="w-full flex items-center gap-2 px-4 py-3.5 text-primary active:opacity-60">
          <Plus size={16} /> <span className="text-sm font-semibold">Añadir contacto</span>
        </button>
      </div>

      {/* Add contact form */}
      {showAddContact && (
        <div className="bg-card border-t-2 border-primary px-4 py-4 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-foreground">Nuevo contacto</p>
            <button onClick={() => setShowAddContact(false)}><X size={18} className="text-muted-foreground" /></button>
          </div>
          {['nombre', 'relacion', 'telefono'].map(field => (
            <input key={field} placeholder={field === 'nombre' ? 'Nombre' : field === 'relacion' ? 'Relación (Mamá, Papá...)' : 'Teléfono'}
              value={newContact[field as keyof typeof newContact]}
              onChange={e => setNewContact(p => ({ ...p, [field]: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary" />
          ))}
          <button onClick={addContact}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm active:scale-[0.98]">
            Guardar contacto
          </button>
        </div>
      )}

      <div className="h-3 bg-muted" />

      {/* ── INFORMACIÓN DEL MÉDICO ────────────────────────────────── */}
      <SectionHeader title="Información del médico" />
      <div className="bg-card">
        <EditRow label="Nombre del médico" value={child.medicoNombre || ''} onChange={upd('medicoNombre')} placeholder="Añadir" />
        <EditRow label="Teléfono del médico" value={child.medicoTelefono || ''} onChange={upd('medicoTelefono')} placeholder="Añadir" />
      </div>

      <div className="h-3 bg-muted" />

      {/* ── DIRECCIÓN ─────────────────────────────────────────────── */}
      <SectionHeader title="Dirección" />
      <div className="bg-card">
        <EditRow label="Dirección 1" value={child.direccion1 || ''} onChange={upd('direccion1')} placeholder="Dirección Línea 1" />
        <EditRow label="Dirección 2" value={child.direccion2 || ''} onChange={upd('direccion2')} placeholder="Línea de dirección 2" />
        <EditRow label="Ciudad" value={child.ciudad || ''} onChange={upd('ciudad')} placeholder="Ciudad" />
        <EditRow label="Código postal" value={child.codigoPostal || ''} onChange={upd('codigoPostal')} placeholder="Código postal" />
        <EditRow label="País" value={child.pais || ''} onChange={upd('pais')} placeholder="País" />
        <EditRow label="Estado / territorio" value={child.estadoTerritorio || ''} onChange={upd('estadoTerritorio')} placeholder="Estado / territorio" />
      </div>

      <div className="h-3 bg-muted" />

      {/* ── DOCUMENTOS ────────────────────────────────────────────── */}
      <SectionHeader title="Documentos" />
      <div className="bg-card">
        {(child.documentos || []).map(doc => (
          <div key={doc.id} className="flex items-center px-4 py-3.5 border-b border-border gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              {doc.tipo === 'imagen' ? <ImageIcon size={18} className="text-primary" /> : <FileText size={18} className="text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{doc.nombre}</p>
              <p className="text-xs text-muted-foreground">{doc.uploadedAt}</p>
            </div>
            <button onClick={() => removeDoc(doc.id)}
              className="w-7 h-7 bg-destructive/10 rounded-full flex items-center justify-center active:scale-95 flex-shrink-0">
              <Trash2 size={13} className="text-destructive" />
            </button>
          </div>
        ))}
        <button onClick={() => fileRef.current?.click()}
          className="w-full flex items-center gap-2 px-4 py-3.5 text-primary active:opacity-60">
          <Upload size={16} /> <span className="text-sm font-semibold">Subir documento o foto</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
      </div>

    </div>
  );
}
