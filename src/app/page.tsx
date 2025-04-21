export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Welcome to Life Manage</h1>
      <p>This app helps you turn ChatGPT conversations into projects.</p>
      <ul>
        <li><a href="/upload">Upload</a></li>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/projects">Projects</a></li>
      </ul>
    </main>
  );
}
