import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Bell } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';

export default function Parents() {
  const { parents, pendingSolicitudes, chatMessages } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Mensajes"
        subtitle="Conversaciones con padres"
        topSpacing
        right={
          <button
            onClick={() => navigate('/solicitudes')}
            className="relative w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center"
          >
            <Bell size={18} className="text-destructive" />
            {pendingSolicitudes.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-background">
                {pendingSolicitudes.length}
              </span>
            )}
          </button>
        }
      />

      <div className="px-3.5 space-y-2.5">
        {parents.map(p => {
          const msgs = chatMessages[p.id];
          const lastMsg = msgs && msgs.length ? msgs[msgs.length - 1].text : p.msg;
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/chat/${p.id}`)}
              className="w-full bg-card rounded-2xl p-3.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform text-left"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: p.bg, color: p.tc }}
              >
                {p.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">Papá/Mamá de {p.hijo}</div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{lastMsg}</div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[11px] text-muted-foreground">{p.time}</span>
                {p.unread > 0 && (
                  <span className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                    {p.unread}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
