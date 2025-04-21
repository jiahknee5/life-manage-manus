export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>✅ Hello from Life Manage</h1>
      <p>This is the homepage. Routing is now working.</p>
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/upload">Upload</a></li>
        <li><a href="/projects">Projects</a></li>
      </ul>
    </main>
  );
}
