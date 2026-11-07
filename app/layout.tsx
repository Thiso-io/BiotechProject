import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { VaultProvider } from "@/lib/vault";
import { DemoBanner } from "@/components/DemoBanner";
import { RegisterSW } from "@/components/RegisterSW";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Juno",
  description: "Your friendly assistant for building a private medical profile for drug trials.",
  appleWebApp: { capable: true, title: "Juno", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#22a993",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <VaultProvider>
          <div className="mx-auto flex h-dvh max-w-md flex-col bg-cream">
            <DemoBanner />
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </div>
        </VaultProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
