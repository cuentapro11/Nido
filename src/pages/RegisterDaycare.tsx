import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, User, Phone, Mail, Lock, AlertCircle } from 'lucide-react';

export default function RegisterDaycare() {
  const { registerDaycare, loading } = useSupabase();
  const { setRole } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ daycareName: '', adminName: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const upd = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.daycareName || !form.adminName || !form.email || !form.password) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const { error: err } = await registerDaycare(form);
    if (err) { setError(err); return; }
    setRole('cuido');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} /> Volver
        </button>

        {/* Header */}
        <div className="mb-7">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">🏠</div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Registra tu cuido</h2>
          <p className="text-sm text-muted-foreground">Crea la cuenta de tu guardería en segundos.</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 bg-destructive/8 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive mb-4"
          >
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Sección: Información del cuido */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Información del cuido</p>
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Nombre del cuido *</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  placeholder="Cuido Rayito de Sol"
                  value={form.daycareName}
                  onChange={e => upd('daycareName')(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Nombre del responsable *</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  placeholder="María López"
                  value={form.adminName}
                  onChange={e => upd('adminName')(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Datos de acceso */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Datos de acceso</p>
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Teléfono</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  placeholder="+1 (809) 000-0000"
                  value={form.phone}
                  onChange={e => upd('phone')(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Correo electrónico *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="email"
                  placeholder="cuido@correo.com"
                  value={form.email}
                  onChange={e => upd('email')(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Contraseña *</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={e => upd('password')(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? 'Creando cuenta...' : 'Crear mi cuido →'}
        </button>
      </motion.div>
    </div>
  );
}
