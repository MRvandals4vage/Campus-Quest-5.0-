"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Chatbot.module.css";

interface Message {
    sender: 'bot' | 'user';
    text: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: 'Hey, I am EV, your friendly neighborhood Spider-Bot! 🕷️🕸️' },
        { sender: 'bot', text: 'Ask me anything about Campus Quest 5.0, recruitment, or the Coding Ninjas 10X Club!' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isLoading, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;
        const text = inputValue.trim();
        setInputValue("");
        setMessages(prev => [...prev, { sender: 'user', text }]);
        setIsLoading(true);

        try {
            const res = await fetch("https://web-production-d0b819.up.railway.app/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: text,
                    session_id: sessionId || undefined
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch response");
            }

            const data = await res.json();
            if (data.response) {
                setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
            }
            if (data.session_id) {
                setSessionId(data.session_id);
            }
        } catch (error) {
            console.error("Chatbot API error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Oops, my web got tangled! Let me try climbing back up, please ask again in a moment. 🕷️🕸️" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

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
                            {messages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`${styles.chatMessage} ${msg.sender === 'bot' ? styles.botMessage : styles.userMessage}`}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {isLoading && (
                                <div className={`${styles.chatMessage} ${styles.botMessage}`}>
                                    Typing...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className={styles.modalFooter}>
                            <div className={styles.chatInputWrapper}>
                                <input 
                                    type="text" 
                                    placeholder="Chat Here.." 
                                    className={styles.chatInput} 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className={styles.sendBtn} onClick={handleSend}>
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
