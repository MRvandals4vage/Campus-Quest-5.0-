'use client';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PastEvents.module.css';
import { pastEvents, type PastEvent } from './pastEventsData';
import { getContainRect, rectFromDom, type Rect } from './geometry';
import ExpandedViewer from './ExpandedViewer';



const EXPAND_TRANSITION = { duration: 1.15, ease: [0.22, 1, 0.36, 1] } as const;

interface HoverPreview {
  id: string;
  from: Rect;
  to: Rect;
  rotateFrom: number;
  rotateTo: number;
}

type GalleryPhase = 'opening' | 'open' | 'closing';

interface GalleryState {
  index: number;
  phase: GalleryPhase;
  travelFrom: Rect;
  travelTo: Rect;
  rotateFrom: number;
  rotateTo: number;
}

export default function PastEvents() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [hover, setHover] = useState<HoverPreview | null>(null);
  const [gallery, setGallery] = useState<GalleryState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'hover' | 'click'>('hover');
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setMode(window.innerWidth < 768 ? 'click' : 'hover');
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleHoverEnter = useCallback(
    (ev: PastEvent, el: HTMLElement) => {
      if (gallery) return;
      const sceneEl = sceneRef.current;
      if (!sceneEl) return;

      // Clear any pending hover exit timeouts
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

      const sceneRect = sceneEl.getBoundingClientRect();
      const cardRect = el.getBoundingClientRect();

      const from: Rect = {
        left: cardRect.left - sceneRect.left,
        top: cardRect.top - sceneRect.top,
        width: cardRect.width,
        height: cardRect.height,
      };
      const to = getContainRect(sceneRect.width, sceneRect.height, ev.aspect, 0.22);

      setHover({ id: ev.id, from, to, rotateFrom: ev.rotate, rotateTo: ev.expandedRotate });
    },
    [gallery],
  );

  // Debounce hover leave to prevent rapid flicker
  const handleHoverLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHover(null);
    }, 50); // Small debounce to prevent vibration from edge-hover
  }, []);

  const openCard = useCallback((index: number) => {
    const ev = pastEvents[index];
    const el = cardRefs.current[ev.id];
    const rect: Rect = el
      ? rectFromDom(el.getBoundingClientRect())
      : { left: window.innerWidth / 2 - 40, top: window.innerHeight / 2 - 40, width: 80, height: 80 };
    const target = getContainRect(window.innerWidth, window.innerHeight, ev.aspect, 0.24);

    setHover(null);
    setGallery({ index, phase: 'opening', travelFrom: rect, travelTo: target, rotateFrom: ev.rotate, rotateTo: ev.expandedRotate });
  }, []);

  const closeGallery = useCallback(() => {
    setGallery((s) => {
      if (!s) return s;
      const ev = pastEvents[s.index];
      const el = cardRefs.current[ev.id];
      const bigNow = getContainRect(window.innerWidth, window.innerHeight, ev.aspect, 0.24);
      const smallTarget = el ? rectFromDom(el.getBoundingClientRect()) : bigNow;
      return { index: s.index, phase: 'closing', travelFrom: bigNow, travelTo: smallTarget, rotateFrom: ev.expandedRotate, rotateTo: ev.rotate };
    });
  }, []);

  const changeIndex = useCallback((next: number) => {
    setGallery((s) => (s && s.phase === 'open' ? { ...s, index: next } : s));
  }, []);

  const handleFlightComplete = useCallback(() => {
    setGallery((s) => {
      if (!s) return s;
      if (s.phase === 'opening') return { ...s, phase: 'open' };
      if (s.phase === 'closing') return null;
      return s;
    });
  }, []);

  useEffect(() => {
    if (!gallery) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGallery();
        return;
      }
      if (gallery.phase !== 'open') return;
      if (e.key === 'ArrowRight' && gallery.index < pastEvents.length - 1) changeIndex(gallery.index + 1);
      if (e.key === 'ArrowLeft' && gallery.index > 0) changeIndex(gallery.index - 1);
    };

    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [gallery, closeGallery, changeIndex]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const hoverEvent = hover ? pastEvents.find((e) => e.id === hover.id) ?? null : null;
  const galleryEvent = gallery ? pastEvents[gallery.index] : null;

  return (
    <section id="pastevents" className={styles.scene} ref={sceneRef} aria-label="Past events">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet" />

      <div className={styles.bgWrap} aria-hidden="true">
        <picture>
          <source media="(max-width: 768px)" srcSet="/assets/Past%20events/bg-webs.png" />
          <img src="/assets/Past%20events/bg-spiderman-webs.png" alt="" className={styles.bgImg} style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, objectFit: 'cover', objectPosition: 'center' }} />
        </picture>
      </div>

      <div className={styles.foreground}>
        {/* web overlay removed as it's baked into background */}

        {pastEvents.map((ev, i) => {
          const isHoveredHere = hover?.id === ev.id;
          const isOpenHere = gallery !== null && gallery.index === i;
          
          // In mobile view (mode === 'click'), user wants polaroid 2 and 3 (i === 1 or 2) to have inverted rotation
          const invertRotation = mode === 'click' && (i === 1 || i === 2);
          const currentRotate = invertRotation ? -ev.rotate : ev.rotate;
          const currentClipRotate = invertRotation ? -ev.clipRotate : ev.clipRotate;

          return (
            <div
              key={ev.id}
              className={`${styles.cardWrap} ${styles[`card${i}`]}`}
              style={{ left: `${ev.left}%`, top: `${ev.top}%`, width: `${ev.width}%` } as CSSProperties}
            >
              <div
                className={styles.clipWrap}
                style={{
                  left: `calc(50% + ${ev.clipX}%)`,
                  top: `${ev.clipY}%`,
                  width: `${ev.clipWidth}vw`,
                  height: `${ev.clipHeight}vw`,
                  transform: `translateX(-50%) rotate(${currentClipRotate}deg)`,
                }}
              >
                <Image src="/assets/Past events/Clip.png" alt="" fill sizes="5vw" />
              </div>

              <button
                ref={(el) => {
                  cardRefs.current[ev.id] = el;
                }}
                type="button"
                className={styles.card}
                style={{
                  aspectRatio: ev.aspect,
                  transform: `rotate(${currentRotate}deg)`,
                  opacity: isHoveredHere || isOpenHere ? 0 : 1,
                  transition: 'opacity 0.28s ease',
                }}
                // hover mode: expand on hover/focus, no click behavior
                onMouseEnter={mode === 'hover' ? (e) => handleHoverEnter(ev, e.currentTarget) : undefined}
                onFocus={mode === 'hover' ? (e) => handleHoverEnter(ev, e.currentTarget) : undefined}
                // click mode: expand on click, no hover behavior
                onClick={mode === 'click' ? () => openCard(i) : undefined}
                aria-label={`View ${ev.title}`}
              >
                <div className={styles.cardImgWrap}>
                  <Image src={ev.image} alt={ev.title} fill sizes="12vw" className={styles.cardImg} />
                </div>
              </button>
            </div>
          );
        })}

        {/* Replaced Text with original PAST EVENTS image for consistency, but keeping text fallback just in case */}
        <div className={styles.title} style={{ transform: "translateX(-50%) scaleX(1)" }}>
          <Image src="/assets/Past events/PAST EVENTS.png" alt="PAST EVENTS" width={1400} height={200} style={{ width: "clamp(400px, 95vw, 1000px)", height: "auto" }} />
        </div>
      </div>

      {/* ================= HOVER MODE ONLY ================= */}
      {mode === 'hover' && (
        <>
          <AnimatePresence>
            {hover && (
              <motion.div
                className={styles.hoverBackdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hover && hoverEvent && (
              <motion.div
                key={hover.id}
                className={styles.hoverClone}
                initial={{
                  left: hover.from.left,
                  top: hover.from.top,
                  width: hover.from.width,
                  height: hover.from.height,
                  rotate: hover.rotateFrom,
                  opacity: 0.6,
                }}
                animate={{
                  left: hover.to.left,
                  top: hover.to.top,
                  width: hover.to.width,
                  height: hover.to.height,
                  rotate: hover.rotateTo,
                  opacity: 1,
                }}
                exit={{
                  left: hover.from.left,
                  top: hover.from.top,
                  width: hover.from.width,
                  height: hover.from.height,
                  rotate: hover.rotateFrom,
                  opacity: 0.5,
                }}
                transition={EXPAND_TRANSITION}
                onMouseLeave={handleHoverLeave}
                onAnimationComplete={(definition) => {
                  // Ensure clean state after exit completes
                  if (definition === 'exit') {
                    setHover(null);
                  }
                }}
              >
                <Image
                  src={hoverEvent.image}
                  alt={hoverEvent.title}
                  fill
                  sizes="100vw"
                  quality={100}
                  className={styles.hoverCloneImg}
                  draggable={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ================= CLICK MODE ONLY ================= */}
      {mode === 'click' &&
        mounted &&
        gallery &&
        galleryEvent &&
        createPortal(
          <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={`${galleryEvent.title} — past events gallery`}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeGallery();
            }}
          >
            {(gallery.phase === 'opening' || gallery.phase === 'closing') && (
              <motion.div
                className={styles.flightImage}
                initial={{
                  left: gallery.travelFrom.left,
                  top: gallery.travelFrom.top,
                  width: gallery.travelFrom.width,
                  height: gallery.travelFrom.height,
                  rotate: gallery.rotateFrom,
                }}
                animate={{
                  left: gallery.travelTo.left,
                  top: gallery.travelTo.top,
                  width: gallery.travelTo.width,
                  height: gallery.travelTo.height,
                  rotate: gallery.rotateTo,
                }}
                transition={EXPAND_TRANSITION}
                onAnimationComplete={handleFlightComplete}
              >
                <Image
                  src={galleryEvent.image}
                  alt={galleryEvent.title}
                  fill
                  sizes="100vw"
                  quality={100}
                  className={styles.flightImg}
                  draggable={false}
                  priority
                />
              </motion.div>
            )}

            {gallery.phase === 'open' && (
              <ExpandedViewer
                events={pastEvents}
                index={gallery.index}
                onIndexChange={changeIndex}
                onRequestClose={closeGallery}
              />
            )}
          </div>,
          document.body,
        )}
    </section>
  );
}
