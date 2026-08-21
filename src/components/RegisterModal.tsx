"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import styles from "./RegisterModal.module.css";

interface MemberData {
    fullName: string;
    raNumber: string;
    department: string;
    email: string;
    personalEmail: string;
    phone: string;
}

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const DEPARTMENTS = [
    "Computer Science and Engineering (CSE)",
    "Artificial Intelligence and Machine Learning (AI & ML)",
    "Artificial Intelligence and Data Science (AI & DS)",
    "Software Engineering (SWE)",
    "Information Technology (IT)",
    "Cyber Security (CYS)",
    "Data Science (DS)",
    "Cloud Computing (CC)",
    "Electronics and Communication Engineering (ECE)",
    "Electrical and Electronics Engineering (EEE)",
    "Mechanical Engineering (MECH)",
    "Civil Engineering (CIVIL)",
    "Aerospace Engineering (AERO)",
    "Automobile Engineering (AUTO)",
    "Biomedical Engineering (BME)",
    "Biotechnology (BIOTECH)",
    "Mechatronics Engineering (MCT)"
];

const emptyMember = (): MemberData => ({
    fullName: "",
    raNumber: "",
    department: "",
    email: "",
    personalEmail: "",
    phone: "",
});

const GlassFilter = () => (
    <svg style={{ display: "none" }}>
        <filter
            id="glass-distortion"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            filterUnits="objectBoundingBox"
        >
            <feTurbulence
                type="fractalNoise"
                baseFrequency="0.001 0.005"
                numOctaves="1"
                seed="17"
                result="turbulence"
            >
                <animate attributeName="baseFrequency" values="0.001 0.005;0.005 0.001;0.001 0.005" dur="20s" repeatCount="indefinite" />
            </feTurbulence>
            <feComponentTransfer in="turbulence" result="mapped">
                <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
                <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
                <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
            </feComponentTransfer>
            <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
            <feSpecularLighting
                in="softMap"
                surfaceScale="5"
                specularConstant="1"
                specularExponent="100"
                lightingColor="white"
                result="specLight"
            >
                <fePointLight id="glass-point-light" x="-200" y="-200" z="300" />
            </feSpecularLighting>
            <feComposite
                in="specLight"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
                result="litImage"
            />
            <feDisplacementMap
                in="SourceGraphic"
                in2="softMap"
                scale="200"
                xChannelSelector="R"
                yChannelSelector="G"
            />
        </filter>
    </svg>
);

export default function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
    const [teamName, setTeamName] = useState("");
    const [members, setMembers] = useState<MemberData[]>([emptyMember(), emptyMember()]);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const overlayRef = useRef<HTMLDivElement>(null);

    // Track mouse for Glass Filter
    useEffect(() => {
        if (!isOpen) return;
        const handleMouseMove = (e: MouseEvent) => {
            const light = document.getElementById("glass-point-light");
            if (light) {
                light.setAttribute("x", String(e.clientX));
                light.setAttribute("y", String(e.clientY));
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [isOpen]);

    const addMember = () => {
        if (members.length < 4) {
            setMembers([...members, emptyMember()]);
        }
    };

    const removeMember = (index: number) => {
        if (members.length > 2) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const updateMember = (index: number, field: keyof MemberData, value: string) => {
        const updated = [...members];
        updated[index] = { ...updated[index], [field]: value };
        setMembers(updated);
    };

    const validateForm = (): string | null => {
        if (!teamName.trim()) return "Team name is required";
        for (let i = 0; i < members.length; i++) {
            const m = members[i];
            if (!m.fullName.trim()) return `Member ${i + 1}: Name is required`;
            if (!m.raNumber.trim()) return `Member ${i + 1}: RA Number is required`;
            const raUpper = m.raNumber.toUpperCase().trim();
            if (!/^RA26[A-Z0-9]{11}$/.test(raUpper))
                return `Member ${i + 1}: RA Number must start with RA26 and be exactly 15 characters long (e.g. RA2611003010XXX)`;
            if (!m.department) return `Member ${i + 1}: Department is required`;
            
            // SRM Email Validation
            if (!m.email.trim() || !/^[a-zA-Z0-9._%+-]+@srmist\.edu\.in$/.test(m.email.trim().toLowerCase()))
                return `Member ${i + 1}: SRM Email must end with @srmist.edu.in`;
                
            // Personal Email Validation
            if (!m.personalEmail.trim() || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(m.personalEmail.trim().toLowerCase()))
                return `Member ${i + 1}: Personal Email must end with @gmail.com`;
                
            // Phone Validation
            if (!m.phone.trim() || !/^\d{10}$/.test(m.phone.trim()))
                return `Member ${i + 1}: Valid 10-digit phone number is required`;
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSubmitStatus("idle");

        const validationError = validateForm();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setSubmitting(true);

        try {
            const supabase = getSupabase();
            const teamId = crypto.randomUUID();

            // Insert team
            const { error: teamError } = await supabase
                .from("teams")
                .insert({
                    id: teamId,
                    team_name: teamName.trim(),
                    member_count: members.length,
                });

            if (teamError) {
                if (teamError.message.includes("duplicate") || teamError.message.includes("unique")) {
                    throw new Error("Team name already taken! Choose a different name.");
                }
                throw new Error(teamError.message);
            }

            // Insert members
            const memberRows = members.map((m) => ({
                team_id: teamId,
                team_name: teamName.trim(),
                full_name: m.fullName.trim(),
                ra_number: m.raNumber.toUpperCase().trim(),
                department: m.department,
                email: m.email.trim().toLowerCase(),
                personal_email: m.personalEmail.trim().toLowerCase(),
                phone: m.phone.trim(),
            }));

            const { error: membersError } = await supabase
                .from("team_members")
                .insert(memberRows);

            if (membersError) {
                // Cleanup: delete the team if members insert fails
                await supabase.from("teams").delete().eq("id", teamId);
                if (membersError.message.includes("duplicate") || membersError.message.includes("unique")) {
                    throw new Error("One or more RA Numbers or emails are already registered!");
                }
                throw new Error(membersError.message);
            }

            setSubmitStatus("success");
            // Reset form after success
            if (onSuccess) onSuccess();
            setTimeout(() => {
                setTeamName("");
                setMembers([emptyMember(), emptyMember()]);
                setSubmitStatus("idle");
                onClose();
            }, 3000);
        } catch (err) {
            setSubmitStatus("error");
            setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    const resetAndClose = () => {
        setSubmitStatus("idle");
        setErrorMessage("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    ref={overlayRef}
                    onClick={handleOverlayClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.85, y: 60 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 60 }}
                        transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 14,
                        }}
                    >
                        <GlassFilter />
                        
                        {/* Glass Layers */}
                        <div
                            className="absolute inset-0 z-0 overflow-hidden"
                            style={{
                                backdropFilter: "blur(3px)",
                                filter: "url(#glass-distortion)",
                                isolation: "isolate",
                                borderRadius: "inherit"
                            }}
                        />
                        <div
                            className="absolute inset-0 z-10"
                            style={{ background: "rgba(255, 255, 255, 0.25)", borderRadius: "inherit" }}
                        />
                        <div
                            className="absolute inset-0 z-20 overflow-hidden"
                            style={{
                                boxShadow:
                                    "inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5)",
                                borderRadius: "inherit"
                            }}
                        />

                        {/* Glass refraction glow effects */}
                        <div className={styles.glowOrb1} style={{ zIndex: 25 }} />
                        <div className={styles.glowOrb2} style={{ zIndex: 25 }} />
                        <div className={styles.glowOrb3} style={{ zIndex: 25 }} />

                        <div className={styles.modalContentWrap}>

                        {/* Close button */}
                        <button
                            className={styles.closeBtn}
                            onClick={resetAndClose}
                            aria-label="Close registration"
                        >
                            ✕
                        </button>

                        {/* Header */}
                        <div className={styles.header}>
                            <h2 className={styles.title}>Join the Quest</h2>
                            <p className={styles.subtitle}>Register your team for Campus Quest 5.0</p>
                            <div className={styles.yearBadge}>
                                🕷️ Only 1st Year Students Can Apply
                            </div>
                        </div>

                        {/* Success State */}
                        {submitStatus === "success" ? (
                            <motion.div
                                className={styles.successMessage}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 120 }}
                            >
                                <div className={styles.successIcon}>🎉</div>
                                <h3>Registration Successful!</h3>
                                <p>Your team has been registered. See you at Campus Quest 5.0!</p>
                            </motion.div>
                        ) : (
                            /* Form */
                            <form className={styles.form} onSubmit={handleSubmit}>
                                {/* Error message */}
                                {errorMessage && (
                                    <motion.div
                                        className={styles.errorBox}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        ⚠️ {errorMessage}
                                    </motion.div>
                                )}

                                {/* Team Name */}
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Team Name</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Enter your team name"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Members */}
                                <div className={styles.membersSection}>
                                    <div className={styles.membersHeader}>
                                        <span className={styles.membersTitle}>
                                            Team Members ({members.length}/4)
                                        </span>
                                        {members.length < 4 && (
                                            <button
                                                type="button"
                                                className={styles.addMemberBtn}
                                                onClick={addMember}
                                            >
                                                + Add Member
                                            </button>
                                        )}
                                    </div>

                                    {members.map((member, index) => (
                                        <motion.div
                                            key={index}
                                            className={styles.memberCard}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className={styles.memberCardHeader}>
                                                <span className={styles.memberNumber}>
                                                    Member {index + 1}
                                                </span>
                                                {members.length > 2 && (
                                                    <button
                                                        type="button"
                                                        className={styles.removeMemberBtn}
                                                        onClick={() => removeMember(index)}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>

                                            <div className={styles.memberFields}>
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    placeholder="Full Name"
                                                    value={member.fullName}
                                                    onChange={(e) =>
                                                        updateMember(index, "fullName", e.target.value)
                                                    }
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    className={styles.input}
                                                    placeholder="RA Number (e.g. RA2611003010XXX)"
                                                    value={member.raNumber}
                                                    onChange={(e) =>
                                                        updateMember(index, "raNumber", e.target.value)
                                                    }
                                                    required
                                                />
                                                <select
                                                    className={styles.select}
                                                    value={member.department}
                                                    onChange={(e) =>
                                                        updateMember(index, "department", e.target.value)
                                                    }
                                                    required
                                                >
                                                    <option value="" disabled>
                                                        Select Department
                                                    </option>
                                                    {DEPARTMENTS.map((dept) => (
                                                        <option key={dept} value={dept}>
                                                            {dept}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="email"
                                                    placeholder="SRM Email (@srmist.edu.in)"
                                                    className={styles.input}
                                                    value={member.email}
                                                    onChange={(e) => updateMember(index, "email", e.target.value)}
                                                    required
                                                />
                                                <input
                                                    type="email"
                                                    placeholder="Personal Email (@gmail.com)"
                                                    className={styles.input}
                                                    value={member.personalEmail}
                                                    onChange={(e) => updateMember(index, "personalEmail", e.target.value)}
                                                    required
                                                />
                                                <input
                                                    type="tel"
                                                    className={styles.input}
                                                    placeholder="Phone Number (10 digits)"
                                                    value={member.phone}
                                                    onChange={(e) =>
                                                        updateMember(index, "phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                                                    }
                                                    required
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <span className={styles.spinner} />
                                    ) : (
                                        "🕸️ Register Team"
                                    )}
                                </button>
                            </form>
                        )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
