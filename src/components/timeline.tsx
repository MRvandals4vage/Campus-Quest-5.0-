"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

/* ─────────────────────────────────────────────────────────
   Mobile phase data — building (with spidey) + card image
───────────────────────────────────────────────────────── */
const MOBILE_PHASES = [
  {
    id: 1,
    building: "/assets/timeline/Building 1 spiderman.png",
    card:     "/assets/timeline/Reg Starts.png",
    alt:      "Registration Starts",
    cardSide: "right" as const,
  },
  {
    id: 2,
    building: "/assets/timeline/Building2 spiderman.png",
    card:     "/assets/timeline/Reg Closes.png",
    alt:      "Registration Closes",
    cardSide: "left" as const,
  },
  {
    id: 3,
    building: "/assets/timeline/Building3 spiderman.png",
    card:     "/assets/timeline/Shortlisting.png",
    alt:      "Shortlisting",
    cardSide: "right" as const,
  },
  {
    id: 4,
    building: "/assets/timeline/Building4 spiderman.png",
    card:     "/assets/timeline/Event Day.png",
    alt:      "Event Day",
    cardSide: "left" as const,
  },
];

/* ─────────────────────────────────────────────────────────
   Spider-Man waypoints on the 1920-px canvas
───────────────────────────────────────────────────────── */
const WAYPOINTS = [
  { x: 320,  y: 530,  sitting: true,  scaleX:  1, rotate:  5 },
  { x: 960,  y: 980,  sitting: false, scaleX:  1, rotate:  0 },
  { x: 1330, y: 1250, sitting: true,  scaleX: -1, rotate: -5 },
  { x: 920,  y: 1490, sitting: false, scaleX: -1, rotate:  0 },
  { x: 350,  y: 1850, sitting: true,  scaleX:  1, rotate:  5 },
  { x: 960,  y: 2040, sitting: false, scaleX:  1, rotate:  0 },
  { x: 1360, y: 2340, sitting: true,  scaleX: -1, rotate:  0 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ─────────────────────────────────────────────────────────
   Mobile Phase Block — slides in on scroll
───────────────────────────────────────────────────────── */
function MobilePhase({
  building,
  card,
  alt,
  cardSide,
  delay = 0,
}: {
  building: string;
  card: string;
  alt: string;
  cardSide: "left" | "right";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateX(0) scale(1)"
          : `translateX(${cardSide === "right" ? "-60px" : "60px"}) scale(0.95)`,
        transition: `opacity 0.6s ease ${delay}ms, transform 0.65s cubic-bezier(0.34,1.4,0.64,1) ${delay}ms`,
      }}
    >
      {/* Building with Spider-Man */}
      <div style={{ position: "relative", width: "100%" }}>
        <Image
          src={building}
          alt={alt}
          width={800}
          height={600}
          className="w-full h-auto block"
          style={{ display: "block" }}
        />
      </div>

      {/* Phase card — overlaid at bottom, aligned to cardSide */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          ...(cardSide === "right"
            ? { right: "2%", left: "auto" }
            : { left: "2%", right: "auto" }),
          width: "55%",
          maxWidth: 320,
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.8))",
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(20px) scale(0.9)",
          transition: `transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${delay + 200}ms`,
        }}
      >
        <Image
          src={card}
          alt={alt}
          width={400}
          height={220}
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Timeline() {
  const [isMobile, setIsMobile] = useState(true); // mobile-first prevents black gap
  const [scale,    setScale]    = useState(1);
  const [vpH,      setVpH]      = useState(900);

  const sectionRef   = useRef<HTMLElement>(null);
  const zoomRef      = useRef<HTMLDivElement>(null);
  const fadeRef      = useRef<HTMLDivElement>(null);
  const dialogRef    = useRef<HTMLDivElement>(null);
  const spideyRef    = useRef<HTMLDivElement>(null);
  const spideyImgRef = useRef<HTMLImageElement>(null);
  const gsapCtxRef   = useRef<{ revert: () => void } | null>(null);

  const CANVAS_H = 4800;
  const BB_Y = 3017;
  const BB_X = 571;

  /* ── Resize handler ── */
  useEffect(() => {
    const handle = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setVpH(vh);
      setIsMobile(vw < 768);
      setScale(vw < 768 ? 1 : vw / 1920);
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  /* ── GSAP billboard zoom (desktop only) ── */
  useEffect(() => {
    if (isMobile) {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.killAll();
      });
      gsapCtxRef.current?.revert();
      gsapCtxRef.current = null;
      return;
    }

    let cleanupFn: (() => void) | null = null;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);

        const section = sectionRef.current;
        const zoom    = zoomRef.current;
        const fade    = fadeRef.current;
        const dialog  = dialogRef.current;
        if (!section || !zoom || !fade || !dialog) return;

        const ctx = gsap.context(() => {
          const compute = () => {
            const sf  = window.innerWidth / 1920;
            const vh  = window.innerHeight;
            const vw  = window.innerWidth;
            const startScroll = BB_Y * sf - vh / 2;
            const targetScale = Math.max(1920 / 890, (vh / vw) * (1920 / 474));
            return { sf, vh, vw, startScroll, targetScale };
          };

          gsap.set(zoom,   { scale: 1, x: 0 });
          gsap.set(fade,   { opacity: 1 });
          gsap.set(dialog, { opacity: 0, scale: 0.65, y: 40 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start:  () => `top+=${compute().startScroll}px top`,
              end:    () => `top+=${compute().startScroll + 1000}px top`,
              scrub: 1,
              pin: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                gsap.set(dialog, {
                  pointerEvents: self.progress > 0.8 ? "auto" : "none",
                });
              },
            },
          });

          tl.to(zoom, {
            scale: () => compute().targetScale,
            x:     () => window.innerWidth / 2 - BB_X * (window.innerWidth / 1920),
            ease: "power2.inOut",
            duration: 1,
          }, 0);

          tl.to(fade,   { opacity: 0, ease: "power2.inOut", duration: 0.6 }, 0);
          tl.to(dialog, { opacity: 1, scale: 1, y: 0, ease: "back.out(1.5)", duration: 0.35 }, 0.7);
        }, section);

        gsapCtxRef.current = ctx;
        cleanupFn = () => ctx.revert();
      }
    );

    return () => { cleanupFn?.(); };
  }, [isMobile, scale]);

  /* ── Spider-Man path scroll (desktop only) ── */
  const handleScroll = useCallback(() => {
    if (isMobile || !sectionRef.current) return;
    const rect    = sectionRef.current.getBoundingClientRect();
    const scrolled = Math.max(0, -rect.top);
    const canvasY  = scrolled / (scale || 1) + 300;

    let wp1 = WAYPOINTS[0], wp2 = WAYPOINTS[0], t = 0;

    if (canvasY >= WAYPOINTS[WAYPOINTS.length - 1].y) {
      wp1 = WAYPOINTS[WAYPOINTS.length - 1];
      wp2 = wp1; t = 1;
    } else {
      for (let i = 0; i < WAYPOINTS.length - 1; i++) {
        if (canvasY >= WAYPOINTS[i].y && canvasY <= WAYPOINTS[i + 1].y) {
          wp1 = WAYPOINTS[i]; wp2 = WAYPOINTS[i + 1];
          const dy = wp2.y - wp1.y;
          t = dy > 0 ? (canvasY - wp1.y) / dy : 0;
          break;
        }
      }
    }

    const cx  = lerp(wp1.x, wp2.x, t);
    const cy  = lerp(wp1.y, wp2.y, t);
    const rot = lerp(wp1.rotate, wp2.rotate, t);
    const jumping =
      !wp1.sitting && !wp2.sitting ? true :
       wp1.sitting &&  wp2.sitting ? false :
      !wp1.sitting ? t < 0.85 : t > 0.15;
    const sx = wp1.sitting ? (t > 0.8 ? wp2.scaleX : wp1.scaleX) : wp1.scaleX;

    const el  = spideyRef.current;
    const img = spideyImgRef.current;
    if (!el || !img) return;

    el.style.left      = `${cx}px`;
    el.style.top       = `${cy}px`;
    el.style.width     = jumping ? "305px" : "175px";
    el.style.height    = jumping ? "335px" : "171px";
    el.style.transform = `rotate(${rot}deg) scaleX(${sx})`;

    const src = jumping
      ? "/assets/timeline/jumping Spiderman.png"
      : "/assets/timeline/Sitting Spiderman.png";
    if (!img.src.endsWith(src)) img.src = src;
  }, [isMobile, scale]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* ─────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────── */
  return (
    <section
      id="timeline"
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        height: isMobile ? "auto" : `${BB_Y * scale + vpH / 2}px`,
        overflow: "hidden",
        background: "#000",
        color: "#fff",
        userSelect: "none",
        zIndex: 1,
        margin: 0,
        padding: 0,
      }}
    >

      {/* ══════════════════════════════════════════════════
          DESKTOP — animated 1920 px canvas
      ══════════════════════════════════════════════════ */}
      {!isMobile && (
        <div
          ref={zoomRef}
          style={{
            width: "100%",
            height: "100%",
            transformOrigin: `${BB_X * scale}px ${BB_Y * scale}px`,
          }}
        >
          {/* 1920 × 4800 canvas */}
          <div
            style={{
              position: "relative",
              width: "1920px",
              height: `${CANVAS_H}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              overflow: "hidden",
            }}
          >
            <div ref={fadeRef} style={{ position: "absolute", inset: 0 }}>

              {/* Background */}
              <img
                src="/assets/timeline/bg.png"
                alt=""
                style={{
                  position: "absolute", top: -37, left: -11,
                  width: 1942, height: CANVAS_H,
                  objectFit: "cover", opacity: 0.65,
                  filter: "blur(6px)", pointerEvents: "none", zIndex: 0,
                }}
              />

              {/* TIMELINE heading */}
              <img
                src="/assets/timeline/TIMELINE.png"
                alt="TIMELINE"
                style={{
                  position: "absolute", top: 96, left: 432,
                  width: 1056, height: 170, objectFit: "contain",
                  filter: "drop-shadow(6px 8px 4px rgba(86,85,85,0.48))",
                  pointerEvents: "none", zIndex: 30,
                }}
              />

              {/* ── Phase 1: Building 1 (left) + Reg Starts card ── */}
              <img src="/assets/timeline/building1.png" alt="Building 1"
                style={{ position:"absolute", top:500, left:-580, width:1350, height:"auto",
                  objectFit:"contain", zIndex:10, pointerEvents:"none", opacity:0.9 }} />
              <img src="/assets/timeline/Reg Starts.png" alt="Registration Starts"
                style={{ position:"absolute", top:530, left:900, width:700, height:"auto",
                  objectFit:"contain", zIndex:30, pointerEvents:"none",
                  filter:"drop-shadow(4px 6px 12px rgba(0,0,0,0.85))" }} />

              {/* ── Phase 2: Building 2 (right-flipped) + Reg Closes card ── */}
              <img src="/assets/timeline/building2.png" alt="Building 2"
                style={{ position:"absolute", top:1150, right:-450, width:1450, height:"auto",
                  objectFit:"contain", zIndex:10, pointerEvents:"none",
                  transform:"scaleX(-1)" }} />
              <img src="/assets/timeline/Reg Closes.png" alt="Registration Closes"
                style={{ position:"absolute", top:1200, left:300, width:700, height:"auto",
                  objectFit:"contain", zIndex:30, pointerEvents:"none",
                  filter:"drop-shadow(4px 6px 12px rgba(0,0,0,0.85))" }} />

              {/* ── Phase 3: Building 3 (left) + Shortlisting card ── */}
              <img src="/assets/timeline/building3.png" alt="Building 3"
                style={{ position:"absolute", top:1850, left:-550, width:1450, height:"auto",
                  objectFit:"contain", zIndex:10, pointerEvents:"none", opacity:0.9 }} />
              <img src="/assets/timeline/Shortlisting.png" alt="Shortlisting"
                style={{ position:"absolute", top:1900, left:1165, width:700, height:"auto",
                  objectFit:"contain", zIndex:30, pointerEvents:"none",
                  filter:"drop-shadow(4px 6px 12px rgba(0,0,0,0.85))" }} />

              {/* ── Phase 4: Building 4 (right-flipped) + Event Day card ── */}
              <img src="/assets/timeline/building4.png" alt="Building 4"
                style={{ position:"absolute", top:2250, right:-480, width:1750, height:"auto",
                  objectFit:"contain", zIndex:10, pointerEvents:"none",
                  transform:"scaleX(-1)" }} />
              <img src="/assets/timeline/Event Day.png" alt="Event Day"
                style={{ position:"absolute", top:2300, left:150, width:700, height:"auto",
                  objectFit:"contain", zIndex:30, pointerEvents:"none",
                  filter:"drop-shadow(4px 6px 12px rgba(0,0,0,0.85))" }} />

              {/* ── Building 5 (billboard bg) ── */}
              <img src="/assets/timeline/building5.png" alt="Building 5"
                style={{ position:"absolute", top:3000, left:-1000, width:2600, height:"auto",
                  objectFit:"contain", zIndex:10, pointerEvents:"none",
                  transform:"scaleX(-1)" }} />

              {/* ── Animated Spider-Man ── */}
              <div
                ref={spideyRef}
                style={{
                  position: "absolute",
                  left: `${WAYPOINTS[0].x}px`,
                  top:  `${WAYPOINTS[0].y}px`,
                  width: "175px",
                  height: "171px",
                  zIndex: 40,
                  pointerEvents: "none",
                }}
              >
                <img
                  ref={spideyImgRef}
                  src="/assets/timeline/Sitting Spiderman.png"
                  alt="Spider-Man"
                  style={{
                    width: "100%", height: "100%", objectFit: "contain",
                    filter: "drop-shadow(0 0 35px rgba(230,36,41,1))",
                  }}
                />
              </div>

            </div>{/* /fadeRef */}

            {/* ── Billboard + Prizepool (Outside fadeRef so it stays visible) ── */}
            <div
              id="prizepool"
              style={{
                position: "absolute", left: 86, top: 2500,
                width: 1030, height: 1030, zIndex: 20, pointerEvents: "none",
              }}
            >
              <img src="/assets/timeline/Billboard.png" alt="Billboard"
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%", objectFit: "contain",
                  filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.9))", zIndex: 10,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "6.8%", top: "27.2%",
                  width: "86.4%", height: "46%",
                  overflow: "hidden", zIndex: 20, background: "#000",
                }}
              >
                <img src="/assets/timeline/prizepool.png" alt="Prize Pool"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>

          </div>{/* /canvas */}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MOBILE — stacked component layout
      ══════════════════════════════════════════════════ */}
      {isMobile && (
        <div
          style={{
            width: "100%",
            background: "#000",
            margin: 0,
            padding: 0,
            display: "block",
          }}
        >
          <Image
            src="/assets/timeline/Timeline.svg"
            alt="Timeline"
            width={430}
            height={1205}
            style={{ width: "100%", height: "auto", display: "block" }}
            priority
          />
        </div>
      )}

      {/* ── GSAP Prize Pool Dialog overlay (desktop only) ── */}
      {!isMobile && (
        <div
          ref={dialogRef}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
            paddingBottom: "40vh", paddingRight: "8vw",
            pointerEvents: "none", opacity: 0,
          }}
        >
          <div style={{ maxWidth: 600, width: "90%", pointerEvents: "auto" }}>
            <img
              src="/assets/timeline/Dialogue.png"
              alt="Prize Pool Dialogue"
              style={{
                width: "100%", height: "auto", objectFit: "contain",
                filter: "drop-shadow(0 15px 45px rgba(0,0,0,0.85))",
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
