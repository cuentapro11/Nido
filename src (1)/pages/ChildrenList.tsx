import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import ChildAvatar from '@/components/ChildAvatar';

export default function ChildrenList() {
  const { children } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const filtered = children.filter(c =>
    !q.trim() || c.name.toLowerCase().includes(q.trim().toLowerCase())
  );

  const groups = [...new Set(children.map(c => c.group))];

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Niños" caption={`${children.length} niños registrados`} topSpacing />

      <div className="px-3.5 pb-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar niño..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 shadow-card"
          />
        </div>
      </div>

      {groups.map(group => {
        const groupChildren = filtered.filter(c => c.group === group);
        if (groupChildren.length === 0) return null;
        return (
          <div key={group} className="mb-4">
            <div className="px-4 pb-2 flex items-center gap-2">
              <span className="text-xs font-extrabold text-foreground">{group}</span>
              <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-semibold">
                {groupChildren.length}
              </span>
            </div>
            <div className="px-3.5 space-y-2">
              {groupChildren.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <button
                    onClick={() => navigate(`/child/${c.id}`)}
                    className="w-full bg-card rounded-2xl p-3.5 flex items-center gap-3 shadow-card active:scale-[0.98] transition-transform text-left"
                  >
                    <ChildAvatar child={c} size={48} />
                    <div className="flex-1 min-w-0">
                      {/* Punto de color junto al nombre */}
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.present ? 'bg-success' : 'bg-destructive'}`} />
                        <span className="text-sm font-bold text-foreground">{c.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.age}</div>
                    </div>
                    <div className="w-7 h-7 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                        <path d="M1.5 1.5L6.5 6.5L1.5 11.5" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      <BottomNav />
    </div>
  );
}
