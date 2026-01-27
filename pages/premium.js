import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PremiumRouter() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { session_id } = router.query;
    if (!session_id) {
      router.replace("/");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/verify-session?session_id=${session_id}`);
        const data = await res.json();

        if (!data.valid || !data.tier) {
          router.replace("/");
          return;
        }

        // ⬇️ ITT A LÉNYEG
        localStorage.setItem(
          "premiumAccess",
          JSON.stringify({
            tier: data.tier,
            expiresAt: Date.now() + data.duration,
          })
        );

        if (data.tier === "day") router.replace("/day");
        if (data.tier === "week") router.replace("/premium-week");
        if (data.tier === "month") router.replace("/premium-month");
      } catch (e) {
        router.replace("/");
      }
    };

    verify();
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#94a3b8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      Verifying subscription…
    </div>
  );
}
