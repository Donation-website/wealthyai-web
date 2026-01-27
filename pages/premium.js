azert talan 1 egyszeru grafikon beleferhet, mert az emberek szeretik a vizualis elmenyt. ami fontos es meg nem irtam. a stripe mar mukodik, most teszt modban van, de mukodik elesben is ha atteszem a kulcsot. tehat a tovabblepesekhez mondom, hogy barhogyan is talaljuk b oldalon a csomagot, mar be van allitva a stripe, es mivel majd 1 hetig szivtam vele azt ne rontsuk el. zek alapjan beteszem ujra Neked a jelenleg futo B oldalt, es kerlek a teljes uj B oldal kodot kuld at nekem. en torlom az elozot githubon es beillesztem az ujat. import { useEffect } from "react";
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
