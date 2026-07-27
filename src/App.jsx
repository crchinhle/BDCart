import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StarryBackground from './components/StarryBackground';
import Scene1Envelope from './components/Scene1Envelope';
import Scene3SpaceGallery from './components/Scene3SpaceGallery';
import BackgroundMusic from './components/BackgroundMusic';

export default function App() {
  const [scene, setScene] = useState(1);

  return (
    <div className="relative min-h-screen w-full bg-[#0A0A1A] overflow-hidden">
      <StarryBackground scene={scene} />
      <BackgroundMusic />
      <main className="relative z-10 w-full min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {scene === 1 && (
            <motion.div key="s1-s2-unified" className="w-full min-h-screen flex flex-col"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Scene1Envelope onOpen={() => setScene(3)} />
            </motion.div>
          )}
          {scene === 3 && (
            <motion.div key="s3" className="w-full min-h-screen flex flex-col"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
              <Scene3SpaceGallery onRestart={() => setScene(1)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
