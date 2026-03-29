import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function BackHeader({ title, onBack }: BackHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="px-4 py-3 flex items-center gap-2 border-b border-border bg-card flex-shrink-0">
      <button
        onClick={onBack || (() => navigate(-1))}
        className="w-8 h-8 rounded-full border border-border flex items-center justify-center active:scale-95 transition-transform"
      >
        <ChevronLeft size={18} className="text-foreground" />
      </button>
      <span className="text-base font-bold text-foreground">{title}</span>
    </div>
  );
}
