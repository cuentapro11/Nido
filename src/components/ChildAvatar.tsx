import { Child } from '@/contexts/AppContext';

interface ChildAvatarProps {
  child: Child;
  size?: number;
  showStatus?: boolean;
  className?: string;
}

export default function ChildAvatar({ child, size = 48, showStatus = false, className = '' }: ChildAvatarProps) {
  return (
    <div
      className={`relative rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, background: child.bg }}
    >
      {child.photo ? (
        <img src={child.photo} alt={child.name} className="w-full h-full object-cover rounded-full" />
      ) : (
        <span style={{ fontSize: size * 0.46 }}>{child.emoji}</span>
      )}
      {showStatus && (
        <span
          className={`absolute bottom-0.5 right-0.5 rounded-full border-2 border-card`}
          style={{
            width: size * 0.24,
            height: size * 0.24,
            backgroundColor: child.present ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
          }}
        />
      )}
    </div>
  );
}
