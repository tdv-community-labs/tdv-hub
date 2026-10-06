import React from "react";
import { 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Users, 
  GraduationCap, 
  Trophy,
  ArrowUpRight
} from "lucide-react";
import { CampusLauncher } from "@/components/hub/CampusLauncher";
import { BellScheduleWidget } from "@/components/hub/BellScheduleWidget";
import { QuickToolsWidget } from "@/components/hub/QuickToolsWidget";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function HubHomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glassmorphism p-8 sm:p-12 border border-slate-800 shadow-2xl">
        {/* Ambient Gradient Highlights */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>TDV Rəqəmsal Ekosistemi v2.0 • Mərkəzi Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Türkiyə Dəyanət Vəqfi <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Bakı Türk Liseyi Rəqəmsal Kampusu
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Təhsil, idman, intellektual oyunlar və məktəb həyatının bütün rəqəmsal xidmətlərini vahid interfeysdə birləşdirən rəsmi idarəetmə və keçid mərkəzi.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="https://tdv-e-school.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
            >
              <GraduationCap className="w-4 h-4" />
              <span>E-Məktəbə Keç</span>
              <ArrowUpRight className="w-4 h-4 opacity-80" />
            </a>

            <a
              href="https://school-minifootball-tournament.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm transition-all hover:scale-[1.02]"
            >
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>Futbol Liqası</span>
              <ArrowUpRight className="w-4 h-4 opacity-80" />
            </a>
          </div>
        </div>

        {/* Quick Highlights Counters */}
        <div className="relative z-10 mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Aktiv Tətbiqlər</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">5 Portal</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Şagird & İştirakçı</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">850+</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Liqa Komandaları</span>
            </div>
            <p className="text-2xl font-bold text-white font-mono">16 Komanda</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Statusu</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              99.9% Uptime
            </p>
          </div>
        </div>
      </section>

      {/* Main Apps Bento Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Mərkəzi Tətbiqlər və Portallar
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Bir toxunuşla istədiyiniz təhsil, idman və ya əyləncə platformasına keçid edin
            </p>
          </div>
          <Badge variant="outline" className="text-xs border-slate-700 bg-slate-900/50 text-slate-300">
            5 Onlayn Xidmət
          </Badge>
        </div>

        <CampusLauncher />
      </section>

      {/* Daily Operations: Bell Schedule & Quick Tools */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <BellScheduleWidget />
        <QuickToolsWidget />
      </section>
    </div>
  );
}
