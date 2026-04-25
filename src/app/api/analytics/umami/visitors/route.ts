import { NextResponse } from "next/server";

type UmamiLoginResponse = {
  token?: string;
};

type UmamiStatsResponse = {
  visitors?: number;
  uniques?: number;
  uniqueVisitors?: number;
};

function extractUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/https?:\/\/[^\s"']+/);
  return match?.[0] ?? null;
}

function resolveUmamiApiBaseUrl(): string | null {
  const explicitBaseUrl = extractUrl(process.env.UMAMI_API_URL);

  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/$/, "");
  }

  const scriptUrl = extractUrl(process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL);

  if (!scriptUrl) {
    return null;
  }

  try {
    const parsed = new URL(scriptUrl);
    return parsed.origin;
  } catch {
    return null;
  }
}

async function getBearerToken(baseUrl: string): Promise<string | null> {
  const staticToken = process.env.UMAMI_BEARER_TOKEN?.trim();
  if (staticToken) {
    return staticToken;
  }

  const username = process.env.UMAMI_USERNAME?.trim();
  const password = process.env.UMAMI_PASSWORD?.trim();

  if (!username || !password) {
    return null;
  }

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as UmamiLoginResponse;
  return data.token ?? null;
}

function extractVisitorsCount(data: UmamiStatsResponse): number | null {
  const value = data.visitors ?? data.uniques ?? data.uniqueVisitors;

  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }

  return null;
}

export async function GET() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  const baseUrl = resolveUmamiApiBaseUrl();

  if (!websiteId || !baseUrl) {
    return NextResponse.json(
      { success: false, visitors: null, error: "Umami is not configured." },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        },
      }
    );
  }

  try {
    const apiKey = process.env.UMAMI_API_KEY?.trim();
    const token = await getBearerToken(baseUrl);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (apiKey) {
      headers["x-umami-api-key"] = apiKey;
    }

    const response = await fetch(
      `${baseUrl}/api/websites/${websiteId}/stats?startAt=0&endAt=${Date.now()}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, visitors: null, error: "Failed to fetch Umami stats." },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
          },
        }
      );
    }

    const data = (await response.json()) as UmamiStatsResponse;
    const visitors = extractVisitorsCount(data);

    return NextResponse.json(
      { success: visitors !== null, visitors },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, visitors: null, error: "Unexpected error while loading Umami stats." },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  }
}
