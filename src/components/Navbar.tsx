"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegisterModal from "./RegisterModal";
import styles from "./Hero.module.css";

const SCROLL_THRESHOLD = 80;

const NAV_LINKS = [
  { label: "Home",       href: "/" },
  { label: "About",      href: "/#about" },
  { label: "Timeline",   href: "/#timeline" },
  { label: "Sponsors",   href: "/#sponsors" },
  { label: "Past Events",href: "/#pastevents" },
];

export default function Navbar() {
  const [showRegister, setShowRegister] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  // Ref-based hover-intent timer so moving from pill → panel doesn't flicker
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      // Only collapse on desktop
      const isDesktop = window.innerWidth > 1100;
      const past = window.scrollY > SCROLL_THRESHOLD && isDesktop;
      
      setScrolled(past);
      if (past) setMenuOpen(false);
      if (!past) setDropOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const openDrop  = () => { clearTimeout(closeTimer.current!); setDropOpen(true);  };
  const closeDrop = () => { closeTimer.current = setTimeout(() => setDropOpen(false), 120); };

  return (
    <>
      {/* ════════════════════════════════════════
          Full horizontal navbar — fades on scroll
          (kept in DOM so layout doesn't jump)
          ════════════════════════════════════════ */}
      <nav
        className={styles.navbar}
        style={{
          opacity: scrolled ? 0 : 1,
          pointerEvents: scrolled ? "none" : "auto",
          transition: "opacity 0.3s ease",
        }}
      >
        <motion.div
          className={styles.navbarContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.logo}>
            <Image src="/images/10x.png" alt="Logo" width={100} height={70} />
          </div>

          <ul className={styles.navLinks}>
            {NAV_LINKS.map((l) => (
              <li key={l.label} className={styles.navItem}>
                <Link href={l.href} className={styles.navLink}>{l.label}</Link>
              </li>
            ))}
          </ul>

          {!isRegistered && (
            <button
              className={`${styles.registerBtn} ${styles.desktopRegister}`}
              onClick={() => setShowRegister(true)}
            >
              REGISTER
            </button>
          )}

          <button
            className={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </motion.div>
      </nav>

      {/* ════════════════════════════════════════
          Collapsed state — desktop only
          Logo pill (top-left) + vertical dropdown
          ════════════════════════════════════════ */}
      <AnimatePresence>
        {scrolled && (
          <>
            {/* Logo pill */}
            <motion.div
              key="collapsed-logo"
              className={styles.collapsedLogo}
              onMouseEnter={openDrop}
              onMouseLeave={closeDrop}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <Image
                src="/images/10x.png"
                alt="10x Logo"
                width={52}
                height={38}
                className={styles.collapsedLogoImg}
              />
            </motion.div>

            {/* Vertical dropdown panel */}
            <AnimatePresence>
              {dropOpen && (
                <motion.div
                  key="vertical-nav"
                  className={styles.verticalNav}
                  onMouseEnter={openDrop}
                  onMouseLeave={closeDrop}
                  initial={{ opacity: 0, y: -10, scaleY: 0.9 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -10, scaleY: 0.9 }}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                  style={{ transformOrigin: "top left" }}
                >
                  {NAV_LINKS.map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      className={styles.verticalNavLink}
                      onClick={() => setDropOpen(false)}
                    >
                      {l.label}
                    </Link>
                  ))}

                  {!isRegistered && (
                    <>
                      <div className={styles.verticalNavDivider} />
                      <button
                        className={styles.verticalNavRegister}
                        onClick={() => { setDropOpen(false); setShowRegister(true); }}
                      >
                        REGISTER
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={() => setIsRegistered(true)}
      />

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && !scrolled && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className={styles.mobileMenuLinks}>
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
