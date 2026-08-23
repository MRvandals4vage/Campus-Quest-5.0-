"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Chatbot.module.css";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={styles.chatbotWrapper}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.chatbotModal}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <Image
                            src="/images/chatbot-bg.png"
                            alt="Chatbot Background"
                            fill
                            className={styles.chatBg}
                        />
                        
                        <div className={styles.modalHeader}>
                            <span>Campus Quest Bot</span>
                            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
                        </div>
                        
                        <div className={styles.modalBody}>
                            <div className={`${styles.chatMessage} ${styles.botMessage}`}>
                                Hey, I am EV
                            </div>
                            <div className={`${styles.chatMessage} ${styles.botMessage}`}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            </div>
                            <div className={`${styles.chatMessage} ${styles.userMessage}`}>
                                Lorem ipsum
                            </div>
                            <div className={`${styles.chatMessage} ${styles.botMessage}`}>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi commodo pretium mi, ac malesuada libero faucibus nec. Quisque tincidunt convallis semper. Donec ullamcorper,
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <div className={styles.chatInputWrapper}>
                                <input type="text" placeholder="Chat Here.." className={styles.chatInput} />
                                <button className={styles.sendBtn}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    className={styles.chatbotBtn}
                    onClick={() => setIsOpen(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 2.5 }}
                >
                    🕷️
                </motion.button>
            )}
        </div>
    );
}
