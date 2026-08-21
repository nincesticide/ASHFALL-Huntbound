import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASHFALL — Huntbound v0.14.0",
  description:
    "A playable dark-fantasy open-world hunt RPG. Explore Emberwatch and Emberwood, complete contracts, enter Delves, and survive Deep Hunts.",
  openGraph: {
    title: "ASHFALL — Huntbound v0.14.0",
    description:
      "Explore the open world, hunt monsters, evolve Huntforged gear, and descend into high-risk Delves and Deep Hunts.",
    type: "website",
    images: [
      {
        url: "https://ashfall-huntbound.dustin-j-ouellette.chatgpt.site/og.png",
        width: 1200,
        height: 630,
        alt: "ASHFALL — Huntbound v0.14.0 — Open World",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ASHFALL — Huntbound v0.14.0",
    description:
      "A playable dark-fantasy open-world hunt RPG built around Emberwatch, Delves, and Deep Hunts.",
    images: [
      "https://ashfall-huntbound.dustin-j-ouellette.chatgpt.site/og.png",
    ],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
