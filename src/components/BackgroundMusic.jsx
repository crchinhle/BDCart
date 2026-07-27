import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const MELODY = [
  [261.63, 0.3], [261.63, 0.3], [293.66, 0.6], [261.63, 0.6], [349.23, 0.6], [329.63, 1.1],
  [261.63, 0.3], [261.63, 0.3], [293.66, 0.6], [261.63, 0.6], [392.0, 0.6], [349.23, 1.1],
  [261.63, 0.3], [261.63, 0.3], [523.25, 0.6], [440.0, 0.6], [349.23, 0.6], [329.63, 0.6], [293.66, 1.1],
  [466.16, 0.3], [466.16, 0.3], [440.0, 0.6], [349.23, 0.6], [392.0, 0.6], [349.23, 1.2],
];

const NOTE_GAP = 0.04;
const LOOP_GAP = 1.2;
const MUSIC_VOLUME = 0.25;

export default function BackgroundMusic() {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const mutedRef = useRef(false);
  const startedRef = useRef(false);

  const startMusic = useCallback(async () => {
    if (audioRef.current) {
      const { context, beginLoop } = audioRef.current;
      try {
        await context.resume();
        beginLoop();
        if (context.state === 'running') {
          startedRef.current = true;
          return true;
        }
      } catch {
        return false;
      }
      return false;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    const context = new AudioContext();
    const masterGain = context.createGain();
    masterGain.gain.value = mutedRef.current ? 0 : MUSIC_VOLUME;
    masterGain.connect(context.destination);

    const loopDuration = MELODY.reduce((total, [, duration]) => total + duration + NOTE_GAP, LOOP_GAP);

    const scheduleLoop = () => {
      const startAt = context.currentTime + 0.08;
      let cursor = startAt;

      MELODY.forEach(([frequency, duration]) => {
        const oscillator = context.createOscillator();
        const noteGain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        noteGain.gain.setValueAtTime(0, cursor);
        noteGain.gain.linearRampToValueAtTime(0.7, cursor + 0.025);
        noteGain.gain.exponentialRampToValueAtTime(0.001, cursor + duration);
        oscillator.connect(noteGain);
        noteGain.connect(masterGain);
        oscillator.start(cursor);
        oscillator.stop(cursor + duration + 0.03);
        cursor += duration + NOTE_GAP;
      });
    };

    const playback = { context, masterGain, intervalId: null, beginLoop: null };
    const beginLoop = () => {
      if (playback.intervalId !== null || context.state !== 'running') return;
      scheduleLoop();
      playback.intervalId = window.setInterval(scheduleLoop, loopDuration * 1000);
    };

    playback.beginLoop = beginLoop;
    audioRef.current = playback;
    try {
      await context.resume();
      beginLoop();
      if (context.state === 'running') {
        startedRef.current = true;
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, []);

  useEffect(() => {
    // Autoplay is attempted immediately; restricted browsers resume on first interaction.
    startMusic();
    let mounted = true;
    const startOnInteraction = async (event) => {
      // Let the sound button handle its own first interaction so it cannot
      // unlock audio on pointerdown and immediately mute it again on click.
      if (event.target instanceof Element && event.target.closest('[data-sound-toggle]')) return;
      const didStart = await startMusic();
      if (mounted && didStart) {
        window.removeEventListener('pointerdown', startOnInteraction, true);
        window.removeEventListener('keydown', startOnInteraction, true);
      }
    };
    // Capture the first interaction before scene handlers run. Keep the listeners until
    // the browser actually unlocks the AudioContext instead of consuming one failed try.
    window.addEventListener('pointerdown', startOnInteraction, true);
    window.addEventListener('keydown', startOnInteraction, true);

    return () => {
      mounted = false;
      window.removeEventListener('pointerdown', startOnInteraction, true);
      window.removeEventListener('keydown', startOnInteraction, true);
      if (audioRef.current) {
        if (audioRef.current.intervalId !== null) {
          window.clearInterval(audioRef.current.intervalId);
        }
        audioRef.current.context.close();
        audioRef.current = null;
      }
      startedRef.current = false;
    };
  }, [startMusic]);

  const toggleSound = async () => {
    if (!startedRef.current && !mutedRef.current) {
      setMuted(false);
      await startMusic();
      return;
    }

    const nextMuted = !muted;
    mutedRef.current = nextMuted;
    setMuted(nextMuted);

    if (!audioRef.current) {
      if (!nextMuted) await startMusic();
      return;
    }

    const { context, masterGain, beginLoop } = audioRef.current;
    if (!nextMuted && context.state !== 'running') {
      await context.resume().catch(() => {});
      beginLoop();
      startedRef.current = context.state === 'running';
    }
    masterGain.gain.cancelScheduledValues(context.currentTime);
    masterGain.gain.setTargetAtTime(nextMuted ? 0 : MUSIC_VOLUME, context.currentTime, 0.04);
  };

  const soundOff = muted;

  return (
    <button
      type="button"
      data-sound-toggle
      onClick={toggleSound}
      className="fixed right-4 top-4 md:right-6 md:top-6 z-[120] flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/40 bg-midnight-900/80 text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.25)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-amber-500 hover:text-midnight-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      aria-label={soundOff ? 'Bật nhạc nền' : 'Tắt nhạc nền'}
      title={soundOff ? 'Bật nhạc nền' : 'Tắt nhạc nền'}
    >
      {soundOff ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}
