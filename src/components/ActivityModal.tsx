import { useState, useRef } from 'react';
import { useApp, LOG_OPTS } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import BottomSheet from '@/components/BottomSheet';
import ChildAvatar from '@/components/ChildAvatar';
import { Search } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  preselectedChildId?: number;
}

export default function ActivityModal({ open, onClose, preselectedChildId }: Props) {
  const { children, addActivity, togglePresence } = useApp();
  const { show } = useToast();
  const [step, setStep] = useState<'pick' | 'child' | 'confirm'>('pick');
  const [selectedOpt, setSelectedOpt] = useState<typeof LOG_OPTS[0] | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(preselectedChildId ?? null);
  const [nota, setNota] = useState('');
  const [search, setSearch] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const now = () => {
    const d = new Date();
    let h = d.getHours(); const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  };

  const reset = () => {
    setStep('pick');
    setSelectedOpt(null);
    setSelectedChildId(preselectedChildId ?? null);
    setNota('');
    setSearch('');
    setCapturedPhoto(null);
    onClose();
  };

  const handlePickOpt = (opt: typeof LOG_OPTS[0]) => {
    setSelectedOpt(opt);
    if (preselectedChildId != null) {
      setSelectedChildId(preselectedChildId);
      if (opt.type === 'foto') {
        setStep('confirm');
        // Abrir cámara en confirm
        setTimeout(() => cameraRef.current?.click(), 100);
      } else {
        setStep('confirm');
      }
    } else {
      setStep('child');
    }
  };

  const handleConfirm = () => {
    if (selectedChildId == null || !selectedOpt) return;
    const ch = children.find(c => c.id === selectedChildId);
    if (!ch) return;

    // Entrada / Salida — usa togglePresence para mantener consistencia
    if (selectedOpt.type === 'entry' || selectedOpt.type === 'exit') {
      const isEntry = selectedOpt.type === 'entry';
      // Solo registrar si el estado cambia
      if (isEntry && ch.present) { show(`⚠️ ${ch.name} ya está presente`); reset(); return; }
      if (!isEntry && !ch.present) { show(`⚠️ ${ch.name} ya registró salida`); reset(); return; }
      togglePresence(selectedChildId);
      show(`✓ ${isEntry ? ch.name + ' llegó al cuido' : ch.name + ' salió del cuido'}`);
      reset();
      return;
    }

    // Lógica siesta: primera vez = "comenzó", segunda = "terminó", alterna
    let title = selectedOpt.label;
    if (selectedOpt.type === 'sueño') {
      const siestasHoy = ch.tl.filter(item => item.type === 'sueño').length;
      const esComenzo = siestasHoy % 2 === 0;
      title = `${ch.name} ${esComenzo ? 'comenzó' : 'terminó'} la siesta`;
    }

    addActivity(selectedChildId, {
      icon: selectedOpt.icon,
      bg: selectedOpt.bg,
      title,
      desc: nota || 'Registrado.',
      time: now(),
      type: selectedOpt.type,
      hasImg: selectedOpt.type === 'foto' && !!capturedPhoto,
      photo: capturedPhoto || undefined,
    });
    show('✓ ' + title + ' registrado');
    reset();
  };

  const presentes = children.filter(c => c.present);
  const q = search.trim().toLowerCase();
  const filtered = q ? presentes.filter(c => c.name.toLowerCase().includes(q)) : presentes;

  return (
    <BottomSheet open={open} onClose={reset}>
      {/* Hidden camera input */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => setCapturedPhoto(reader.result as string);
          reader.readAsDataURL(file);
        }}
      />
      {step === 'pick' && (
        <>
          <h3 className="text-lg font-extrabold text-foreground mb-1">Registrar actividad</h3>
          <p className="text-xs text-muted-foreground mb-4">Toca para seleccionar y continuar</p>
          <div className="grid grid-cols-4 gap-2.5">
            {LOG_OPTS.map(opt => (
              <button
                key={opt.type}
                onClick={() => handlePickOpt(opt)}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 active:scale-95 transition-transform aspect-square"
                style={{ background: opt.bg, borderColor: opt.bg }}
              >
                <span className="text-2xl leading-none">{opt.icon}</span>
                <span className="text-[10px] font-bold text-foreground leading-tight text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 'child' && selectedOpt && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: selectedOpt.bg }}>
              {selectedOpt.icon}
            </div>
            <span className="text-base font-bold text-foreground">{selectedOpt.label} — ¿para quién?</span>
          </div>
          <button
            onClick={() => { setStep('pick'); setSelectedOpt(null); }}
            className="text-xs font-semibold text-primary bg-secondary rounded-full px-3 py-1.5 mb-3"
          >
            ‹ Cambiar actividad
          </button>
          <div className="flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-2.5 mb-3">
            <Search size={15} className="text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="bg-transparent outline-none text-sm text-foreground flex-1"
            />
          </div>
          <div className="space-y-2">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChildId(c.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChildId === c.id ? 'border-2 border-primary bg-secondary' : 'border border-border bg-muted/50'}`}
              >
                <ChildAvatar child={c} size={40} />
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-foreground">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">{c.age}</div>
                </div>
                {selectedChildId === c.id && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[11px] text-primary-foreground">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          {selectedOpt.type === 'nota' && (
            <textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Escribe la nota aquí..."
              className="w-full mt-3 bg-muted border border-border rounded-xl p-3 text-sm text-foreground outline-none resize-none h-20 focus:border-primary"
            />
          )}
          <button
            onClick={() => {
              if (selectedChildId == null) { show('Selecciona un niño'); return; }
              setStep('confirm');
              if (selectedOpt?.type === 'foto') {
                setTimeout(() => cameraRef.current?.click(), 100);
              }
            }}
            className="w-full mt-4 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-card active:scale-[0.98] transition-transform"
          >
            Siguiente →
          </button>
        </>
      )}

      {step === 'confirm' && selectedOpt && selectedChildId != null && (
        <>
          {(() => {
            const ch = children.find(c => c.id === selectedChildId);
            if (!ch) return null;
            return (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px]" style={{ background: selectedOpt.bg }}>
                    {selectedOpt.icon}
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-foreground">{selectedOpt.label}</div>
                    <div className="text-xs font-semibold text-primary">{ch.name}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-y border-border mb-4">
                  <span className="text-sm font-bold text-foreground">Tiempo:</span>
                  <span className="text-sm font-semibold text-primary">Hoy a las {now()}</span>
                </div>
                {/* Preview foto capturada */}
                {selectedOpt.type === 'foto' && (
                  <div className="mb-4">
                    {capturedPhoto ? (
                      <div className="relative rounded-xl overflow-hidden h-40">
                        <img src={capturedPhoto} alt="Foto" className="w-full h-full object-cover" />
                        <button
                          onClick={() => cameraRef.current?.click()}
                          className="absolute bottom-2 right-2 bg-card/80 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-bold text-foreground"
                        >
                          📷 Cambiar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => cameraRef.current?.click()}
                        className="w-full h-28 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground active:scale-[0.98] transition-transform"
                      >
                        <span className="text-2xl">📷</span>
                        <span className="text-xs font-semibold">Tomar foto</span>
                      </button>
                    )}
                  </div>
                )}
                {/* Nota — para todos los tipos incluyendo foto */}
                <label className="text-sm font-bold text-foreground mb-2 block">Nota</label>
                <textarea
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  placeholder="Nota opcional..."
                  className="w-full bg-muted border border-border rounded-xl p-3 text-sm text-foreground outline-none resize-none h-20 focus:border-primary mb-4"
                />
                <button
                  onClick={handleConfirm}
                  className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-card active:scale-[0.98] transition-transform mt-4"
                >
                  Agregar actividad
                </button>
                <button
                  onClick={() => setStep(preselectedChildId != null ? 'pick' : 'child')}
                  className="w-full mt-2 border border-border text-muted-foreground font-semibold py-3 rounded-xl text-sm"
                >
                  ‹ Volver
                </button>
              </>
            );
          })()}
        </>
      )}
    </BottomSheet>
  );
}
