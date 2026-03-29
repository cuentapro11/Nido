import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import ChildAvatar from '@/components/ChildAvatar';
import { motion } from 'framer-motion';

export default function ParentSelect() {
  const { children, setParentChildId, logout } = useApp();
  const navigate = useNavigate();

  // Show all children for demo; in production filter by parent's linked children
  const myChildren = children.slice(0, 4);

  const handleSelect = (id: number) => {
    setParentChildId(id);
    navigate('/parent-home');
  };

  return (
    <div className="min-h-screen bg-[#1E3A8A] flex flex-col items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🐣</div>
          <h1 className="text-2xl font-extrabold text-primary-foreground mb-1">¿A quién quieres ver?</h1>
          <p className="text-sm text-primary-foreground/65">Selecciona el hijo al que deseas ingresar</p>
        </div>

        <div className="space-y-3">
          {myChildren.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              onClick={() => handleSelect(c.id)}
              className="w-full bg-card rounded-2xl p-4 flex items-center gap-3.5 shadow-float text-left active:scale-[0.98] transition-transform"
            >
              <ChildAvatar child={c} size={56} />
              <div className="flex-1">
                <div className="text-base font-extrabold text-foreground">{c.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.age} · {c.group}</div>
                <div className={`inline-flex items-center gap-1 mt-1 text-[11px] font-semibold ${c.present ? 'text-success' : 'text-destructive'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.present ? 'bg-success' : 'bg-destructive'}`} />
                  {c.present ? 'Presente' : 'Ausente'}
                </div>
              </div>
              <span className="text-xl text-muted-foreground">›</span>
            </motion.button>
          ))}
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="mt-6 mx-auto block bg-primary-foreground/15 border border-primary-foreground/30 text-primary-foreground rounded-xl px-6 py-3 text-sm font-semibold"
        >
          Cerrar sesión
        </button>
      </motion.div>
    </div>
  );
}
