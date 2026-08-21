import styles from "@/components/Hero.module.css";

export default function AboutPage() {
  return (
    <main className={styles.hero} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
      <div>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>About Us</h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "600px", textAlign: "center" }}>
          Welcome to the About page. Here you can find more information about our event and organization.
        </p>
      </div>
    </main>
  );
}
