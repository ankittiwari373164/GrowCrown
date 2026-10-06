import type { Metadata } from "next";
import "./globals.css";
import "./boutique.css";

export const metadata: Metadata = {
  title: "Glowcrown | Everyday elegance, beautifully yours",
  description: "Discover Glowcrown boutique by Agarwal Global Trader. Shop embroidered cotton kurta sets, chikankari Anarkalis and Banarasi silk sets, fulfilled by Amazon.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/assets/logo-badge.png",
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