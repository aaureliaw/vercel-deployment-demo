import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APOD — Vercel demo",
  description: "Small NASA picture-of-the-day app for teaching environment variables on Vercel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
