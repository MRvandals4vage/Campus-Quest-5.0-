"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegisterModal from "./RegisterModal";
import styles from "./Hero.module.css";

const SCROLL_THRESHOLD = 80;

export default function Navbar() {
  const [showRegister, setShowRegister] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > SCROLL_THRESHOLD;
      setScrolled(past);
      if (past) setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Full navbar — always in the DOM, hidden via opacity/pointer-events ── */}
      {/* Keep <nav> as a plain element so CSS transform: translateX(-50%) is never
          overwritten by Framer Motion. Only the inner content div is animated. */}
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
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.logo}>
            <Image src="/images/10x.png" alt="Logo" width={100} height={70} />
          </div>

          <ul className={styles.navLinks}>
            <li className={styles.navItem}>
              <Link href="/" className={styles.navLink}>Home</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/#about" className={styles.navLink}>About</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/#timeline" className={styles.navLink}>Timeline</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/#sponsors" className={styles.navLink}>Sponsors</Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/#pastevents" className={styles.navLink}>Past Events</Link>
            </li>
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

      {/* ── Collapsed logo pill (shown after scroll) ── */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            key="collapsed-logo"
            className={styles.collapsedLogo}
            aria-label="Scroll to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <Image
              src="/images/10x.png"
              alt="10x Logo"
              width={56}
              height={40}
              className={styles.collapsedLogoImg}
            />
          </motion.button>
        )}
      </AnimatePresence>

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={() => setIsRegistered(true)}
      />

      {/* Mobile dropdown — only when full nav is visible */}
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
              <li><Link href="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
              <li><Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link></li>
              <li><Link href="/#timeline" onClick={() => setMenuOpen(false)}>Timeline</Link></li>
              <li><Link href="/#sponsors" onClick={() => setMenuOpen(false)}>Sponsors</Link></li>
              <li><Link href="/#pastevents" onClick={() => setMenuOpen(false)}>Past Events</Link></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
