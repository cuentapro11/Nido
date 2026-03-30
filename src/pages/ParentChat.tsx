import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Send } from 'lucide-react';

export default function ParentChat() {
  const navigate = useNavigate();
  const { parents, chatMessages, sendMessage, parentChildId, children } = useApp();
  const [text, setText] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  const child = children.find(c => c.id === parentChildId);
  const parent = parents.find(p => child && p.hijo === child.name);

  const msgs = parent ? (chatMessages[parent.id] || [
    { from: 'r', text: '¡Hola! Bienvenido al chat con el cuido. 😊', ts: '8:00 AM' },
    { from: 'r', text: child ? child.name + ' está pasándola genial hoy.' : 'Todo bien por aquí.', ts: '9:00 AM' },
  ]) : [];

  const now = () => {
    const d = new Date();
    let h = d.getHours(); const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + (m < 10 ? '0' : '') + m + ' ' + ampm;
  };

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [msgs.length]);

  const handleSend = () => {
    if (!text.trim() || !parent) return;
    sendMessage(parent.id, text.trim());
    setText('');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border bg-card flex-shrink-0">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M12 5L7 10l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">☀️</div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">Cuido Rayito de Sol</div>
          <div className="text-[11px] text-success font-semibold">En línea</div>
        </div>
      </div>

      <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
        {msgs.map((m, i) => {
          const sent = m.from === 's';
          return (
            <div key={i} className={`max-w-[76%] flex flex-col gap-0.5 ${sent ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${sent ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-card text-foreground border border-border rounded-bl-md'}`}>
                {m.text}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{m.ts}</span>
            </div>
          );
        })}
      </div>

      <div className="bg-card px-3 py-2.5 flex gap-2 items-center border-t border-border safe-bottom">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-muted border border-border rounded-full px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button onClick={handleSend} className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
          <Send size={16} className="text-primary-foreground" />
        </button>
      </div>
    </div>
  );
}
