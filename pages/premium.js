import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PremiumRouter() {
  const router = useRouter();

  useEffect(() => {
    const access = JSON.parse(localStorage.getItem("premiumAccess"));

    if (!access || !access.tier) {
      router.replace("/");
      return;
    }

    if (Date.now() > access.expiresAt) {
      localStorage.removeItem("premiumAccess");
      router.replace("/");
      return;
    }

    // ROUTING BY TIER
    if (access.tier === "day") {
      router.replace("/day");
    } else if (access.tier === "week") {
      router.replace("/premium-week");
    } else if (access.tier === "month") {
      router.replace("/premium-month");
    } else {
      router.replace("/");
    }
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        color: "#94a3b8",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      Redirecting to your premium dashboard…
    </div>
  );
}
