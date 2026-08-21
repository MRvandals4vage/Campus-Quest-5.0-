'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PastEvents.module.css';
import { getContainRect } from './geometry';
import type { PastEvent } from './pastEventsData';

const DEAD_ZONE = 0.24;
const SWITCH_COOLDOWN_MS = 1000;
const SWIPE_THRESHOLD_PX = 60;

const SWING_TRANSITION = {
  duration: 1.05,
  ease: [0.22, 1, 0.36, 1],
} as const;

interface ExpandedViewerProps {
  events: PastEvent[];
  index: number;
  onIndexChange: (next: number) => void;
  onRequestClose: () => void;
}

export default function ExpandedViewer({
  events,
  index,
  onIndexChange,
  onRequestClose,
}: ExpandedViewerProps) {
  const [direction, setDirection] = useState(1);
  const lastSwitchRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  // Compute the expanded frame size using the same getContainRect logic as the flight animation
  useEffect(() => {
    const updateSize = () => {
      const rect = getContainRect(window.innerWidth, window.innerHeight, events[index].aspect, 0.24);
      setFrameSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [index, events]);

  const goToIndex = useCallback(
    (next: number) => {
      if (next === index) return;
      setDirection(next > index ? 1 : -1);
      onIndexChange(next);
    },
    [index, onIndexChange],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastSwitchRef.current < SWITCH_COOLDOWN_MS) return;

      const nx = e.clientX / window.innerWidth - 0.5;

      if (nx > DEAD_ZONE && index < events.length - 1) {
        lastSwitchRef.current = now;
        goToIndex(index + 1);
      } else if (nx < -DEAD_ZONE && index > 0) {
        lastSwitchRef.current = now;
        goToIndex(index - 1);
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [index, events.length, goToIndex]);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0]?.clientX ?? null;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const startX = touchStartXRef.current;
      touchStartXRef.current = null;

      if (startX === null) return;

      const endX = e.changedTouches[0]?.clientX ?? startX;
      const dx = endX - startX;

      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;

      const now = performance.now();
      if (now - lastSwitchRef.current < SWITCH_COOLDOWN_MS) return;

      if (dx < 0 && index < events.length - 1) {
        lastSwitchRef.current = now;
        goToIndex(index + 1);
      } else if (dx > 0 && index > 0) {
        lastSwitchRef.current = now;
        goToIndex(index - 1);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [index, events.length, goToIndex]);

  const current = events[index];
  const enterX = direction > 0 ? '18vw' : '-18vw';
  const exitX = direction > 0 ? '-18vw' : '18vw';
  const enterRotateY = direction > 0 ? 68 : -68;
  const exitRotateY = direction > 0 ? -68 : 68;

  return (
    <div 
      className={styles.expandedStage}
      style={{
        // Override flex centering with explicit dimensions matching the flight animation
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        inset: 0,
      }}
    >
      <AnimatePresence
        custom={direction}
        mode="popLayout"
        initial={false}
      >
        <motion.div
          key={current.id}
          custom={direction}
          className={styles.expandedFrame}
          style={{
            aspectRatio: current.aspect,
            width: frameSize.width || 'auto',
            height: frameSize.height || 'auto',
            position: 'relative',
          }}
          initial={{
            opacity: 0,
            scale: 0.55,
            rotate: current.expandedRotate,
            rotateY: enterRotateY,
            x: enterX,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: current.expandedRotate,
            rotateY: 0,
            x: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.55,
            rotate: current.expandedRotate,
            rotateY: exitRotateY,
            x: exitX,
          }}
          transition={SWING_TRANSITION}
        >
          <Image
            src={current.image}
            alt={current.title}
            fill
            sizes="100vw"
            quality={100}
            className={styles.expandedImg}
            draggable={false}
            priority
          />
        </motion.div>
      </AnimatePresence>

      <p className={styles.expandedCaption}>
        {current.title}
      </p>

      <button
        type="button"
        className={styles.closeBtn}
        onClick={onRequestClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
