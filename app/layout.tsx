import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PrefsProvider } from "@/components/Prefs";
import Nav from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: { default: "HomeWorkout: free, science-backed home workouts", template: "%s · HomeWorkout" },
  description:
    "Free daily home workouts with animated exercise demos, a 7-day plan for every level and progress tracking. No equipment, no sign-up, built on exercise science.",
  applicationName: "HomeWorkout",
  openGraph: {
    title: "HomeWorkout: free, science-backed home workouts",
    description: "Daily no-equipment workouts with animated demos and a plan that progresses with you.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0a0e13", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PrefsProvider>
          <Nav />
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <footer className="border-t border-line mt-16 pb-28 md:pb-10 pt-8 text-sm text-muted">
            <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <p>HomeWorkout is free forever. No equipment, no sign-up.</p>
              <p className="max-w-xl">
                General fitness guidance, not medical advice. Check with a health professional before starting if you have a medical condition, injury or are pregnant.
              </p>
            </div>
          </footer>
        </PrefsProvider>
      </body>
    </html>
  );
}
