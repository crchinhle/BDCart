import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import FullscreenModal from './FullscreenModal';

// Danh sách ảnh nguyên chất (Đã lược bỏ hoàn toàn các dòng caption mô tả)
const CARDS = [
  { id: 1, filename: 'anh1.jpg', src: `${import.meta.env.BASE_URL}images/anh1.jpg` },
  { id: 2, filename: 'anh2.jpg', src: `${import.meta.env.BASE_URL}images/anh2.jpg` },
  { id: 3, filename: 'anh3.jpg', src: `${import.meta.env.BASE_URL}images/anh3.jpg` },
  { id: 4, filename: 'anh4.jpg', src: `${import.meta.env.BASE_URL}images/anh4.jpg` },
  { id: 5, filename: 'anh5.jpg', src: `${import.meta.env.BASE_URL}images/anh5.jpg` },
  { id: 6, filename: 'anh6.jpg', src: `${import.meta.env.BASE_URL}images/anh6.jpg` },
  { id: 7, filename: 'anh7.jpg', src: `${import.meta.env.BASE_URL}images/anh7.jpg` },
  { id: 8, filename: 'anh8.jpg', src: `${import.meta.env.BASE_URL}images/anh8.jpg` },
];

const N = CARDS.length;
const ANGLE = 360 / N;

export default function Scene3SpaceGallery({ onRestart }) {
  const [idx, setIdx] = useState(0);
  const [modal, setModal] = useState(null);
  const [radius, setRadius] = useState(360);
  const drag = useRef({ x: 0, t: 0, on: false, cardIndex: null });
  const activeIdx = ((idx % N) + N) % N;

  useEffect(() => {
    const u = () => setRadius(window.innerWidth < 640 ? 230 : 360);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);

  const down = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const card = e.target.closest('[data-card-index]');
    drag.current = {
      x: e.clientX,
      t: Date.now(),
      on: true,
      cardIndex: card ? Number(card.dataset.cardIndex) : null,
    };
  };

  const up = (e) => {
    if (!drag.current.on) return;
    drag.current.on = false;
    const dx = e.clientX - drag.current.x;
    const dt = Math.max(Date.now() - drag.current.t, 1);
    const v = Math.abs(dx / dt);
    if (Math.abs(dx) < 10) {
      if (drag.current.cardIndex !== null) setModal(drag.current.cardIndex);
      return;
    }
    const dir = dx > 0 ? -1 : 1;
    const steps = v < 0.4 ? 1 : v < 0.8 ? 2 : v < 1.3 ? 3 : Math.min(Math.round(v * 2), 5);
    setIdx(p => p + dir * steps);
  };

  const go = (d) => setIdx(p => p + d);

  const goTo = (targetIdx) => {
    setIdx((current) => {
      const currentIdx = ((current % N) + N) % N;
      let distance = targetIdx - currentIdx;
      if (distance > N / 2) distance -= N;
      if (distance < -N / 2) distance += N;
      return current + distance;
    });
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between py-10 px-4 z-10 overflow-hidden select-none">
      
      {/* TIÊU ĐỀ DUY NHẤT: KHÔNG GIAN BÍ MẬT KIM PHỤNG */}
      <motion.div className="text-center mt-2 mb-2 z-30" initial={{ opacity: 0, y: -25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h2 className="font-sans text-3xl md:text-5xl font-extrabold text-amber-200 tracking-wide drop-shadow-[0_2px_20px_rgba(251,191,36,0.65)] uppercase">
          Không gian bí mật Kim Phụng
        </h2>
      </motion.div>

      {/* VÒNG TRÒN GALLERY 3D ĐẤU TRƯỜNG THIÊN HÀ (HOÀN KHỐI 60FPS) */}
      <div className="relative flex-1 w-full flex items-center justify-center z-20 my-4" style={{ minHeight: '460px' }}>
        <div
          style={{ perspective: '1100px', width: `${radius * 2 + 240}px`, maxWidth: '100%', height: '440px', touchAction: 'none', overflow: 'visible' }}
          onPointerDown={down} onPointerUp={up} onPointerCancel={up}
        >
          {/* Góc quay camera hơi hướng ngước nghiêng lên (-8deg) để tạo chiều sâu bất tận */}
          <motion.div
            className="absolute left-1/2 top-1/2 preserve-3d"
            style={{ width: 0, height: 0, transformStyle: 'preserve-3d', transform: 'rotateX(-7deg)' }}
            animate={{ rotateY: -idx * ANGLE }}
            transition={{ type: 'spring', stiffness: 65, damping: 15 }}
          >
            {/* Cards 3D phong cách Đấu trường Thiên hà: Trước thấp rõ - Sau vút cao */}
            {CARDS.map((c, i) => {
              // Tính khoảng cách góc ngắn nhất từ card hiện tại tới trục giữa (idx)
              let diff = ((i - activeIdx) % N + N) % N;
              if (diff > N / 2) diff -= N;
              const absDiff = Math.abs(diff);

              // Tinh chỉnh tọa độ Đấu trường:
              // - absDiff === 0 (Giữa tâm): Y hạ thấp (+25px), rực rỡ nhất, Scale lớn 1.15
              // - absDiff === 1 (Kề bên): Y cao hơn (-55px), Scale 0.88, lùi nhường sân khấu
              // - absDiff >= 2 (Phía sau): Y năng vút lên đỉnh cao ráo (-130px -> -185px)
              const isCenter = absDiff === 0;
              const elevationY = isCenter ? 25 : (absDiff === 1 ? -55 : (absDiff === 2 ? -130 : -185));
              const cardScale = isCenter ? 1.15 : (absDiff === 1 ? 0.88 : (absDiff === 2 ? 0.72 : 0.55));
              const cardOpacity = isCenter ? 1.0 : (absDiff === 1 ? 0.88 : (absDiff === 2 ? 0.65 : 0.42));
              const cardZIndex = 50 - absDiff * 10;

              return (
                <button
                  type="button"
                  key={c.id}
                  data-card-index={i}
                  className="absolute cursor-zoom-in group transition-all duration-[650ms] appearance-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200/80 rounded-2xl"
                  style={{
                    transform: `rotateY(${i * ANGLE}deg) translateZ(${radius}px) translateY(${elevationY}px) scale(${cardScale})`,
                    width: 210,
                    height: 300,
                    marginLeft: -105,
                    marginTop: -150,
                    opacity: cardOpacity,
                    zIndex: cardZIndex,
                    transition: 'all 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'transform, opacity',
                  }}
                >
                  <div
                    className={`w-full h-full rounded-2xl overflow-hidden bg-midnight-900 border-2 transition-all duration-500 shadow-2xl ${
                      isCenter
                        ? 'border-amber-300/90 shadow-[0_10px_35px_rgba(251,191,36,0.5),0_0_20px_rgba(244,63,94,0.35)]'
                        : 'border-white/20 hover:border-amber-400/60 shadow-[0_8px_25px_rgba(0,0,0,0.6)]'
                    }`}
                  >
                    {/* Bấm trực tiếp vào ảnh để mở ảnh phóng to. */}
                    <img
                      src={c.src}
                      alt="Khoảnh khắc Kim Phụng"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                      onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                    />
                    
                    <div className="hidden absolute inset-0 bg-gradient-to-br from-rose-900/70 via-purple-900/70 to-amber-900/70 flex-col items-center justify-center p-4 text-center">
                      <span className="text-2xl mb-2">✨</span>
                      <span className="text-xs font-mono text-amber-200 border border-amber-300/40 px-2.5 py-1 rounded-full bg-black/40">{c.filename}</span>
                    </div>

                  </div>
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* THANH ĐIỀU HƯỚNG BỘ LỌC DƯỚI CHÂN CỘT */}
      <div className="flex flex-col items-center justify-center gap-5 z-30 mb-2">
        <div className="flex items-center gap-5">
          <button onClick={() => go(-1)} className="w-11 h-11 rounded-full bg-white/10 hover:bg-amber-500/80 border border-white/25 text-white flex items-center justify-center transition-all duration-200 shadow-xl hover:scale-110 active:scale-95 cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2.5">
            {CARDS.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${i === activeIdx ? 'w-4 h-3 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/60'}`} />
            ))}
          </div>
          <button onClick={() => go(1)} className="w-11 h-11 rounded-full bg-white/10 hover:bg-amber-500/80 border border-white/25 text-white flex items-center justify-center transition-all duration-200 shadow-xl hover:scale-110 active:scale-95 cursor-pointer">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <motion.button
          onClick={onRestart}
          className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm md:text-base font-sans font-medium tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        >
          <RotateCcw className="w-4.5 h-4.5 text-amber-300" /><span>Mở lại bức thư từ đầu</span>
        </motion.button>
      </div>

      {/* FULLSCREEN LIGHTBOX ZOOM MODAL */}
      <AnimatePresence>
        {modal !== null && (
          <FullscreenModal key="modal" item={CARDS[modal]} onClose={() => setModal(null)}
            onPrev={() => setModal(p => ((p - 1) % N + N) % N)}
            onNext={() => setModal(p => ((p + 1) % N + N) % N)} />
        )}
      </AnimatePresence>
    </div>
  );
}
