"use client";

/* eslint-disable @next/next/no-img-element -- APOD image URLs come from NASA at runtime */
import { useEffect, useState } from "react";

type Apod = {
  title: string;
  date: string;
  explanation: string;
  media_type: string;
  url: string;
  hdurl?: string;
  thumbnail_url?: string;
};

type ApiOk = Apod;
type ApiErr = { error: string };

/** NASA sometimes returns http://; upgrade so images load on https pages. */
function toHttps(u: string): string {
  try {
    const parsed = new URL(u);
    if (parsed.protocol === "http:") parsed.protocol = "https:";
    return parsed.toString();
  } catch {
    return u;
  }
}

/** Build a same-origin embed URL for common YouTube APOD links. */
function youtubeEmbedSrc(pageUrl: string): string | null {
  try {
    const u = new URL(pageUrl);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtube.com" && u.pathname.startsWith("/embed/")) {
      const id = u.pathname.slice("/embed/".length).split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" && u.pathname === "/watch") {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function ApodMedia({ data }: { data: Apod }) {
  if (data.media_type === "image") {
    return (
      <div className="h-full w-full min-h-0">
        <img
          src={toHttps(data.hdurl ?? data.url)}
          alt={data.title}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  const yt = youtubeEmbedSrc(data.url);
  if (yt) {
    return (
      <div className="h-full w-full min-h-0">
        <iframe
          title={data.title}
          src={yt}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  if (data.thumbnail_url) {
    return (
      <div className="h-full w-full min-h-0">
        <img
          src={toHttps(data.thumbnail_url)}
          alt=""
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-zinc-400">
        Today&apos;s APOD is a video. Open it on the provider site.
      </p>
      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
      >
        Open media
      </a>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<ApiOk | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/apod");
        const body = (await res.json()) as ApiOk | ApiErr;
        if (cancelled) return;
        if ("error" in body) {
          setError(body.error);
          setData(null);
        } else {
          setError(null);
          setData(body);
        }
      } catch {
        if (!cancelled) setError("Could not reach the app API.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400/90">
          Vercel deploy demo
        </p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Astronomy Picture of the Day
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          The API key lives only on the server (<span className="font-mono">NASA_API_KEY</span>
          ). Students set it in{" "}
          <span className="font-medium text-zinc-200">Vercel → Settings → Environment Variables</span>
          . NASA documents a public demo value you can use for workshops.
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
        {loading && (
          <p className="animate-pulse text-zinc-500">Loading today&apos;s APOD…</p>
        )}

        {error && (
          <div
            className="rounded-xl border border-rose-900/60 bg-rose-950/40 px-4 py-3 font-mono text-sm text-rose-100"
            role="alert"
          >
            {error}
          </div>
        )}

        {data && (
          <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-xl shadow-black/40">
            <div className="flex aspect-video w-full flex-col bg-black">
              <ApodMedia data={data} />
            </div>
            <div className="space-y-3 p-6">
              <h2 className="text-xl font-semibold text-white">{data.title}</h2>
              <p className="font-mono text-xs text-zinc-500">
                {data.date}
                <span className="text-zinc-600">
                  {" "}
                  · {data.media_type.charAt(0).toUpperCase()}
                  {data.media_type.slice(1)}
                </span>
              </p>
              <p className="text-sm leading-relaxed text-zinc-300">
                {data.explanation.slice(0, 420)}
                {data.explanation.length > 420 ? "…" : ""}
              </p>
              <a
                href="https://api.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-medium text-amber-400 hover:text-amber-300"
              >
                api.nasa.gov — API keys and DEMO_KEY
              </a>
            </div>
          </article>
        )}
      </main>

      <footer className="mt-auto border-t border-zinc-800 px-6 py-6 text-center text-xs text-zinc-600">
        Built with Next.js for classroom Vercel deployments. Media and copy from NASA APOD.
      </footer>
    </div>
  );
}
