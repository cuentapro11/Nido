import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/Toast';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import BottomSheet from '@/components/BottomSheet';
import { ChevronLeft } from 'lucide-react';

export default function CalendarPage() {
  const { cuidoEvents, addEvent, removeEvent, role } = useApp();
  const navigate = useNavigate();
  const { show } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evColor, setEvColor] = useState('#34C759');
  const isCuido = role === 'cuido';

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const startDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const handleSave = () => {
    if (!evTitle || !evDate) { show('Completa título y fecha'); return; }
    const d = new Date(evDate);
    addEvent({ title: evTitle, date: String(d.getDate() + 1), desc: evDesc, color: evColor });
    show('✓ Evento guardado');
    setShowModal(false);
    setEvTitle(''); setEvDate(''); setEvDesc('');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex items-center gap-3 px-4 pt-6 pb-3">
        {role === 'parent' && (
          <button onClick={() => navigate('/parent-home')}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-90 flex-shrink-0">
            <ChevronLeft size={20} className="text-foreground" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-extrabold text-foreground">Calendario</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{isCuido ? 'Eventos visibles para los padres' : 'Eventos del cuido'}</p>
        </div>
        {isCuido && (
          <button onClick={() => setShowModal(true)}
            className="bg-primary text-primary-foreground font-bold text-xs rounded-full px-3.5 py-2 shadow-card active:scale-95 transition-transform">
            + Evento
          </button>
        )}
      </div>

      {/* Calendar grid */}
      <div className="bg-card border-b border-border p-4 mx-3.5 rounded-2xl shadow-card mb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-extrabold text-foreground">{monthNames[today.getMonth()]} {today.getFullYear()}</span>
        </div>
        <div className="grid grid-cols-7 text-center mb-2">
          {'D L M M J V S'.split(' ').map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-muted-foreground">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center gap-0.5">
          {Array.from({ length: startDay }).map((_, i) => <div key={'e' + i} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const n = i + 1;
            const isToday = n === today.getDate();
            const ev = cuidoEvents.find(e => e.date === String(n));
            return (
              <div
                key={n}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium relative ${
                  isToday ? 'bg-primary text-primary-foreground font-extrabold' : 'text-foreground'
                }`}
              >
                {n}
                {ev && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: ev.color }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events list */}
      <div className="px-5 pb-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
          Eventos ({cuidoEvents.length})
        </span>
      </div>
      <div className="px-3.5 space-y-2">
        {cuidoEvents.map((ev, i) => (
          <div key={i} className="bg-card rounded-xl p-3.5 flex gap-3 shadow-card">
            <div className="w-1 rounded-full flex-shrink-0 self-stretch" style={{ background: ev.color }} />
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">{ev.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">📅 Día {ev.date}</div>
              {ev.desc && <div className="text-xs text-muted-foreground mt-1">{ev.desc}</div>}
            </div>
            {isCuido && (
              <button
                onClick={() => { removeEvent(i); show('Evento eliminado'); }}
                className="text-destructive text-sm flex-shrink-0 active:scale-95"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {cuidoEvents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <div className="text-3xl mb-2">📅</div>Sin eventos.
          </div>
        )}
      </div>

      <BottomSheet open={showModal} onClose={() => setShowModal(false)}>
        <h3 className="text-lg font-extrabold text-foreground mb-4">Nuevo evento</h3>
        <input
          value={evTitle}
          onChange={e => setEvTitle(e.target.value)}
          placeholder="Título del evento *"
          className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary mb-3"
        />
        <input
          type="date"
          value={evDate}
          onChange={e => setEvDate(e.target.value)}
          className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary mb-3"
        />
        <textarea
          value={evDesc}
          onChange={e => setEvDesc(e.target.value)}
          placeholder="Descripción (opcional)"
          className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none resize-none h-16 focus:border-primary mb-3"
        />
        <div className="text-xs text-muted-foreground mb-2">Color:</div>
        <div className="flex gap-2 mb-4">
          {['#34C759','#007AFF','#FF9500','#AF52DE','#FF3B30'].map(c => (
            <button
              key={c}
              onClick={() => setEvColor(c)}
              className="w-7 h-7 rounded-full"
              style={{ background: c, border: evColor === c ? '3px solid hsl(var(--foreground))' : '3px solid transparent' }}
            />
          ))}
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-card"
        >
          📅 Guardar evento
        </button>
      </BottomSheet>

      {isCuido && <BottomNav />}
    </div>
  );
}
