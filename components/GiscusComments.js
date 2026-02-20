import { useEffect, useRef } from 'react';

export default function GiscusComments() {
  const ref = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "Donation-website/wealthyai-web");
    script.setAttribute("data-repo-id", "IDE MÁSOLD A DATA-REPO-ID-T"); // Itt a hiba!
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "IDE MÁSOLD A DATA-CATEGORY-ID-T"); // Itt a hiba!
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "dark_high_contrast");
    script.setAttribute("data-lang", "en");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    if (ref.current) {
      ref.current.innerHTML = '';
      ref.current.appendChild(script);
    }
  }, []);

  return <div ref={ref} />;
}
