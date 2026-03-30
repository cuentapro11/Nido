import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Mail, Lock, AlertCircle, Info } from 'lucide-react';

export default function RegisterParent() {
  const { registerParent, loading } = useSupabase();
  const { setRole } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState('');
  const upd = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || (!form.phone && !form.email) || !form.password) {
      setError('Nombre, contraseña y teléfono o correo son requeridos.');
      return;
    }
    const { error: err } = await registerParent(form);
    if (err) { setError(err); return; }
    setRole('parent');
    navigate('/parent-onboarding');
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
          <div className="w-14 h-14 bg-accent/15 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm">👨‍👩‍👧</div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Crea tu cuenta</h2>
          <p className="text-sm text-muted-foreground">Solo lo esencial — sin complicaciones.</p>
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

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-4">
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Nombre completo *</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  placeholder="Juan Pérez"
                  value={form.name}
                  onChange={e => upd('name')(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                />
              </div>
            </div>
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
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  type="email"
                  placeholder="tu@correo.com"
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

        {/* Tip card */}
        <div className="flex items-start gap-2.5 bg-secondary border border-secondary-foreground/10 rounded-xl px-4 py-3 mb-5">
          <Info size={14} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-secondary-foreground leading-relaxed">
            No necesitas información de tu hijo ahora. Lo completas después del registro.
          </p>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
        </button>
      </motion.div>
    </div>
  );
}
