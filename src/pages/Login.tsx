import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';

const MOCK_USERS = [
  { email: 'admin@rayito.com',  role: 'admin'     },
  { email: 'elena@rayito.com',  role: 'caregiver' },
  { email: 'carlos@rayito.com', role: 'caregiver' },
  { email: 'juan@gmail.com',    role: 'parent'    },
];

const ROLE_DEST: Record<string, string> = {
  admin:     '/dashboard',
  caregiver: '/caregiver',
  parent:    '/parent-onboarding',
};

export default function Login() {
  const { login, loading } = useSupabase();
  const { setRole } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'role' | 'cuido' | 'parent'>('role');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const DEMOS = [
    { label: 'Admin',     sub: 'Panel completo · María López',  email: 'admin@rayito.com'  },
    { label: 'Cuidadora', sub: 'Registra actividades · Elena',  email: 'elena@rayito.com'  },
    { label: 'Cuidador',  sub: 'Registra actividades · Carlos', email: 'carlos@rayito.com' },
  ];

  const redirectByEmail = (emailVal: string) => {
    const user = MOCK_USERS.find(u => u.email === emailVal);
    const role = user?.role || (mode === 'parent' ? 'parent' : 'admin');
    setRole(role === 'parent' ? 'parent' : 'cuido');
    navigate(ROLE_DEST[role] || '/dashboard');
  };

  const handleLogin = async () => {
    if (!email.trim()) { setError('Ingresa tu correo.'); return; }
    const { error: err } = await login(email, password);
    if (err) { setError(err); return; }
    redirectByEmail(email);
  };

  const handleDemo = async (emailVal: string) => {
    const { error: err } = await login(emailVal, 'demo');
    if (!err) redirectByEmail(emailVal);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* PANTALLA: Selección de rol */}
        {mode === 'role' && (
          <div className="flex flex-col items-center">
            {/* Logo */}
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-sm">
              🐣
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-1">NidoApp</h1>
            <p className="text-sm text-muted-foreground mb-10 text-center">La app para cuidados infantiles</p>

            <div className="w-full space-y-3">
              <button
                onClick={() => setMode('parent')}
                className="w-full bg-card border border-border rounded-2xl p-5 text-left flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">👨‍👩‍👧</div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-base">Soy Padre / Madre</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Accede al diario de tu hijo</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>

              <button
                onClick={() => setMode('cuido')}
                className="w-full bg-card border border-border rounded-2xl p-5 text-left flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🏠</div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-base">Soy del Cuido</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Admin o cuidador</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            </div>

            <p className="text-muted-foreground/60 text-xs mt-6 text-center">
              Admin y cuidadores usan el mismo acceso
            </p>
          </div>
        )}

        {/* PANTALLA: Login */}
        {(mode === 'cuido' || mode === 'parent') && (
          <div>
            <button
              onClick={() => { setMode('role'); setError(''); }}
              className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-6 hover:text-foreground transition-colors"
            >
              <ArrowLeft size={15} />
              Volver
            </button>

            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-foreground mb-1">
                {mode === 'cuido' ? 'Acceso Cuido' : 'Acceso Padres'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'cuido' ? 'Admin o cuidador — la app detecta tu rol.' : 'Inicia sesión para ver a tu hijo.'}
              </p>
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

            {/* Card formulario */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 mb-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl text-sm shadow-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>

            {/* Demos */}
            {mode === 'cuido' && (
              <div className="mt-5">
                <p className="text-muted-foreground/50 text-[10px] text-center mb-3 font-bold uppercase tracking-wider">Acceso rápido demo</p>
                <div className="space-y-2">
                  {DEMOS.map(d => (
                    <button
                      key={d.email}
                      onClick={() => handleDemo(d.email)}
                      disabled={loading}
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-left flex items-center justify-between hover:border-primary/30 hover:bg-secondary/50 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      <div>
                        <span className="text-foreground font-semibold text-sm block">{d.label}</span>
                        <span className="text-muted-foreground text-xs">{d.sub}</span>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'parent' && (
              <button
                onClick={() => handleDemo('juan@gmail.com')}
                disabled={loading}
                className="w-full mt-3 bg-card border border-border text-muted-foreground font-medium py-3 rounded-xl text-sm hover:border-primary/30 hover:bg-secondary/50 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                Entrar como padre demo
              </button>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => navigate(mode === 'cuido' ? '/register-daycare' : '/register-parent')}
                className="text-primary text-sm font-semibold hover:underline underline-offset-2 transition-all"
              >
                ¿No tienes cuenta? Crear cuenta
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
