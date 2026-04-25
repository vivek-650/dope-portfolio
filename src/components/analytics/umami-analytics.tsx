import Script from "next/script";

const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

function extractUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/https?:\/\/[^\s"']+/);
  return match?.[0] ?? null;
}

const scriptUrl = extractUrl(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL);
const domains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS?.trim();

export default function UmamiAnalytics() {
  if (!websiteId || !scriptUrl) {
    return null;
  }

  return (
    <Script
      id="umami-analytics"
      src={scriptUrl}
      data-website-id={websiteId}
      {...(domains ? { "data-domains": domains } : {})}
      strategy="afterInteractive"
    />
  );
}
