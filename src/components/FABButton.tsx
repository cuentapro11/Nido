import { Plus } from 'lucide-react';

interface FABButtonProps {
  onClick: () => void;
}

export default function FABButton({ onClick }: FABButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-5 w-14 h-14 bg-primary rounded-full shadow-float flex items-center justify-center z-20 active:scale-95 transition-transform"
    >
      <Plus size={24} className="text-primary-foreground" strokeWidth={2.4} />
    </button>
  );
}
