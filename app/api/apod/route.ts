export const dynamic = "force-dynamic";

type ApodPayload = {
  title: string;
  date: string;
  explanation: string;
  media_type: string;
  url: string;
  hdurl?: string;
  thumbnail_url?: string;
};

export async function GET() {
  const key = process.env.NASA_API_KEY?.trim();
  if (!key) {
    return Response.json(
      {
        error:
          "Missing NASA_API_KEY. Copy .env.example to .env locally, or set the variable in Vercel.",
      },
      { status: 500 },
    );
  }

  const nasaUrl = new URL("https://api.nasa.gov/planetary/apod");
  nasaUrl.searchParams.set("api_key", key);
  // Video entries often omit thumbnail_url unless thumbs=true
  nasaUrl.searchParams.set("thumbs", "true");

  const res = await fetch(nasaUrl.toString(), { next: { revalidate: 0 } });
  const data = (await res.json()) as ApodPayload & { error?: { message?: string } };

  if (!res.ok) {
    const msg =
      typeof data.error === "object" && data.error?.message
        ? data.error.message
        : "NASA API request failed";
    return Response.json({ error: msg }, { status: res.status });
  }

  return Response.json({
    title: data.title,
    date: data.date,
    explanation: data.explanation,
    media_type: data.media_type,
    url: data.url,
    hdurl: data.hdurl,
    thumbnail_url: data.thumbnail_url,
  });
}
