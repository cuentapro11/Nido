import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, CalendarDays, MessageSquare, MoreHorizontal, Image, User } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const ADMIN_TABS = [
  { path: '/dashboard',     icon: Home,            label: 'Inicio',       color: 'hsl(240,60%,62%)' },
  { path: '/children',      icon: Users,           label: 'Niños',        color: 'hsl(25,90%,58%)' },
  { path: '/chat',          icon: MessageSquare,   label: 'Chat',         color: 'hsl(200,65%,50%)' },
  { path: '/calendar',      icon: CalendarDays,    label: 'Calendario',   color: 'hsl(152,55%,45%)' },
  { path: '/configuracion', icon: MoreHorizontal,  label: 'Más',          color: 'hsl(290,55%,55%)' },
];

const PARENT_TABS = [
  { path: '/parent-home',    icon: Home,            label: 'Inicio',   color: 'hsl(240,60%,62%)' },
  { path: '/parent-gallery', icon: Image,           label: 'Galería',  color: 'hsl(200,65%,50%)' },
  { path: '/parent-chat',    icon: MessageSquare,   label: 'Chat',     color: 'hsl(152,55%,45%)' },
  { path: '/parent-profile', icon: User,            label: 'Perfil',   color: 'hsl(25,90%,58%)' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = useApp();

  const tabs = role === 'parent' ? PARENT_TABS : ADMIN_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom z-30">
      <div className="flex h-16">
        {tabs.map(tab => {
          const active = location.pathname === tab.path ||
            (tab.path === '/chat' && location.pathname.startsWith('/chat/')) ||
            (tab.path === '/children' && location.pathname.startsWith('/child/')) ||
            (tab.path === '/calendar' && location.pathname.startsWith('/calendar'));
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-all"
            >
              <tab.icon
                size={22}
                strokeWidth={active ? 2 : 1.5}
                style={{ color: active ? tab.color : undefined }}
                className={active ? '' : 'text-muted-foreground/60'}
              />
              <span
                className={`text-[10px] font-semibold ${active ? '' : 'text-muted-foreground/60'}`}
                style={active ? { color: tab.color } : undefined}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
