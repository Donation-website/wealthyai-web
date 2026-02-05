import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ACCESS_KEY = "liveAccessUntil";

export default function LiveApp() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // localStorage csak client oldalon
    const stored = localStorage.getItem(ACCESS_KEY);

    if (!stored) {
      router.replace("/live");
      return;
    }

    const until = Number(stored);

    if (Date.now() > until) {
      localStorage.removeItem(ACCESS_KEY);
      router.replace("/live");
      return;
    }

    setAllowed(true);
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter, system-ui",
        }}
      >
        <p style={{ opacity: 0.6 }}>Checking access…</p>
      </main>
    );
  }

  if (!allowed) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: 32,
        fontFamily: "Inter, system-ui",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>
        Live Financial Environment
      </h1>

      <p style={{ opacity: 0.75, marginBottom: 24 }}>
        This environment reflects the current financial context.
        Updates appear only when structural meaning changes.
      </p>

      <div
        style={{
          border: "1px solid #1e293b",
          borderRadius: 12,
          padding: 20,
          background: "rgba(2,6,23,0.7)",
        }}
      >
        <p style={{ opacity: 0.6 }}>
          Live data stream not connected yet.
        </p>
        <p style={{ fontSize: 13, opacity: 0.4, marginTop: 8 }}>
          (This is the protected shell. AI + data come next.)
        </p>
      </div>
    </main>
  );
}
