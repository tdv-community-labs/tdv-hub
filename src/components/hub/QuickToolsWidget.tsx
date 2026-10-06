"use client";

import React, { useState } from "react";
import { 
  Calculator, 
  BookOpen, 
  Calendar, 
  PhoneCall, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function QuickToolsWidget() {
  const [gpaModalOpen, setGpaModalOpen] = useState(false);
  const [scores, setScores] = useState({ math: "", azerbaijani: "", english: "", physics: "" });
  const [calculatedGpa, setCalculatedGpa] = useState<number | null>(null);

  const handleCalculateGpa = (e: React.FormEvent) => {
    e.preventDefault();
    const vals = [
      parseFloat(scores.math),
      parseFloat(scores.azerbaijani),
      parseFloat(scores.english),
      parseFloat(scores.physics),
    ].filter((v) => !isNaN(v));

    if (vals.length === 0) {
      toast.error("Zəhmət olmasa ən azı bir qiymət daxil edin");
      return;
    }

    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    setCalculatedGpa(Math.round(avg * 10) / 10);
    toast.success(`Orta balınız hesablandı: ${avg.toFixed(1)}`);
  };

  return (
    <Card className="p-6 glassmorphism border-slate-800 space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Sürətli Alətlər</h3>
          <p className="text-xs text-slate-400">Şagird və müəllimlər üçün köməkçi resurslar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* GPA Modal Trigger */}
        <div
          onClick={() => setGpaModalOpen(!gpaModalOpen)}
          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/70 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 group-hover:text-purple-300 transition-colors">
                GPA / Qiymət Kalkulyatoru
              </p>
              <p className="text-xs text-slate-500">Semestr üzrə orta balı dərhal hesabla</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-purple-400 transition-all" />
        </div>

        {/* GPA Calculator Expandable Form */}
        {gpaModalOpen && (
          <form
            onSubmit={handleCalculateGpa}
            className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3"
          >
            <p className="text-xs font-semibold text-purple-300">Qiymətlərinizi daxil edin (100 ballıq şkala):</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="number"
                placeholder="Riyaziyyat"
                value={scores.math}
                onChange={(e) => setScores({ ...scores, math: e.target.value })}
                className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
              />
              <input
                type="number"
                placeholder="Azərbaycan dili"
                value={scores.azerbaijani}
                onChange={(e) => setScores({ ...scores, azerbaijani: e.target.value })}
                className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
              />
              <input
                type="number"
                placeholder="İngilis dili"
                value={scores.english}
                onChange={(e) => setScores({ ...scores, english: e.target.value })}
                className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
              />
              <input
                type="number"
                placeholder="Fizika"
                value={scores.physics}
                onChange={(e) => setScores({ ...scores, physics: e.target.value })}
                className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-500 text-xs">
                Hesabla
              </Button>
              {calculatedGpa !== null && (
                <span className="font-mono font-bold text-sm text-purple-300">
                  Nəticə: {calculatedGpa} bal
                </span>
              )}
            </div>
          </form>
        )}

        {/* Library link */}
        <div
          onClick={() => toast.info("Rəqəmsal Kitabxana tezliklə inteqrasiya olunacaq!")}
          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900/70 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 group-hover:text-blue-300 transition-colors">
                Rəqəmsal Kitabxana & PDF Dərsliklər
              </p>
              <p className="text-xs text-slate-500">Milli kurrikulum və lisey dərslikləri</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
        </div>

        {/* Calendar link */}
        <div
          onClick={() => toast.info("2026 Tədris İli Qrafiki: Sınaq İmtahanları May ayındadır.")}
          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/70 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">
                Akademik Təqvim & Tədbirlər
              </p>
              <p className="text-xs text-slate-500">İmtahan tarixləri və məktəb bayramları</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
        </div>

        {/* Administration Hotline */}
        <div
          onClick={() => toast.success("Əlaqə: +994 (12) 438-XX-XX | info@tdvbaku.edu.az")}
          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/70 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 group-hover:text-amber-300 transition-colors">
                Rəhbərlik və Qaynar Xətt
              </p>
              <p className="text-xs text-slate-500">Məktəb administrasiyası ilə əlaqə</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
        </div>
      </div>
    </Card>
  );
}
