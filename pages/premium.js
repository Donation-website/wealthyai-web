import { useRouter } from "next/router";

export default function PremiumRouter() {
  const router = useRouter();
  const { tier } = router.query;

  if (!tier) {
    return <div style={{ padding: 40 }}>Loading premium access…</div>;
  }

  if (tier === "day") {
    router.replace("/premium/day");
    return null;
  }

  if (tier === "week") {
    router.replace("/premium/week");
    return null;
  }

  if (tier === "month") {
    router.replace("/premium/month");
    return null;
  }

  return <div>Invalid premium tier</div>;
}
