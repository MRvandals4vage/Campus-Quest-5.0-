"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RegisterModal from "./RegisterModal";
import styles from "./Hero.module.css";

const SCROLL_THRESHOLD = 80; // px before collapsing

export default function Navbar() {
  const [showRegister, setShowRegister] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position
  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > SCROLL_THRESHOLD;
      setScrolled(past);
      // Auto-close mobile menu when collapsing
      if (past) setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ─── Collapsed state: floating logo pill ─── */}
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

      {/* ─── Full navbar (visible at top) ─── */}
      <AnimatePresence>
        {!scrolled && (
          <motion.nav
            key="full-nav"
            className={styles.navbar}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className={styles.navbarContent}>
              <div className={styles.logo}>
                <Image
                  src="/images/10x.png"
                  alt="Logo"
                  width={100}
                  height={70}
                />
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
            </div>
          </motion.nav>
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
              <li>
                <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
              </li>
              <li>
                <Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link>
              </li>
              <li>
                <Link href="/#timeline" onClick={() => setMenuOpen(false)}>Timeline</Link>
              </li>
              <li>
                <Link href="/#sponsors" onClick={() => setMenuOpen(false)}>Sponsors</Link>
              </li>
              <li>
                <Link href="/#pastevents" onClick={() => setMenuOpen(false)}>Past Events</Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
