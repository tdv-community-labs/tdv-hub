"use client";

import React, { useState, useEffect } from "react";
import { Clock, Bell, CheckCircle2, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BellPeriod {
  period: number;
  name: string;
  startTime: string;
  endTime: string;
  breakAfter: string;
}

const SCHEDULE: BellPeriod[] = [
  { period: 1, name: "1-ci Dərs", startTime: "08:30", endTime: "09:15", breakAfter: "10 dəq. Tənəffüs" },
  { period: 2, name: "2-ci Dərs", startTime: "09:25", endTime: "10:10", breakAfter: "10 dəq. Tənəffüs" },
  { period: 3, name: "3-cü Dərs", startTime: "10:20", endTime: "11:05", breakAfter: "15 dəq. Böyük tənəffüs" },
  { period: 4, name: "4-cü Dərs", startTime: "11:20", endTime: "12:05", breakAfter: "10 dəq. Tənəffüs" },
  { period: 5, name: "5-ci Dərs", startTime: "12:15", endTime: "13:00", breakAfter: "40 dəq. Nahar fasiləsi" },
  { period: 6, name: "6-cı Dərs", startTime: "13:40", endTime: "14:25", breakAfter: "10 dəq. Tənəffüs" },
  { period: 7, name: "7-ci Dərs", startTime: "14:35", endTime: "15:20", breakAfter: "Dərslərin Sonu" },
];

export function BellScheduleWidget() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [activePeriod, setActivePeriod] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const timeStr = `${hours}:${minutes}:${seconds}`;
      setCurrentTime(timeStr);

      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let currentActive: number | null = null;
      for (const item of SCHEDULE) {
        const [sh, sm] = item.startTime.split(":").map(Number);
        const [eh, em] = item.endTime.split(":").map(Number);
        const startTotal = sh * 60 + sm;
        const endTotal = eh * 60 + em;

        if (currentMinutes >= startTotal && currentMinutes <= endTotal) {
          currentActive = item.period;
          break;
        }
      }
      setActivePeriod(currentActive);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 glassmorphism border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">TDV Zəng Cədvəli</h3>
            <p className="text-xs text-slate-400">Gündəlik akademik dərs saatları və tənəffüslər</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-sm text-slate-300">
          <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>{currentTime || "00:00:00"}</span>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        {SCHEDULE.map((item) => {
          const isActive = activePeriod === item.period;

          return (
            <div
              key={item.period}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isActive
                  ? "bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-500/10"
                  : "bg-slate-900/30 border-slate-800/60 hover:bg-slate-900/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.period}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">
                      {item.name}
                    </span>
                    {isActive && (
                      <Badge className="bg-emerald-500 text-white text-[10px] py-0 px-1.5 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Dərs Davam Edir
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {item.breakAfter}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-medium text-blue-400">
                  {item.startTime} - {item.endTime}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
