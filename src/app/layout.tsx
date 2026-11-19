import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { THEME_SCRIPT } from "@/lib/theme";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-app", display: "swap" });

export const metadata: Metadata = {
  title: "Kathmandu Waste Management",
  description: "Waste collection for Kathmandu Metropolitan City: KMC, ward staff, citizens and drivers.",
  appleWebApp: { capable: true, title: "Clean Kathmandu", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#15824c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The head script may set data-theme before React hydrates, hence suppressHydrationWarning.
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
