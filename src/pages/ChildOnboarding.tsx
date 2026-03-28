import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, SkipForward, User, Clock, AlertTriangle, Stethoscope, FileText } from 'lucide-react';

const STEPS = ['Datos básicos', 'Salud', 'Información adicional'];

const STEP_ICONS = [User, Stethoscope, FileText];

export default function ChildOnboarding() {
  const { addChild, profile, daycare } = useSupabase();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', age: '', allergies: '', medical: '', extra: '' });
  const upd = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const save = () => {
    addChild({
      daycare_id: daycare?.id || 'dc1',
      parent_id: profile?.id || null,
      name: form.name,
      age_months: parseInt(form.age) || null,
      allergies: form.allergies,
      medical_conditions: form.medical,
      extra_info: form.extra,
      profile_complete: !!(form.name && form.age),
    });
    navigate('/parent-home');
  };

  const StepIcon = STEP_ICONS[step];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-3xl">👶</span>
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Perfil de tu hijo</h2>
          <p className="text-sm text-muted-foreground">Completa a tu ritmo. Puedes saltar pasos.</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                i <= step ? 'bg-primary' : 'bg-border'
              }`} />
              <span className={`text-[10px] font-semibold truncate transition-colors ${
                i === step ? 'text-primary' : i < step ? 'text-muted-foreground' : 'text-border'
              }`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-4">
          {/* Step header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary/40">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <StepIcon size={17} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Paso {step + 1} de {STEPS.length}</p>
              <p className="text-sm font-bold text-foreground">{STEPS[step]}</p>
            </div>
          </div>

          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>

                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Nombre del niño/a *</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                        <input
                          placeholder="Nombre completo"
                          value={form.name}
                          onChange={e => upd('name')(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Edad en meses</label>
                      <div className="relative">
                        <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                        <input
                          type="number"
                          placeholder="Ej: 18 meses"
                          value={form.age}
                          onChange={e => upd('age')(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2.5 bg-warning-light border border-warning/20 rounded-xl px-4 py-3">
                      <AlertTriangle size={14} className="text-warning flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Información opcional pero muy útil para cuidar mejor a tu hijo.
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Alergias</label>
                      <input
                        placeholder="Ej: Maní, látex..."
                        value={form.allergies}
                        onChange={e => upd('allergies')(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Condiciones médicas</label>
                      <input
                        placeholder="Ej: Asma leve, diabetes..."
                        value={form.medical}
                        onChange={e => upd('medical')(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Notas para el cuido</label>
                    <textarea
                      placeholder="Rutinas, preferencias, notas adicionales..."
                      value={form.extra}
                      onChange={e => upd('extra')(e.target.value)}
                      rows={4}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm resize-none transition-all"
                    />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Botones nav */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 bg-card border border-border text-foreground font-bold py-3.5 rounded-xl text-sm hover:bg-secondary/50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <ChevronLeft size={16} /> Atrás
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              {step === 0 && !form.name ? 'Saltar' : 'Siguiente'} <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={save}
              className="flex-1 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              Guardar perfil ✓
            </button>
          )}
        </div>

        <button
          onClick={() => navigate('/parent-home')}
          className="w-full text-muted-foreground text-sm mt-3 py-2.5 flex items-center justify-center gap-1.5 hover:text-foreground transition-colors"
        >
          <SkipForward size={13} /> Completar después
        </button>
      </motion.div>
    </div>
  );
}
