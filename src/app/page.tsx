"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      maxWidth: "768px",
      margin: "0 auto",
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      gap: "3rem"
    }}>
      <section style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>Life Manage</h1>
        <p style={{ fontSize: "1.25rem", marginTop: "0.5rem" }}>
          Your AI-powered assistant for planning, tracking, and thriving.
        </p>
        <Link href="/dashboard">
          <button style={{
            marginTop: "1.5rem",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: "600",
            color: "#fff",
            backgroundColor: "#2563eb",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer"
          }}>
            Start Managing →
          </button>
        </Link>
      </section>

      <section>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>Key Features</h2>
        <ul style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <li>✅ <strong>Project Tracking:</strong> Stay on top of every task</li>
          <li>📅 <strong>Time Management:</strong> Organize your schedule effortlessly</li>
          <li>🧠 <strong>AI Recommendations:</strong> Let AI help optimize your time</li>
        </ul>
      </section>

      <footer style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
        <p>© 2025 Life Manage</p>
        <p>
          <a href="/privacy" style={{ marginRight: "1rem" }}>Privacy</a>
          <a href="https://github.com/jiahknee5/life-manage-manus" target="_blank">GitHub</a>
        </p>
      </footer>
    </main>
  );
}
