"use client";

import { motion, AnimatePresence } from "framer-motion";
import styles from "./ClosedPopup.module.css";

interface ClosedPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClosedPopup({ isOpen, onClose }: ClosedPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.card}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            {/* Close Button */}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Animated Lock Badge */}
            <motion.div
              className={styles.iconWrapper}
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 15 }}
            >
              <svg
                className={styles.lockSvg}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 10V8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V10"
                  stroke="#ff4d4d"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <rect
                  x="4"
                  y="10"
                  width="16"
                  height="12"
                  rx="3"
                  fill="#ff4d4d"
                />
                <circle cx="12" cy="15" r="1.5" fill="#1c1c20" />
                <path
                  d="M12 16.5V18.5"
                  stroke="#1c1c20"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* Content */}
            <h3 className={styles.title}>Registrations Closed</h3>
            <p className={styles.subtitle}>
              The registration portal for <strong>Campus Quest 5.0</strong> officially closed at <strong>12:00 AM IST</strong>.
            </p>

            <div className={styles.noticeBadge}>
              🕷️ Thank you for the overwhelming response!
            </div>

            <button className={styles.actionBtn} onClick={onClose}>
              Understood
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
