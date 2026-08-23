"use client";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import RegisterModal from "./RegisterModal";
import Chatbot from "./Chatbot";
const floatingAnimation = {
    y: [0, -12, 0],
    transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut"
    }
};
import styles from "./Hero.module.css";
export default function Hero() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    return (
        <section className={styles.hero}>
            {/* ================= Background ================= */}

            <Image
                src="/images/Background.png"
                alt="Background"
                fill
                priority
                className={styles.background}
            />


            {/* ================= Hero Title ================= */}

            <motion.div
                className={styles.heroTitle}
                initial={{
                    opacity: 0,
                    scale: 0.7
                }}
                animate={{
                    opacity: 1,
                    scale: 1
                }}
                transition={{
                    delay: 0.8,
                    type: "spring",
                    stiffness: 120,
                    damping: 10
                }}
            >
                <Image
                    src="/images/Campus Quest.png"
                    alt="Campus Quest"
                    width={1050}
                    height={250}
                    priority
                    className={styles.titleImage}
                />
            </motion.div>


            {/* ================= Main Spider ================= */}

            <motion.div
                className={styles.spiderContainer}
                initial={{
                    scale: 0.2,
                    y: 120,
                    rotate: -8,
                    opacity: 0
                }}
                animate={{
                    scale: 1,
                    y: 0,
                    rotate: 0,
                    opacity: 1
                }}
                transition={{
                    delay: 1.5,
                    type: "spring",
                    stiffness: 90,
                    damping: 8,
                    mass: 0.8
                }}
            >
                <Image
                    src="/images/spiderman.png"
                    alt="Spider-Man"
                    width={350}
                    height={650}
                    priority
                    className={styles.spiderImage}
                />
            </motion.div>

            {/* ================= Version ================= */}

            <motion.div
                className={styles.versionContainer}
                initial={{
                    scale: 0,
                    opacity: 0
                }}
                animate={{
                    scale: 1,
                    opacity: 1
                }}
                transition={{
                    delay: 2.2,
                    type: "spring",
                    stiffness: 120,
                    damping: 10
                }}
            >
                <Image
                    src="/images/5.0.png"
                    alt="Campus Quest 5.0"
                    width={320}
                    height={140}
                    priority
                    className={styles.versionImage}
                />
            </motion.div>

            {!isRegistered && (
                <button
                    className={`${styles.registerBtn} ${styles.mobileRegister}`}
                    onClick={() => setShowRegister(true)}
                >
                    REGISTER
                </button>
            )}

            {/* ================= Hanging Spider ================= */}

            <div className={styles.hangingSpider}>
                <Image
                    src="/images/Ulta-Spiderman.png"   // Replace with your filename
                    alt="Hanging Spider"
                    width={60}
                    height={120}
                    priority
                    className={styles.hangingSpiderImage}
                />
            </div>

            {/* ================= Registration Modal ================= */}
            <RegisterModal
                isOpen={showRegister}
                onClose={() => setShowRegister(false)}
                onSuccess={() => setIsRegistered(true)}
            />

            <Chatbot />
        </section>
    );
}