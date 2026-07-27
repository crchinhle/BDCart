import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FullscreenModal({ item, onClose, onPrev, onNext }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!item) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-xl"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
    >
      {/* Nút thoát & Điều hướng chuyển ảnh nhã nhặn */}
      <button type="button" aria-label="Đóng ảnh phóng to" onClick={onClose} className="absolute top-5 right-5 md:top-8 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-rose-600/80 border border-white/25 text-white flex items-center justify-center transition-all duration-200 z-50 shadow-2xl hover:scale-110 active:scale-95">
        <X className="w-6 h-6" />
      </button>
      
      <button type="button" aria-label="Ảnh trước" onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-amber-500/80 border border-white/25 text-white flex items-center justify-center transition-all duration-200 z-50 shadow-2xl hover:scale-110 active:scale-95">
        <ChevronLeft className="w-7 h-7" />
      </button>
      
      <button type="button" aria-label="Ảnh tiếp theo" onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-amber-500/80 border border-white/25 text-white flex items-center justify-center transition-all duration-200 z-50 shadow-2xl hover:scale-110 active:scale-95">
        <ChevronRight className="w-7 h-7" />
      </button>

      {/* KHUNG SIÊU ẢNH CHI TIẾT (HOÀN TOÀN KHÔNG CÓ BẢNG CHỮ MÔ TẢ DƯ THỪA) */}
      <motion.div
        className="relative w-[min(92vw,1100px)] h-[min(86vh,800px)] rounded-3xl overflow-hidden border-2 border-amber-400/50 shadow-[0_0_80px_rgba(251,191,36,0.3)] bg-[#120924] z-40 flex items-center justify-center pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 25 }}
        transition={{ duration: 0.35, type: 'spring', bounce: 0.2 }}
        style={{ willChange: 'transform, opacity' }}
      >
        <img
          src={item.src}
          alt="Kiểm xem chi tiết"
          className="w-full h-full object-contain rounded-2xl select-none"
          onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
        />
        <div className="hidden absolute inset-0 bg-gradient-to-br from-rose-900/60 via-purple-900/60 to-amber-900/60 flex-col items-center justify-center p-8 text-center min-w-[300px] min-h-[380px]">
          <span className="text-4xl mb-3">📸</span>
          <p className="text-sm font-sans font-bold text-amber-200">Hãy đặt file <code className="bg-black/50 px-2 py-1 rounded text-amber-300">{item.filename}</code> vào thư mục <code className="text-amber-300">public/images/</code> nhé!</p>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
