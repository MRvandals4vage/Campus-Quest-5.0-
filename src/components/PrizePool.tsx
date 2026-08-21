"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PrizePool() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !dialogRef.current) return;

    const container = containerRef.current;
    const dialog = dialogRef.current;

    // Set initial dialogue box state
    gsap.set(dialog, { opacity: 0, scale: 0.65, y: 40 });

    const ctx = gsap.context(() => {
      gsap.to(dialog, {
        scrollTrigger: {
          trigger: container,
          start: "top 50%", // start popup transition when PrizePool page top enters 50% of viewport
          toggleActions: "play none none reverse",
        },
        opacity: 1,
        scale: 1,
        y: 0,
        ease: "back.out(1.5)",
        duration: 0.65,
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden flex flex-col items-end justify-end pb-[8vh] pr-[8vw] pl-4 pt-20"
    >
      {/* Background Prizepool Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/assets/timeline/prizepool.png"
          alt="Prize Pool Background"
          className="w-full h-full object-cover"
        />
        {/* Subtle dark vignette overlay to make the dialogue popup highly legible */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(0,0,0,0.85) 100%)",
          }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content Dialogue Image Popup */}
      <div
        ref={dialogRef}
        className="relative z-20 max-w-[620px] w-[90%] mx-auto"
        style={{ opacity: 0 }}
      >
        <img
          src="/assets/timeline/Dialogue.png"
          alt="Prize Pool Dialogue"
          className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
        />
      </div>
    </section>
  );
}
