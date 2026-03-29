import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-h-[88vh] bg-card rounded-t-2xl overflow-y-auto shadow-float safe-bottom"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>
            <div className="px-5 pb-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
