"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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

export default function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
    const [teamName, setTeamName] = useState("");
    const [members, setMembers] = useState<MemberData[]>([emptyMember(), emptyMember()]);
    const [activeMember, setActiveMember] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const addMember = () => {
        if (members.length < 4) {
            const newMembers = [...members, emptyMember()];
            setMembers(newMembers);
            setActiveMember(newMembers.length - 1);
        }
    };

    const removeMember = (index: number) => {
        if (members.length > 2) {
            const updated = members.filter((_, i) => i !== index);
            setMembers(updated);
            setActiveMember(Math.min(activeMember, updated.length - 1));
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
            if (!m.fullName.trim()) return `Member ${i + 1}: Full name is required`;
            if (!m.raNumber.trim()) return `Member ${i + 1}: RA Number is required`;
            const raUpper = m.raNumber.toUpperCase().trim();
            if (!/^RA26[A-Z0-9]{11}$/.test(raUpper))
                return `Member ${i + 1}: RA Number must start with RA26 and be exactly 15 characters (e.g. RA2611003010XXX)`;
            if (!m.department) return `Member ${i + 1}: Department is required`;
            if (!m.email.trim() || !/^[a-zA-Z0-9._%+-]+@srmist\.edu\.in$/.test(m.email.trim().toLowerCase()))
                return `Member ${i + 1}: SRM Email must end with @srmist.edu.in`;
            if (!m.personalEmail.trim() || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(m.personalEmail.trim().toLowerCase()))
                return `Member ${i + 1}: Personal Email must end with @gmail.com`;
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
            if (onSuccess) onSuccess();
            setTimeout(() => {
                setTeamName("");
                setMembers([emptyMember(), emptyMember()]);
                setActiveMember(0);
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

    const resetAndClose = () => {
        setSubmitStatus("idle");
        setErrorMessage("");
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) resetAndClose();
    };

    const member = members[activeMember];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.overlay}
                    onClick={handleOverlayClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    >
                        {/* Close button */}
                        <button
                            className={styles.closeBtn}
                            onClick={resetAndClose}
                            aria-label="Close registration"
                        >
                            ✕
                        </button>

                        <div className={styles.modalContentWrap}>

                            {/* ── Header ── */}
                            <div className={styles.header}>
                                <h2 className={styles.title}>Team Registration</h2>
                                <p className={styles.subtitle}>Campus Quest 5.0</p>
                                <div className={styles.yearBadge}>
                                    🕷️ 1st Year Students Only
                                </div>
                            </div>

                            <div className={styles.divider} />

                            {/* ── Success State ── */}
                            {submitStatus === "success" ? (
                                <motion.div
                                    className={styles.successMessage}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    <span className={styles.successIcon}>🎉</span>
                                    <h3>Registration Successful!</h3>
                                    <p>Your team has been registered. See you at Campus Quest 5.0!</p>
                                </motion.div>
                            ) : (
                                /* ── Form ── */
                                <form className={styles.form} onSubmit={handleSubmit} noValidate>

                                    {/* Error message */}
                                    <AnimatePresence>
                                        {errorMessage && (
                                            <motion.div
                                                className={styles.errorBox}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                ⚠️ {errorMessage}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Team Name */}
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.label}>Team Name</label>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            placeholder="e.g. Spider Squad"
                                            value={teamName}
                                            onChange={(e) => setTeamName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    {/* ── Member Section ── */}
                                    <div className={styles.membersSection}>

                                        {/* Tab bar */}
                                        <div className={styles.tabBar} role="tablist">
                                            {members.map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={activeMember === i}
                                                    className={`${styles.tab} ${activeMember === i ? styles.tabActive : ""}`}
                                                    onClick={() => setActiveMember(i)}
                                                >
                                                    Member {i + 1}
                                                </button>
                                            ))}
                                            {members.length < 4 && (
                                                <button
                                                    type="button"
                                                    className={styles.addTabBtn}
                                                    onClick={addMember}
                                                    title="Add member"
                                                    aria-label="Add member"
                                                >
                                                    +
                                                </button>
                                            )}
                                        </div>

                                        {/* Active member card */}
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeMember}
                                                className={styles.memberCard}
                                                initial={{ opacity: 0, x: 12 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -12 }}
                                                transition={{ duration: 0.18 }}
                                            >
                                                <div className={styles.memberCardHeader}>
                                                    <span className={styles.memberNumber}>
                                                        Member {activeMember + 1}
                                                    </span>
                                                    {members.length > 2 && (
                                                        <button
                                                            type="button"
                                                            className={styles.removeMemberBtn}
                                                            onClick={() => removeMember(activeMember)}
                                                            aria-label={`Remove member ${activeMember + 1}`}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Two-column grid */}
                                                <div className={styles.memberGrid}>

                                                    {/* Full Name */}
                                                    <div className={styles.fieldGroup}>
                                                        <label className={styles.label}>Full Name</label>
                                                        <input
                                                            type="text"
                                                            className={styles.input}
                                                            placeholder="Full Name"
                                                            value={member.fullName}
                                                            onChange={(e) => updateMember(activeMember, "fullName", e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    {/* RA Number */}
                                                    <div className={styles.fieldGroup}>
                                                        <label className={styles.label}>RA Number</label>
                                                        <input
                                                            type="text"
                                                            className={styles.input}
                                                            placeholder="RA2611003010XXX"
                                                            value={member.raNumber}
                                                            onChange={(e) => updateMember(activeMember, "raNumber", e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    {/* Department — full width */}
                                                    <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                                        <label className={styles.label}>Department</label>
                                                        <select
                                                            className={styles.select}
                                                            value={member.department}
                                                            onChange={(e) => updateMember(activeMember, "department", e.target.value)}
                                                            required
                                                        >
                                                            <option value="" disabled>Select Department</option>
                                                            {DEPARTMENTS.map((dept) => (
                                                                <option key={dept} value={dept}>{dept}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* SRM Email */}
                                                    <div className={styles.fieldGroup}>
                                                        <label className={styles.label}>SRM Email</label>
                                                        <input
                                                            type="email"
                                                            className={styles.input}
                                                            placeholder="@srmist.edu.in"
                                                            value={member.email}
                                                            onChange={(e) => updateMember(activeMember, "email", e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    {/* Gmail */}
                                                    <div className={styles.fieldGroup}>
                                                        <label className={styles.label}>Personal Email</label>
                                                        <input
                                                            type="email"
                                                            className={styles.input}
                                                            placeholder="@gmail.com"
                                                            value={member.personalEmail}
                                                            onChange={(e) => updateMember(activeMember, "personalEmail", e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    {/* Phone — full width */}
                                                    <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                                        <label className={styles.label}>Phone Number</label>
                                                        <input
                                                            type="tel"
                                                            className={styles.input}
                                                            placeholder="10-digit number"
                                                            value={member.phone}
                                                            onChange={(e) =>
                                                                updateMember(activeMember, "phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                                                            }
                                                            required
                                                        />
                                                    </div>

                                                </div>
                                            </motion.div>
                                        </AnimatePresence>

                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className={styles.submitBtn}
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? <span className={styles.spinner} />
                                            : "🕸️ Register Team"
                                        }
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
