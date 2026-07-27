import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, ArrowRight, Flame, Sparkles } from 'lucide-react';

const BIRTHDAY_WISH = "Happy Birthday em! Chúc tuổi mới bớt lo âu, thêm phần xông xáo, lúc nào cũng cười tươi và gặp toàn chuyện may mắn. Xinh đẹp và vui vẻ không muộn phiền nhé!";

// Each phase starts as the preceding animation finishes so the sequence has no dead time.
const OPENING_TIMELINE = [
  // 0.00s: bấm -> nắp phong bì mở (0.85s).
  { phase: 'letterRising', delay: 600 },        // 0.60s: lá thư trồi lên, phong bì bắt đầu dạt lên góc phải (1.25s).
  { phase: 'envelopeShrinking', delay: 1100 },  // 1.10s: phong bì tiếp tục thu nhỏ về góc.
  { phase: 'paperResizing', delay: 1500 },      // 1.50s: trang giấy bung rộng (1s) -> xong ~2.5s, phong bì đậu xong ~1.85s.
  { phase: 'textDissolveAndStars', delay: 2700 }, // 2.70s: chữ tan (2.5s) và sao bay ra.
  { phase: 'starsToCake', delay: 5600 },        // 5.60s: sao hội tụ tạo bánh (~1.8s).
  { phase: 'cakeInteractive', delay: 7500 },    // 7.50s: bánh sẵn sàng để thắp nến.
];

const SMOOTH_EASE = [0.22, 1, 0.36, 1];

const WISH_CHARACTER_DELAY_MS = 40;
const WISH_CHARACTER_ANIMATION_MS = 450;
const WISH_REVEAL_DURATION_MS = (Array.from(BIRTHDAY_WISH).length - 1) * WISH_CHARACTER_DELAY_MS + WISH_CHARACTER_ANIMATION_MS;
const CARD_IMAGES = Array.from({ length: 8 }, (_, index) => `${import.meta.env.BASE_URL}images/anh${index + 1}.jpg`);
const CAKE_DISSOLVE_DELAY_MS = 100;
const WISH_WRITING_DELAY_MS = 3200;

export default function Scene1Envelope({ onOpen }) {
  // Chuỗi hành trình ma thuật chuẩn mực 60FPS:
  // 'sealed' -> 'flapOpening' -> 'letterRising' -> 'envelopeShrinking' -> 'paperResizing' -> 'textDissolveAndStars' -> 'starsToCake' -> 'cakeInteractive' -> 'cakeDissolving' -> 'lightRaysWritingWish'
  const [phase, setPhase] = useState('sealed');

  // Trạng thái cho Bánh kem & Lời chúc
  const [candle2Lit, setCandle2Lit] = useState(false);
  const [candle1Lit, setCandle1Lit] = useState(false);
  const [isBlowing, setIsBlowing] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);
  const timerIdsRef = useRef(new Set());

  const allLit = candle2Lit && candle1Lit;

  const clearScheduledTimers = () => {
    timerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timerIdsRef.current.clear();
  };

  const schedule = (callback, delay) => {
    const timerId = window.setTimeout(() => {
      timerIdsRef.current.delete(timerId);
      callback();
    }, delay);
    timerIdsRef.current.add(timerId);
  };

  useEffect(() => () => clearScheduledTimers(), []);

  const handleSealClick = () => {
    if (phase !== 'sealed') return;
    clearScheduledTimers();
    setPhase('flapOpening');
    OPENING_TIMELINE.forEach(({ phase: nextPhase, delay }) => {
      schedule(() => setPhase(nextPhase), delay);
    });
    
    // BƯỚC 1: Phóng to đồng bộ ngang & dọc trong đúng 1.5s mượt mà (Chữ vẫn sáng tươi trên giấy)

    // BƯỚC 2: Mất màu từ từ nhẹ nhàng 2.5s, KHÔNG có vòng tròn tròn lớn, đúng 21 Ngôi Sao có đuôi bay lượn lờ tràn ra tận rèm trời đêm

    // BƯỚC 3: 21 ngôi sao quay lại tụ tim nặn thăng hoa ra chiếc Bánh Kem 3D cao đẳng cấp

    // Sẵn sàng thắp nến tuổi 21
  };

  // Cấu hình chuẩn ĐÚNG 21 NGÔI SAO BIỂU NGỮ (Đại diện cho 21 tuổi), to nhỏ ngẫu nhiên, có đuôi sáng băng
  const authentic21Stars = useMemo(() =>
    Array.from({ length: 21 }).map((_, i) => {
      const angle = (i * 360) / 21 + (Math.random() * 12 - 6);
      const rad = (angle * Math.PI) / 180;
      // Đường bay xa dài vượt hẳn mép giấy bay lửng ra màn hình (bán kính từ 320px đến 680px)
      const dist = Math.random() * 360 + 320;
      const size = Math.floor(Math.random() * 18) + 14; // random to nhỏ 14px -> 31px
      const types = ['star4', 'star5', 'sparkle'];
      return {
        id: i,
        angle: angle,
        ex: Math.cos(rad) * dist + (Math.random() - 0.5) * 80,
        ey: Math.sin(rad) * dist + (Math.random() - 0.5) * 80,
        size: size,
        type: types[i % 3],
        color: ['#FDE68A', '#FBBF24', '#FFF', '#F43F5E', '#EC4899', '#D4AF37'][i % 6],
        delay: Math.random() * 0.45,
        duration: Math.random() * 0.6 + 2.2, // bay chong rải chậm rãi qua suốt 2.5s
      };
    }), []);

  // Cấu hình các dải tia sáng ma thuật lướt sượt rọi viết lời chúc khi bánh kem tan
  const writingParticles = useMemo(() =>
    Array.from({ length: 28 }).map((_, i) => {
      const angle = (i * 360) / 28;
      const rad = (angle * Math.PI) / 180;
      const startDist = Math.random() * 240 + 160;
      const targetX = (Math.random() - 0.5) * 370;
      const targetY = (Math.random() - 0.5) * 135;
      return {
        id: i,
        startX: Math.cos(rad) * startDist,
        startY: Math.sin(rad) * startDist,
        targetX,
        targetY,
        curveX: targetX + (Math.random() - 0.5) * 140,
        curveY: targetY + (Math.random() - 0.5) * 90,
        length: Math.random() * 60 + 30,
        angle: angle,
        color: ['#FDE68A', '#FBBF24', '#FFF', '#F43F5E', '#EC4899'][i % 5],
        size: Math.floor(Math.random() * 10) + 12,
        type: ['star4', 'star5', 'sparkle'][i % 3],
        delay: Math.random() * 1.1,
      };
    }), []);

  const decorativePhotos = useMemo(() =>
    [...CARD_IMAGES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3), []);

  // Ánh kim lơ lửng quanh phong bì lúc thư chưa mở (chỉ trang trí cho trạng thái sealed).
  const ambientSparkles = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.floor(Math.random() * 10) + 8,
      delay: Math.random() * 3.5,
      duration: Math.random() * 2.2 + 3,
      drift: (Math.random() - 0.5) * 26,
      type: ['star4', 'star5', 'sparkle'][i % 3],
      color: ['#FDE68A', '#FBBF24', '#F9A8D4', '#FFFFFF'][i % 4],
    })), []);

  const wishWords = useMemo(() => {
    let characterOffset = 0;

    return BIRTHDAY_WISH.split(' ').map((word, index) => {
      const characters = Array.from(word);
      const result = { id: index, characters, characterOffset };
      characterOffset += characters.length + 1;
      return result;
    });
  }, []);

  const handleBlow = () => {
    if (!allLit || isBlowing) return;
    clearScheduledTimers();
    setIsBlowing(true);
    setCandle2Lit(false);
    setCandle1Lit(false);

    // Bánh kem từ từ MẤT DẦN MÀU trong 3 GIÂY & đồng thời chia tan thành các tia sáng linh thiêng
    schedule(() => setPhase('cakeDissolving'), CAKE_DISSOLVE_DELAY_MS);

    // Sau khi bánh tan mờ rục, giữ nguyên thiệp và cho các tia sáng sà rọi múa Viết thành Lời chúc từ từ
    schedule(() => setPhase('lightRaysWritingWish'), WISH_WRITING_DELAY_MS);
  };

  useEffect(() => {
    if (phase === 'lightRaysWritingWish') {
      setRevealComplete(false);
      const timerId = window.setTimeout(() => setRevealComplete(true), WISH_REVEAL_DURATION_MS);
      return () => window.clearTimeout(timerId);
    }
    return undefined;
  }, [phase]);

  const isSealed = phase === 'sealed';
  // Phong bì luôn hiển thị: sau khi mở nó không biến mất mà dạt lên góc trên bên phải.
  const isEnvelopeVisible = true;
  // Từ lúc thư trồi lên, phong bì được "đậu" chéo ở góc trên phải cạnh lá thư.
  const isEnvelopeParked = ['letterRising', 'envelopeShrinking', 'paperResizing', 'textDissolveAndStars', 'starsToCake', 'cakeInteractive', 'cakeDissolving', 'lightRaysWritingWish'].includes(phase);
  const isTextVisible = ['sealed', 'flapOpening', 'letterRising', 'envelopeShrinking', 'paperResizing', 'textDissolveAndStars'].includes(phase);
  const isDissolving = phase === 'textDissolveAndStars';
  const isPaperExpanded = ['paperResizing', 'textDissolveAndStars', 'starsToCake', 'cakeInteractive', 'cakeDissolving', 'lightRaysWritingWish'].includes(phase);
  const isStarsFlyingIn = phase === 'starsToCake';
  const isCakePresent = ['starsToCake', 'cakeInteractive', 'cakeDissolving'].includes(phase);
  const isCakeDissolving = phase === 'cakeDissolving';
  const isWritingWish = phase === 'lightRaysWritingWish';

  const prompt = () => {
    if (isBlowing || allLit || isWritingWish) return null;
    if (candle2Lit || candle1Lit) return `Giờ hãy chạm vào nến số ${candle2Lit ? '1' : '2'} nữa nhé!`;
    return 'Chạm vào nến số 2 hoặc số 1 để thắp sáng nhé!';
  };

  // Component Nến & Ngọn lửa 3D: Đồng bộ tuyệt đối, trục kiềng 3 chân không lệch!
  const CandleNumber = ({ num, lit, onLight }) => (
    <div
      className={`relative inline-flex flex-col items-center justify-end select-none px-1 ${!lit && !isBlowing && phase === 'cakeInteractive' ? 'cursor-pointer' : ''}`}
      onClick={() => !lit && !isBlowing && phase === 'cakeInteractive' && onLight()}
      style={{ willChange: 'transform' }}
    >
      {/* Trụ điều tiết trục Flame & Bấc than */}
      <div className="relative flex flex-col items-center justify-end h-10 w-full mb-0.5 pointer-events-none">
        <AnimatePresence>
          {lit && !isBlowing && (
            <motion.div
              className="relative z-20 flex flex-col items-center justify-end"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="absolute -inset-5 bg-amber-400/30 rounded-full blur-xl animate-pulse pointer-events-none" />

              <motion.div
                className="relative origin-bottom shadow-[0_0_16px_#F59E0B,0_0_28px_rgba(245,158,11,0.55)]"
                style={{
                  width: '15px',
                  height: '27px',
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  background: 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, #FDE047 28%, #F59E0B 72%, #EA580C 100%)',
                  marginBottom: '-2px',
                }}
                animate={{
                  scaleY: [1, 1.07, 0.95, 1.05, 1],
                  rotate: [-2, 2, -1.5, 2, 0],
                  scaleX: [0.98, 1.04, 0.98, 1],
                }}
                transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
              >
                <div
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full opacity-90"
                  style={{ width: '5.5px', height: '8px', background: 'radial-gradient(circle, #E0F2FE 0%, #60A5FA 85%, transparent 100%)' }}
                />
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-white rounded-full blur-[0.5px] opacity-90" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {isBlowing && (
          <motion.span
            className="absolute bottom-1 text-lg pointer-events-none"
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -22, scale: 1.3 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            💨
          </motion.span>
        )}

        <div
          className="rounded-t-sm shadow-inner shrink-0"
          style={{
            width: '3.5px',
            height: '11px',
            background: 'linear-gradient(to top, #404040 0%, #1A1A1A 65%, #000000 100%)',
            zIndex: 5,
          }}
        />
      </div>

      <span
        className={`text-5xl md:text-6xl font-black font-sans block leading-none transition-transform duration-200 ${!lit && !isBlowing && phase === 'cakeInteractive' ? 'hover:scale-110 active:scale-95' : ''}`}
        style={{ color: '#F472B6', textShadow: '0 1px 0 #EC4899, 0 2px 0 #DB2777, 0 3px 0 #BE185D, 0 4px 0 #9D174D, 0 6px 12px rgba(0,0,0,0.22)' }}
      >
        {num}
      </span>
    </div>
  );

  // Helper render Ngôi sao thật (SVG Authentic Star Icons) với 3 dạng dáng
  const renderStarIcon = (type, color, size) => {
    if (type === 'star4') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
          <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" />
        </svg>
      );
    }
    if (type === 'sparkle') {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
          <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z M12 6 L13 11 L18 12 L13 13 L12 18 L11 13 L6 12 L11 11 Z" />
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
        <path d="M12 1.5 L15.2 8.2 L22.5 9.2 L17 14.2 L18.5 21.5 L12 17.8 L5.5 21.5 L7 14.2 L1.5 9.2 L8.8 8.2 Z" />
      </svg>
    );
  };

  return (
    <div className="relative min-h-[100dvh] w-full p-3 md:p-6 z-10 select-none overflow-hidden perspective-1000">

      {/* Ánh kim lơ lửng nền cho khung thư chưa mở */}
      <AnimatePresence>
        {isSealed && (
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {ambientSparkles.map((sp) => (
              <motion.div
                key={`ambient-${sp.id}`}
                className="absolute"
                style={{ left: `${sp.x}%`, top: `${sp.y}%`, willChange: 'transform, opacity' }}
                animate={{ opacity: [0, 0.9, 0], y: [0, sp.drift, 0], scale: [0.6, 1.1, 0.6] }}
                transition={{ duration: sp.duration, delay: sp.delay, repeat: Infinity, ease: 'easeInOut' }}
              >
                {renderStarIcon(sp.type, sp.color, sp.size)}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cụm tiêu đề hướng dẫn khi thư chưa mở */}
      <AnimatePresence>
        {isSealed && (
          <motion.div
            className="absolute inset-x-0 top-[calc(50%_-_268px)] z-30 flex flex-col items-center px-4 text-center pointer-events-none"
            initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7 }}
          >

            <h1
              className="mt-3 font-script text-4xl md:text-6xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-amber-300 drop-shadow-[0_2px_12px_rgba(251,191,36,0.35)]"
            >
              Một bức thư đặc biệt
            </h1>
            
          </motion.div>
        )}
      </AnimatePresence>

      {/* Khung neo định tuyến phong bì */}
      <div className="absolute inset-0 flex items-center justify-center w-full pointer-events-none">
        
        {/* ═══════════════════════════════════════════════════════════════════════════════════════
            TRANG GIẤY KỲ DIỆU DUY NHẤT (THE CONTINUOUS PAPER SHEET - Chuẩn 60FPS)
            Phóng to đồng bộ 2 chiều nhẹ nhàng, mượt không trôi dính gập!
        ═══════════════════════════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="rounded-3xl overflow-visible origin-center relative flex flex-col items-center justify-center pointer-events-auto"
          style={{
            zIndex: (phase === 'letterRising' || phase === 'envelopeShrinking' || phase === 'paperResizing' || isDissolving || isPaperExpanded) ? 60 : 4,
            background: 'radial-gradient(circle at 35% 25%, #FFFDF9 0%, #FBF6EB 55%, #F3ECDC 100%)',
            willChange: 'transform, width, height, box-shadow',
            boxShadow: isPaperExpanded
              ? '0 32px 70px -15px rgba(40, 15, 5, 0.55), 0 15px 35px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.45), inset 0 2px 5px rgba(255, 255, 255, 0.95), inset 0 -4px 8px rgba(140, 90, 30, 0.28)'
              : '0 20px 45px -10px rgba(40, 15, 5, 0.4), inset 0 0 0 1px rgba(200,160,60,0.3), 0 8px 32px rgba(120,80,20,0.22), inset 0 2px 3px rgba(255,255,255,0.8)',
          }}
          animate={{
            width: isPaperExpanded ? 'min(93vw, 680px)' : 'min(87vw, 420px)',
            height: isPaperExpanded ? 'min(610px, calc(100dvh - 32px))' : '300px',
            opacity: phase === 'sealed' ? 0 : (phase === 'flapOpening' ? 0.65 : 1),
            // The sheet grows from the center rather than travelling upward from the envelope.
            y: 0,
            scale: phase === 'sealed' ? 0.86 : (phase === 'flapOpening' ? 0.89 : (phase === 'letterRising' ? 1.05 : ((phase === 'envelopeShrinking' && !isPaperExpanded) ? 1.25 : 1))),
            rotateZ: phase === 'letterRising' ? 1.2 : ((phase === 'envelopeShrinking' && !isPaperExpanded) ? -0.5 : 0),
            rotateX: phase === 'letterRising' ? 8 : 0,
          }}
          transition={{
            // Phóng to 1.5s đồng thời ngang & dọc, tuyệt đối không co móp từng cạnh!
            width: { duration: isPaperExpanded ? 1 : 0.6, ease: SMOOTH_EASE },
            height: { duration: isPaperExpanded ? 1 : 0.6, ease: SMOOTH_EASE },
            default: { duration: isPaperExpanded ? 1 : 0.6, ease: SMOOTH_EASE }
          }}
        >
          {/* Lớp óng mượt trên cùng */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none z-0 rounded-3xl overflow-hidden" />

          {/* 4 Huy hiệu hoa văn vintage gốc bám 4 góc */}
          <svg className="absolute top-3.5 left-3.5 opacity-40 z-10 transition-transform duration-1000" style={{ transform: isPaperExpanded ? 'scale(1.2)' : 'scale(1)' }} width="32" height="32" viewBox="0 0 28 28" fill="none">
            <path d="M2 2 L2 14 Q2 2 14 2 Z" stroke="#A67B32" strokeWidth="1.2" fill="none" />
            <path d="M2 2 Q8 8 14 2" stroke="#A67B32" strokeWidth="0.8" fill="none" />
            <circle cx="5" cy="5" r="1.5" fill="#A67B32" opacity="0.7" />
          </svg>
          <svg className="absolute top-3.5 right-3.5 opacity-40 z-10 transition-transform duration-1000 scale-x-[-1]" style={{ transform: isPaperExpanded ? 'scale(-1.2, 1.2)' : 'scale(-1, 1)' }} width="32" height="32" viewBox="0 0 28 28" fill="none">
            <path d="M2 2 L2 14 Q2 2 14 2 Z" stroke="#A67B32" strokeWidth="1.2" fill="none" />
            <path d="M2 2 Q8 8 14 2" stroke="#A67B32" strokeWidth="0.8" fill="none" />
            <circle cx="5" cy="5" r="1.5" fill="#A67B32" opacity="0.7" />
          </svg>
          <svg className="absolute bottom-3.5 left-3.5 opacity-40 z-10 transition-transform duration-1000 scale-y-[-1]" style={{ transform: isPaperExpanded ? 'scale(1.2, -1.2)' : 'scale(1, -1)' }} width="32" height="32" viewBox="0 0 28 28" fill="none">
            <path d="M2 2 L2 14 Q2 2 14 2 Z" stroke="#A67B32" strokeWidth="1.2" fill="none" />
            <path d="M2 2 Q8 8 14 2" stroke="#A67B32" strokeWidth="0.8" fill="none" />
            <circle cx="5" cy="5" r="1.5" fill="#A67B32" opacity="0.7" />
          </svg>
          <svg className="absolute bottom-3.5 right-3.5 opacity-40 z-10 transition-transform duration-1000 scale-[-1]" style={{ transform: isPaperExpanded ? 'scale(-1.2, -1.2)' : 'scale(-1)' }} width="32" height="32" viewBox="0 0 28 28" fill="none">
            <path d="M2 2 L2 14 Q2 2 14 2 Z" stroke="#A67B32" strokeWidth="1.2" fill="none" />
            <path d="M2 2 Q8 8 14 2" stroke="#A67B32" strokeWidth="0.8" fill="none" />
            <circle cx="5" cy="5" r="1.5" fill="#A67B32" opacity="0.7" />
          </svg>

          {/* Viền đôi dập nổi */}
          <div className="absolute inset-4 rounded-2xl pointer-events-none border border-amber-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] z-0 transition-all duration-1000 overflow-hidden" style={{ inset: isPaperExpanded ? '18px' : '14px' }} />
          <div className="absolute inset-5 rounded-xl pointer-events-none z-0 transition-all duration-1000 overflow-hidden" style={{ border: '1px dashed rgba(170,120,40,0.35)', inset: isPaperExpanded ? '24px' : '18px' }} />

          {/* Sóng thớ giấy kem cổ điển */}
          <div 
            className="absolute inset-0 opacity-[0.035] pointer-events-none z-0 rounded-3xl overflow-hidden" 
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 18px, #8B6020 18px, #8B6020 19px)' }} 
          />

          {/* ─── NỘI DUNG 1: CHỮ LÁ THƯ (PHÓNG TO CÙNG GIẤY) -> TỪ TỪ MẤT MÀU NHẸ NHÀNG TRONG 2.5S ─── */}
          <AnimatePresence>
            {isTextVisible && (
              <motion.div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-8 gap-3 my-auto pointer-events-none"
                initial={{ opacity: 1, filter: 'grayscale(0%) blur(0px)' }}
                animate={{ 
                  // Mất màu từ từ êm ru suốt 2.5 giây, chuyển sang vàng kim nhạt khói rồi tan hòa vào mặt giấy
                  opacity: isDissolving ? [1, 0.75, 0.35, 0] : 1, 
                  scale: isDissolving ? 1.05 : 1,
                  filter: isDissolving ? ['grayscale(0%) blur(0px)', 'grayscale(60%) blur(1px)', 'grayscale(100%) blur(5px)'] : 'grayscale(0%) blur(0px)' 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: isDissolving ? 2.5 : 0.8, ease: "easeInOut" }}
                style={{ willChange: 'transform, opacity, filter' }}
              >
                <p
                  className="font-script font-bold tracking-wide leading-tight px-2"
                  style={{ 
                    fontSize: isPaperExpanded ? 'clamp(1.7rem, 4.5vw, 2.4rem)' : 'clamp(1.25rem, 4.2vw, 1.85rem)', 
                    color: isDissolving ? '#E2E8F0' : '#B53344',
                    textShadow: isDissolving ? '0 0 20px rgba(251,191,36,0.85), 0 0 32px rgba(255,255,255,0.95)' : '0 1px 1px rgba(255,255,255,0.9), 0 -1px 1px rgba(110,20,30,0.4)',
                    transition: 'all 1.5s cubic-bezier(0.22,1,0.36,1)'
                  }}
                >
                  Gửi Kim Phụng ❤️
                </p>
                <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-700/30 to-transparent my-0.5 transition-all duration-[1500ms]" />
                <p className="font-sans text-xs md:text-sm font-normal tracking-[0.18em] uppercase transition-colors duration-[2500ms]" style={{ color: isDissolving ? '#CBD5E1' : '#8A5D2A', textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}>
                  Điều bất ngờ bên trong...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HIỆU ỨNG 2.5S: MẤT MÀU -> ĐÚNG 21 NGÔI SAO THẬT VỚI VỆT ĐUÔI SÁNG BAY LẠC KHỎI TRANG GIẤY RA NGOÀI MÀN HÌNH */}
          <AnimatePresence>
            {isDissolving && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 overflow-visible">
                {authentic21Stars.map((st) => (
                  <motion.div
                    key={`star-${st.id}`}
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{ willChange: 'transform, opacity' }}
                    initial={{ x: 0, y: 0, rotate: st.angle, opacity: 0, scale: 0.2 }}
                    animate={{ 
                      x: [0, st.ex * 0.45, st.ex], 
                      y: [0, st.ey * 0.45, st.ey], 
                      rotate: [st.angle, st.angle + 180, st.angle + 360], 
                      opacity: [0, 1, 1, 0], 
                      scale: [0.2, 1.4, 1, 0.4] 
                    }}
                    transition={{ duration: st.duration, ease: "easeInOut", delay: st.delay }}
                  >
                    {/* VỆT ĐUÔI SÁNG (COMET LIGHT TRAIL) KÉO DÀI SAU NGÔI SAO */}
                    <div 
                      className="absolute right-1/2 -z-10 origin-right rounded-full opacity-75"
                      style={{
                        width: `${st.size * 3.2}px`,
                        height: '2px',
                        background: `linear-gradient(270deg, ${st.color} 0%, rgba(255,255,255,0.6) 40%, transparent 100%)`,
                        transform: 'rotate(180deg)',
                        filter: `drop-shadow(0 0 4px ${st.color})`
                      }} 
                    />
                    {/* ICON NGÔI SAO THẬT TO NHỎ RANDOM */}
                    {renderStarIcon(st.type, st.color, st.size)}
                  </motion.div>
                ))}

                {/* Hoàn toàn KHÔNG CÓ cái vòng tròn hồng/vàng lớn nào ở đây theo yêu cầu */}
              </div>
            )}
          </AnimatePresence>

          {/* ─── NỘI DUNG 2: 21 NGÔI SAO TỪ KHẮP MÀN HÌNH BAY NGOẮT HỘI TỤ TẠO BÁNH KEM ─── */}
          <AnimatePresence>
            {isStarsFlyingIn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 overflow-visible">
                {authentic21Stars.map((st) => (
                  <motion.div
                    key={`in-star-${st.id}`}
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{ willChange: 'transform, opacity' }}
                    initial={{ x: st.ex, y: st.ey, rotate: st.angle + 180, opacity: 0.9, scale: 0.8 }}
                    animate={{ 
                      x: [st.ex, st.ex * 0.35, 0], 
                      y: [st.ey, st.ey * 0.35, 30], 
                      rotate: [st.angle + 180, st.angle + 360, st.angle + 540], 
                      opacity: [0.9, 1, 1], 
                      scale: [0.8, 1.5, 0] 
                    }}
                    transition={{ duration: 1.6, ease: "easeInOut", delay: st.delay * 0.5 }}
                  >
                    {renderStarIcon(st.type, st.color, st.size * 1.2)}
                  </motion.div>
                ))}

                {/* Ánh chớp ngọc trai mỏng thanh khiêt nổ bừng lúc 21 ngôi sao va chạm sinh Bánh Kem */}
              </div>
            )}
          </AnimatePresence>

          {/* KHUNG TIỆC SINH NHẬT TRÊN TỜ GIẤY LỚN (Bánh Kem Cao Thon -> Tia Sáng Viết Lời Chúc) */}
          <AnimatePresence>
            {(isCakePresent || isWritingWish || revealComplete) && (
              <div className="relative z-30 w-full h-full flex flex-col items-center justify-between px-5 py-6 md:px-8 md:py-8 min-h-0">
                
                {/* Title Tiệc */}
                {!isWritingWish && !revealComplete && (
                <div className="w-full text-center flex flex-col items-center justify-start mt-2 md:mt-3 mb-1">
                  <motion.div
                    initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="w-full"
                  >
                    <span className="inline-block text-xs md:text-sm font-sans font-bold uppercase tracking-widest text-amber-700 bg-amber-100/80 px-3.5 py-1 rounded-full border border-amber-300/70 shadow-sm">
                      🎉 Happy Birthday 🎉
                    </span>
                    <h2 className="font-sans text-3xl md:text-4xl text-rose-600 font-extrabold mt-2 tracking-wide drop-shadow-sm">Kim Phụng</h2>
                  </motion.div>

                  {/* Khoảng trống rộng giúp chỉ dẫn không cấn chèn nến */}
                  <div className="min-h-[42px] flex items-center justify-center mt-2.5 mb-5">
                    <AnimatePresence mode="wait">
                      {prompt() && (
                        <motion.p key="inst" className="text-amber-900/90 bg-amber-50/80 px-4 py-1.5 rounded-xl border border-amber-200/60 text-sm md:text-base font-sans font-semibold flex items-center gap-2 shadow-sm"
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                          <Flame className="w-4.5 h-4.5 text-amber-500 animate-bounce" /><span>{prompt()}</span>
                        </motion.p>
                      )}
                      {allLit && !isBlowing && (
                        <motion.div key="wish-inst" className="px-5 py-2.5 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white rounded-2xl shadow-lg border border-white/20"
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                          <p className="text-sm md:text-base font-sans font-bold flex items-center gap-2 tracking-wide">
                            <Sparkles className="w-4.5 h-4.5 text-amber-200 animate-pulse" />"Hãy nhắm mắt và ước nguyện điều diệu kỳ..."<Sparkles className="w-4.5 h-4.5 text-amber-200 animate-pulse" />
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                )}

                {/* Vùng giữa trang: Bánh kem 3D (Cao Hơn & Nến Gần Nhau) / HOẶC Tia Sáng Viết Chúc */}
                <div className="relative flex-1 min-h-0 w-full flex flex-col items-center justify-center my-1">

                  {/* CHIẾC BÁNH KEM 3D CAO ĐẲNG CẤP (TỤ MẤT MÀU DẦN SUỐT 3 GIÂY KHI THỔI) */}
                  <AnimatePresence>
                    {isCakePresent && !isWritingWish && !revealComplete && (
                      <motion.div
                        className="relative z-30 pt-2"
                        style={{ willChange: 'transform, opacity, filter' }}
                        initial={{ scale: 0.2, opacity: 0, y: 40 }}
                        animate={
                          isCakeDissolving
                            /* 3 Giây Bánh Kem Tụ Mất Dần Màu, Phai Khói Ngọc và Tan Chia Tỏa Tia Sáng */
                            ? { scale: [1, 1.05, 0.9], opacity: [1, 0.7, 0.2, 0], filter: ['grayscale(0%) blur(0px)', 'grayscale(60%) brightness(1.4) blur(1px)', 'grayscale(100%) brightness(1.8) blur(5px)'] }
                            : { scale: 1, opacity: 1, y: 0, filter: 'grayscale(0%) brightness(1) blur(0px)' }
                        }
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: isCakeDissolving ? 3.0 : 1.0, ease: isCakeDissolving ? 'easeInOut' : 'easeOut' }}
                      >
                        <div className="perspective-800">
                          <div className="preserve-3d" style={{ transform: 'rotateX(-12deg)' }}>
                            
                            {/* Cắp 2 Cây Nến CÁCH GẦN NHAU HƠN THƯƠNG YÊU (gap-2.5 md:gap-3.5) */}
                            <div className="relative flex justify-center items-end gap-2.5 md:gap-3.5 mb-1 z-30">
                              <CandleNumber num="2" lit={candle2Lit} onLight={() => setCandle2Lit(true)} />
                              <CandleNumber num="1" lit={candle1Lit} onLight={() => setCandle1Lit(true)} />
                            </div>

                            {/* Tầng Trên (TOP TIER - Cho cao lên từ 48px -> 68px) */}
                            <div className="relative mx-auto z-20" style={{ width: '166px' }}>
                              <div className="w-full rounded-[50%] bg-gradient-to-b from-rose-100 to-rose-200 shadow-sm relative z-10" style={{ height: '16px' }} />
                              <div className="w-full bg-gradient-to-r from-rose-400/75 via-rose-300 to-rose-400/75 relative overflow-hidden shadow-inner" style={{ height: '68px', marginTop: '-8px' }}>
                                <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-rose-500/50 to-transparent" />
                                <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-rose-500/50 to-transparent" />
                                <div className="flex items-center justify-center gap-3.5 h-full relative z-10 pt-2">
                                  <span className="text-amber-200/80 text-sm drop-shadow-sm">⭐</span>
                                  <span className="text-white/90 text-sm drop-shadow-sm">✨</span>
                                  <span className="text-amber-200/80 text-sm drop-shadow-sm">⭐</span>
                                </div>
                              </div>
                              <div className="w-full rounded-[50%] bg-gradient-to-b from-rose-300 to-rose-400 shadow-sm" style={{ height: '14px', marginTop: '-7px' }} />
                              <div className="absolute flex justify-around z-20 left-0 right-0" style={{ top: '10px' }}>
                                {[16, 22, 14, 19, 16, 22, 15].map((h, i) => (
                                  <div key={i} className="bg-white/85 rounded-b-full shadow-sm" style={{ width: '15px', height: `${h}px` }} />
                                ))}
                              </div>
                            </div>

                            {/* Tầng Dưới (BOTTOM TIER - Cho cao lên từ 65px -> 90px, phom thon sang trọng) */}
                            <div className="relative mx-auto z-10" style={{ width: '236px', marginTop: '-6px' }}>
                              <div className="w-full rounded-[50%] bg-gradient-to-b from-pink-200 to-pink-300 shadow-sm relative z-10" style={{ height: '18px' }} />
                              <div className="w-full bg-gradient-to-r from-pink-500/75 via-pink-400 to-pink-500/75 relative overflow-hidden shadow-md" style={{ height: '90px', marginTop: '-9px' }}>
                                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-pink-600/45 to-transparent" />
                                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-pink-600/45 to-transparent" />
                                <div className="absolute inset-x-4 h-[2px] bg-amber-300/60 rounded-full" style={{ top: '16px' }} />
                                <div className="absolute inset-x-4 h-[2px] bg-amber-300/60 rounded-full" style={{ bottom: '16px' }} />
                                <div className="absolute inset-0 flex items-center justify-center pt-1">
                                  <div className="px-5 py-1 bg-white/25 backdrop-blur-md rounded-full border border-white/40 shadow-inner">
                                    <span className="font-sans text-base md:text-lg font-extrabold text-white tracking-wider" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.25)' }}>Kim Phụng</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full rounded-[50%] bg-gradient-to-b from-pink-400 to-pink-500 shadow-sm" style={{ height: '16px', marginTop: '-8px' }} />
                              <div className="absolute flex justify-around z-20 left-1 right-1" style={{ top: '13px' }}>
                                {[14, 20, 12, 17, 14, 20, 12, 17, 14].map((h, i) => (
                                  <div key={i} className="bg-rose-400/70 rounded-b-full shadow-sm" style={{ width: '13px', height: `${h}px` }} />
                                ))}
                              </div>
                            </div>

                            {/* Đế Bánh (Plate) */}
                            <div className="relative mx-auto z-0" style={{ width: '270px', marginTop: '-6px' }}>
                              <div className="w-full rounded-[50%] bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 shadow-xl border-t border-amber-200/60" style={{ height: '20px' }} />
                              <div className="w-full bg-gradient-to-b from-amber-500 to-amber-600" style={{ height: '9px', marginTop: '-5px', borderRadius: '0 0 5px 5px' }} />
                              <div className="w-full rounded-[50%] bg-gradient-to-b from-amber-600 to-amber-700" style={{ height: '7px', marginTop: '-4px' }} />
                            </div>
                            <div className="mx-auto rounded-[50%] bg-amber-950/22 blur-md" style={{ width: '220px', height: '13px', marginTop: '5px' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* HIỆU ỨNG 60FPS: BÁNH TAN THÀNH CÁC TIA SÁNG LƯỚT RỌI MÚA TRÊN GIẤY ĐỂ HÓA VIẾT THÀNH LỜI CHÚC TỪ TỪ */}
                  <AnimatePresence>
                    {isCakeDissolving && (
                      <motion.div
                        key="cake-dissolving-particles"
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 overflow-visible"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {writingParticles.map((particle) => (
                          <motion.div
                            key={`dissolve-particle-${particle.id}`}
                            className="absolute origin-left rounded-full pointer-events-none"
                            style={{
                              width: `${particle.length}px`,
                              height: '2.5px',
                              background: `linear-gradient(90deg, ${particle.color}, rgba(255,255,255,0.8), transparent)`,
                              boxShadow: `0 0 8px ${particle.color}, 0 0 16px #FFF`,
                              willChange: 'transform, opacity',
                            }}
                            initial={{ x: 0, y: 0, rotate: particle.angle, opacity: 0, scaleX: 0.2 }}
                            animate={{
                              x: [0, particle.startX],
                              y: [0, particle.startY],
                              rotate: [particle.angle, particle.angle + 35],
                              opacity: [0, 1, 0],
                              scaleX: [0.2, 1.45, 0.45],
                            }}
                            transition={{ duration: 2.7, ease: 'easeInOut', delay: particle.delay * 0.35 }}
                          >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2">
                              {renderStarIcon(particle.type, particle.color, particle.size)}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* THIỆP LỜI CHÚC - CÁC TIA SÁNG RỌI ĐẾN ĐÂU, CHỮ HỘI VÌ TỪ TỪ XUẤT HIỆN Ở ĐÓ TRN GIẤY TĨNH */}
                  <AnimatePresence>
                    {(isWritingWish || revealComplete) && (
                      <motion.div
                        className="absolute inset-x-3 top-8 bottom-[88px] mx-auto grid max-w-xl grid-rows-[108px_minmax(0,1fr)_76px] px-5 py-3 text-center z-50 overflow-hidden whitespace-normal break-words md:inset-x-8 md:top-10 md:bottom-[96px] md:grid-rows-[132px_minmax(0,1fr)_90px] md:px-8 md:py-4"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                      >
                        <div className="absolute inset-0 z-0 rounded-2xl bg-white/65 backdrop-blur-md border border-amber-300/60 shadow-[0_15px_35px_rgba(120,70,10,0.15)] pointer-events-none" />
                        <div className="absolute inset-0 z-10 rounded-2xl overflow-hidden bg-gradient-to-r from-amber-200/20 via-rose-100/30 to-amber-200/20 animate-pulse pointer-events-none" />

                        <div className="relative z-30 row-start-1 w-full overflow-hidden pointer-events-none" aria-hidden="true">
                          {/* Ruy băng luôn nằm đúng tâm trong vùng trang trí riêng. */}
                          <div className="absolute inset-x-0 top-0 flex justify-center">
                            <motion.div
                              className="relative h-12 w-36 md:h-14 md:w-44"
                              initial={{ opacity: 0, y: -12, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.65, delay: 0.15, type: 'spring' }}
                            >
                              <div className="absolute left-0 top-2 h-7 w-11 -skew-y-6 bg-gradient-to-r from-rose-800 to-rose-500 shadow-md [clip-path:polygon(0_0,100%_12%,86%_100%,0_78%,20%_50%)] md:h-8 md:w-14" />
                              <div className="absolute right-0 top-2 h-7 w-11 skew-y-6 bg-gradient-to-l from-rose-800 to-rose-500 shadow-md [clip-path:polygon(0_12%,100%_0,80%_50%,100%_78%,14%_100%)] md:h-8 md:w-14" />
                              <div className="absolute inset-x-5 top-0 flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-rose-200/70 bg-gradient-to-b from-rose-400 via-rose-600 to-rose-800 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-100 shadow-lg md:inset-x-6 md:h-10 md:text-[10px] md:tracking-[0.15em]">
                                Happy Birthday!
                              </div>
                            </motion.div>
                          </div>

                          {/* Ảnh chỉ nằm trong hàng trang trí nên không thể đè lên lời nhắn. */}
                          <motion.div
                            className="absolute right-0 top-9 h-16 w-24 md:right-1 md:top-10 md:h-[88px] md:w-36"
                            initial={{ opacity: 0, scale: 0.75, rotate: 8 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.7, delay: 0.25, type: 'spring' }}
                          >
                            {decorativePhotos.map((src, index) => (
                              <img
                                key={src}
                                src={src}
                                alt=""
                                className="absolute bottom-0 right-2 h-14 w-10 rounded-md border-2 border-white object-cover shadow-lg md:right-3 md:h-20 md:w-14"
                                style={{
                                  transformOrigin: '88% 100%',
                                  transform: `rotate(${(index - 1) * 24}deg)`,
                                  zIndex: index === 1 ? 3 : index + 1,
                                }}
                              />
                            ))}
                          </motion.div>
                        </div>

                        {isWritingWish && (
                          <div key="wish-writing-particles" className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-visible">
                            {writingParticles.map((particle) => (
                              <motion.div
                                key={`wish-particle-${particle.id}`}
                                className="absolute flex items-center justify-center"
                                style={{
                                  willChange: 'transform, opacity',
                                }}
                                initial={{ x: particle.startX, y: particle.startY, rotate: particle.angle, opacity: 0, scale: 0.35 }}
                                animate={{
                                  x: [particle.startX, particle.curveX, particle.targetX],
                                  y: [particle.startY, particle.curveY, particle.targetY],
                                  rotate: [particle.angle, particle.angle + 110, particle.angle + 160],
                                  opacity: [0, 1, 0.75, 0],
                                  scale: [0.35, 1.25, 0.55],
                                }}
                                transition={{ duration: 2.35, ease: 'easeInOut', delay: particle.delay * 0.55 }}
                              >
                                {renderStarIcon(particle.type, particle.color, particle.size)}
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        <div className="relative z-30 row-start-2 flex min-h-0 flex-col items-center justify-center overflow-hidden px-1">
                          {/* Khuôn lời chúc độc lập với ảnh và chân thiệp. */}
                          <p className="font-script text-base md:text-xl text-midnight-900 font-bold leading-relaxed md:leading-loose tracking-wide text-center">
                            {wishWords.map(({ id, characters, characterOffset }) => (
                              <span key={id} className="inline-block mr-1.5 md:mr-2 mb-1">
                                {characters.map((char, charIndex) => (
                                  <span key={`${id}-${charIndex}`} className="glow-char inline-block" style={{ '--reveal-delay': `${(characterOffset + charIndex) * WISH_CHARACTER_DELAY_MS}ms`, willChange: 'opacity, transform' }}>
                                    {char}
                                  </span>
                                ))}
                              </span>
                            ))}
                          </p>
                        </div>

                        {revealComplete && (
                          <motion.div
                            className="relative z-30 row-start-3 h-full w-full border-t border-amber-200/50 pt-1 md:pt-2"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                          >
                            {/* Bánh kem hai tầng nằm cùng hàng với lời chúc kết. */}
                            <motion.svg
                              className="absolute bottom-0 left-0 h-16 w-[78px] shrink-0 drop-shadow-lg pointer-events-none md:h-20 md:w-[98px]"
                              viewBox="0 0 110 92"
                              initial={{ opacity: 0, y: 10, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.6, type: 'spring' }}
                              aria-hidden="true"
                            >
                              <ellipse cx="55" cy="86" rx="47" ry="6" fill="#92400e" opacity="0.25" />
                              <path d="M12 58h86v23c0 8-86 8-86 0V58Z" fill="#f472b6" stroke="#be185d" strokeWidth="2" />
                              <ellipse cx="55" cy="58" rx="43" ry="9" fill="#fff7ed" stroke="#be185d" strokeWidth="2" />
                              <path d="M29 34h52v23c0 7-52 7-52 0V34Z" fill="#fbcfe8" stroke="#be185d" strokeWidth="2" />
                              <ellipse cx="55" cy="34" rx="26" ry="7" fill="#fff7ed" stroke="#be185d" strokeWidth="2" />
                              <path d="M30 37c7 7 11-2 17 2 6 4 10-4 16 0 6 4 10-3 17 0v8c-7-4-11 4-17 0-6-4-10 4-16 0-6-4-10 4-17-1V37Z" fill="#fef3c7" />
                              <rect x="51" y="14" width="8" height="21" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
                              <path d="M55 2c8 9 7 14 0 16-7-2-8-7 0-16Z" fill="#fb7185" />
                              <path d="M55 7c3 4 3 7 0 9-3-2-3-5 0-9Z" fill="#fde68a" />
                              <circle cx="31" cy="72" r="3" fill="#fff7ed" />
                              <circle cx="55" cy="75" r="3" fill="#f59e0b" />
                              <circle cx="79" cy="71" r="3" fill="#fff7ed" />
                            </motion.svg>
                            <p className="absolute right-0 top-1/2 max-w-[62%] -translate-y-1/2 text-right text-xs font-sans italic font-semibold text-amber-900/80 md:max-w-[70%] md:text-sm">
                              — Ngày sinh nhật vui vẻ —
                            </p>
                          </motion.div>
                        )}

                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Nút Tương Tác Chuyển Giai Đoạn */}
                <div className={`w-full flex items-center justify-center z-[60] min-h-[64px] mb-2 mt-4 ${isWritingWish || revealComplete ? 'absolute bottom-1 left-0 px-4' : ''}`}>
                  <AnimatePresence mode="wait">
                    {allLit && !isBlowing && (
                      <motion.button key="blow" onClick={handleBlow}
                        className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white rounded-full font-sans font-bold shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/30 relative overflow-hidden cursor-pointer"
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}>
                        <Wind className="w-5 h-5 text-amber-200 animate-pulse" /><span className="text-sm md:text-base tracking-wide">Thổi Nến Ngay 💨</span>
                        <div className="absolute inset-0 rounded-full border-2 border-amber-300/50 animate-ping opacity-25 pointer-events-none" />
                      </motion.button>
                    )}
                    {revealComplete && (
                      <motion.button key="next-gallery" onClick={onOpen}
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-midnight-900 via-purple-900 to-amber-700 text-amber-100 rounded-full font-sans font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-amber-400/50 glow-gold cursor-pointer"
                        initial={{ opacity: 0, y: 15, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
                        <span className="text-sm md:text-base tracking-wide">Khám Phá Không Gian Kỷ Niệm</span>
                        <ArrowRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1.5 transition-transform" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            )}
          </AnimatePresence>

          {/* Shadow râm ngả bóng bên dưới trang giấy */}
          <div className="absolute -bottom-2 left-[8%] right-[8%] h-6 pointer-events-none transition-opacity duration-700" style={{
            background: 'radial-gradient(ellipse at center, rgba(80,35,5,0.25) 0%, transparent 75%)',
            filter: 'blur(5px)',
            opacity: isPaperExpanded ? 0 : (phase === 'envelopeShrinking' ? 1 : 0.4),
          }} />
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            PHONG BÌ (ENVELOPE BODY) - Nằm bên dưới và thu nhỏ về background
        ═══════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isEnvelopeVisible && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
              style={{ zIndex: 20, pointerEvents: isSealed ? 'auto' : 'none' }}
              animate={
                isEnvelopeParked
                  ? {
                    scale: 0.34,
                    x: '30%',
                    y: '-34%',
                    rotate: 11,
                    opacity: 0.96,
                  }
                  : { scale: 1, x: 0, y: 0, rotate: 0, opacity: 1 }
              }
              exit={{ opacity: 0 }}
              transition={{ duration: isEnvelopeParked ? 1.25 : 0.7, ease: SMOOTH_EASE }}
            >
              <div className="relative w-full h-full" style={{ width: 'min(88vw, 430px)', height: 'min(63vw, 308px)' }}>
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(170deg, #EECF88 0%, #D4A84E 50%, #B57A28 100%)',
                    boxShadow: '0 12px 40px rgba(80,40,5,0.35), 0 2px 8px rgba(80,40,5,0.2)',
                    border: '1px solid rgba(230,195,120,0.4)',
                  }}
                />

                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 72" preserveAspectRatio="none">
                    <polygon points="0,0 50,45 0,72" fill="rgba(180,120,30,0.35)" />
                    <polygon points="100,0 50,45 100,72" fill="rgba(150,95,20,0.25)" />
                    <polygon points="0,72 50,45 100,72" fill="rgba(130,80,15,0.3)" />
                    <ellipse cx="50" cy="72" rx="30" ry="8" fill="rgba(255,220,120,0.08)" />
                  </svg>
                </div>

                <div className="absolute left-0 right-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '76%', zIndex: 3 }}>
                  <span className="font-sans text-xs md:text-sm font-medium tracking-widest uppercase" style={{ color: 'rgba(80,45,5,0.75)' }}>
                    ✦ <span className="font-bold" style={{ color: 'rgba(50,25,2,0.9)' }}>Gửi: Kim Phụng</span> ✦
                  </span>
                </div>

                <motion.div
                  className="absolute inset-x-0 top-0 preserve-3d"
                  style={{
                    height: '56%',
                    transformOrigin: 'top center',
                    clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                    zIndex: 10,
                  }}
                  animate={!isSealed ? { rotateX: 180 } : { rotateX: 0 }}
                  transition={{ duration: 0.85, ease: 'easeInOut' }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(175deg, #F0D590 0%, #D4A540 60%, #BF8C28 100%)' }} />
                  <div className="absolute inset-x-0 bottom-0 h-[2px] pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(100,60,10,0.3), transparent)' }} />
                </motion.div>

                <motion.div
                  className="absolute cursor-pointer"
                  style={{ top: 'calc(56% - 30px)', left: '50%', zIndex: 50, marginLeft: '-30px' }}
                  onClick={handleSealClick}
                  whileHover={isSealed ? { scale: 1.1 } : {}}
                  whileTap={isSealed ? { scale: 0.92 } : {}}
                  animate={isSealed ? { boxShadow: ['0 0 10px rgba(244,63,94,0.35)', '0 0 22px rgba(244,63,94,0.75)', '0 0 10px rgba(244,63,94,0.35)'] } : { boxShadow: '0 0 0 transparent' }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #F87171, #DC2626 50%, #991B1B)', border: '2px solid rgba(254,215,170,0.55)', boxShadow: '0 3px 12px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'repeating-radial-gradient(circle at 55% 45%, rgba(255,255,255,0.06) 0px, transparent 4px, rgba(0,0,0,0.05) 6px, transparent 8px)' }} />
                    <div style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(254,215,170,0.35)', background: 'rgba(120,20,20,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                      <span style={{ fontFamily: 'Montserrat, Inter, sans-serif', color: 'rgba(254,240,200,0.95)', fontSize: 13, fontWeight: 800, letterSpacing: 1, lineHeight: 1 }}>Mở</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
