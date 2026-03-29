import { Camera, Download, Apple, Moon, Utensils, Pill, Megaphone, Paintbrush, FileText, DoorOpen, DoorClosed, Heart } from 'lucide-react';

// Maps activity types to styled rounded-square icons matching iOS app-icon aesthetic
const ICON_MAP: Record<string, { Icon: React.ComponentType<any>; gradient: string }> = {
  foto:       { Icon: Camera,      gradient: 'from-[hsl(240,60%,62%)] to-[hsl(240,70%,52%)]' },
  comida:     { Icon: Utensils,    gradient: 'from-[hsl(25,90%,58%)] to-[hsl(15,85%,50%)]' },
  'sueño':    { Icon: Moon,        gradient: 'from-[hsl(220,60%,35%)] to-[hsl(230,65%,25%)]' },
  salud:      { Icon: Pill,        gradient: 'from-[hsl(0,65%,55%)] to-[hsl(350,70%,45%)]' },
  nota:       { Icon: FileText,    gradient: 'from-[hsl(165,55%,45%)] to-[hsl(170,60%,38%)]' },
  actividad:  { Icon: Paintbrush,  gradient: 'from-[hsl(200,65%,50%)] to-[hsl(210,70%,42%)]' },
  aviso:      { Icon: Megaphone,   gradient: 'from-[hsl(35,85%,55%)] to-[hsl(25,80%,48%)]' },
  entry:      { Icon: DoorOpen,    gradient: 'from-[hsl(152,55%,45%)] to-[hsl(158,60%,38%)]' },
  exit:       { Icon: DoorClosed,  gradient: 'from-[hsl(0,60%,55%)] to-[hsl(350,65%,45%)]' },
  video:      { Icon: Camera,      gradient: 'from-[hsl(280,55%,55%)] to-[hsl(270,60%,45%)]' },
  download:   { Icon: Download,    gradient: 'from-[hsl(220,15%,88%)] to-[hsl(220,15%,82%)]' },
  apple:      { Icon: Apple,       gradient: 'from-[hsl(152,65%,48%)] to-[hsl(145,70%,40%)]' },
  heart:      { Icon: Heart,       gradient: 'from-[hsl(350,70%,55%)] to-[hsl(340,75%,45%)]' },
};

interface ActivityIconProps {
  type: string;
  size?: number;
  iconSize?: number;
  className?: string;
}

export default function ActivityIcon({ type, size = 44, iconSize = 20, className = '' }: ActivityIconProps) {
  const match = ICON_MAP[type] || ICON_MAP['nota'];
  const { Icon, gradient } = match;

  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-soft ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon size={iconSize} className="text-white" strokeWidth={2} />
    </div>
  );
}

export { ICON_MAP };
