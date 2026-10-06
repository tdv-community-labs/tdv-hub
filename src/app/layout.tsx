import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/hub/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TDV Hub - Mərkəzi Kampus Portalı",
  description: "Türkiyə Dəyanət Vəqfi Bakı Türk Liseyi rəsmi mərkəzi rəqəmsal platforması və tətbiqlər mərkəzi.",
  icons: {
    icon: "/assets/tdv-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0b0f19] text-slate-100 antialiased`}>
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-slate-800/80 bg-slate-950/40 py-8 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p>© {new Date().getFullYear()} TDV Bakı Türk Liseyi Rəqəmsal Ekosistemi. Bütün hüquqlar qorunur.</p>
                <div className="flex items-center gap-4 text-slate-400">
                  <a href="https://tdv-e-school.vercel.app" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">E-Məktəb</a>
                  <span>•</span>
                  <a href="https://school-minifootball-tournament.vercel.app" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">Futbol Liqası</a>
                  <span>•</span>
                  <a href="https://tdv-boardgames.vercel.app" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">Oyunlar</a>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sistemlər Onlayn
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
