import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import BackHeader from '@/components/BackHeader';
import { Heart, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ParentGallery() {
  const navigate = useNavigate();
  const { children, parentChildId } = useApp();
  const child = children.find(c => c.id === parentChildId);
  const [likedPhotos, setLikedPhotos] = useState<Record<number, boolean>>({});
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);

  if (!child) return null;

  const photos = child.tl.filter(item => item.type === 'foto' || item.hasImg);

  return (
    <div className="min-h-screen bg-background">
      <BackHeader title="Galería" onBack={() => navigate(-1)} />

      {/* Full-screen image viewer */}
      <AnimatePresence>
        {fullScreenImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/90 flex items-center justify-center"
            onClick={() => setFullScreenImg(null)}
          >
            <button
              onClick={() => setFullScreenImg(null)}
              className="absolute top-12 right-4 w-10 h-10 bg-card/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
            >
              <X size={20} className="text-primary-foreground" />
            </button>
            {fullScreenImg === 'emoji' ? (
              <div className="text-[120px]">{child.emoji}</div>
            ) : (
              <img src={fullScreenImg} alt="" className="max-w-full max-h-full object-contain" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-3.5 pt-3">
        {photos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="text-sm font-semibold text-foreground">Sin fotos aún</div>
            <div className="text-xs mt-1">Las fotos de {child.name} aparecerán aquí.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {photos.map((item, i) => (
              <div key={i} className="relative">
                <button
                  onClick={() => setFullScreenImg(item.photo || 'emoji')}
                  className="aspect-square w-full bg-card rounded-2xl overflow-hidden shadow-card flex items-center justify-center active:opacity-90 transition-opacity"
                  style={{ background: `linear-gradient(135deg, #EFF6FF, #fff)` }}
                >
                  {item.photo ? (
                    <img src={item.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">{child.emoji}</span>
                  )}
                </button>
                {/* Heart like button */}
                <button
                  onClick={() => setLikedPhotos(prev => ({ ...prev, [i]: !prev[i] }))}
                  className="absolute bottom-2 right-2 active:scale-90 transition-transform"
                >
                  <Heart size={22}
                    className={likedPhotos[i] ? 'text-[hsl(0,72%,55%)] fill-[hsl(0,72%,55%)]' : 'text-card'}
                    strokeWidth={likedPhotos[i] ? 0 : 2}
                    style={{ filter: !likedPhotos[i] ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : undefined }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
