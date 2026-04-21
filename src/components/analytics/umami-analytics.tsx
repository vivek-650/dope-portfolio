import Script from "next/script";

const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const domains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS;

export default function UmamiAnalytics() {
  if (!websiteId || !scriptUrl) {
    return null;
  }

  return (
    <Script
      id="umami-analytics"
      src={scriptUrl}
      data-website-id={websiteId}
      data-domains={domains}
      strategy="afterInteractive"
    />
  );
}
