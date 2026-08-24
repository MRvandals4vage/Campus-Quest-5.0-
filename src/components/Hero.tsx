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
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: "1500px", transform: "translateY(-22%)" }}>
                    <Image
                        src="/images/campus.png"
                        alt="Campus"
                        width={900}
                        height={400}
                        priority
                        style={{
                            width: "63%",
                            height: "auto",
                            objectFit: "contain",
                            transform: "translateY(-15%)",
                            zIndex: 10
                        }}
                    />
                    <Image
                        src="/images/Quest.png"
                        alt="Quest"
                        width={900}
                        height={400}
                        priority
                        style={{
                            width: "63%",
                            height: "auto",
                            objectFit: "contain",
                            marginLeft: "-34%",
                            transform: "translateY(18%)",
                            zIndex: 20
                        }}
                    />
                </div>
            </motion.div>


            {/* ================= 5.0 ================= */}

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
                    style={{ width: "32%", maxWidth: "480px", transform: "translateY(30px)" }}
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