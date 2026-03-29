import { useApp } from '@/contexts/AppContext';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import ActivityIcon from '@/components/ActivityIcon';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Presence() {
  const { children } = useApp();

  const allActivities = children.flatMap(c =>
    c.tl.map(item => ({ ...item, childName: c.name, childId: c.id, childBg: c.bg, childEmoji: c.emoji }))
  );

  const presentes = children.filter(c => c.present).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Actividades" subtitle={`${presentes} presentes · ${allActivities.length} registros hoy`} />

      <div className="px-3.5 space-y-2.5 pt-3">
        {allActivities.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-sm font-bold text-foreground">Sin actividades hoy</div>
            <div className="text-xs mt-1">Usa el botón + para registrar.</div>
          </div>
        )}
        {allActivities.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-2xl p-3.5 shadow-card">
            <div className="flex gap-3 items-center">
              <ActivityIcon type={item.type} size={44} iconSize={20} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.desc}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.childName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{item.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
