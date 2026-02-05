import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ACCESS_KEY = "liveAccessUntil";
const ACCESS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 nap

export default function LiveSuccess() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    // 🔓 Access unlock
    const until = Date.now() + ACCESS_DURATION_MS;
    localStorage.setItem(ACCESS_KEY, until.toString());

    setReady(true);

    // opcionális: automatikus továbbirányítás
    setTimeout(() => {
      router.replace("/live/app");
    }, 1200);
  }, [router.isReady]);

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
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>
          Access unlocked
        </h1>

        <p style={{ opacity: 0.8 }}>
          Live Financial Environment is now active for the next 30 days.
        </p>

        {ready && (
          <p style={{ marginTop: 16, fontSize: 13, opacity: 0.6 }}>
            Redirecting…
          </p>
        )}
      </div>
    </main>
  );
}
