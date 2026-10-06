"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  GraduationCap, 
  Trophy, 
  Gamepad2, 
  Users, 
  Sparkles, 
  ExternalLink, 
  Search, 
  Layers
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AppItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  badge?: string;
  icon_name?: string;
  accent_color?: string;
  order_index?: number;
}

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap className="w-6 h-6" />,
  Trophy: <Trophy className="w-6 h-6" />,
  Gamepad2: <Gamepad2 className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
};

export function CampusLauncher() {
  const [selectedCategory, setSelectedCategory] = useState("Hamısı");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: apps, isLoading } = useQuery<AppItem[]>({
    queryKey: ["hub_apps"],
    queryFn: async () => {
      const res = await fetch("/api/apps");
      if (!res.ok) throw new Error("Tətbiqləri yükləmək mümkün olmadı");
      return res.json();
    },
  });

  const categories = ["Hamısı", "Təhsil", "İdman", "Oyunlar"];

  const filteredApps = (apps || []).filter((app) => {
    const matchesCategory =
      selectedCategory === "Hamısı" || app.category === selectedCategory;
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLaunch = (name: string, url: string) => {
    toast.success(`${name} başladılır...`);
  };

  return (
    <section className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glassmorphism p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <Layers className="w-4 h-4 text-blue-400 hidden sm:block mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tətbiq və ya xidmət axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-900/80 border border-slate-800 focus:border-blue-500 focus:outline-none text-slate-200 placeholder:text-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Apps */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 bg-slate-900/40 border-slate-800 space-y-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </Card>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-16 glassmorphism rounded-2xl border border-slate-800/80">
          <p className="text-slate-400 text-base">Axtarışa uyğun heç bir tətbiq tapılmadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => {
            const icon = (app.icon_name && iconMap[app.icon_name]) || <Sparkles className="w-6 h-6" />;
            const accent = app.accent_color || "from-blue-600 to-indigo-600";

            return (
              <a
                key={app.id}
                href={app.url}
                target={app.url.startsWith("http") ? "_blank" : "_self"}
                rel="noreferrer"
                onClick={() => handleLaunch(app.name, app.url)}
                className="group relative flex flex-col justify-between p-6 rounded-2xl glass-card transition-all duration-300 hover:scale-[1.02] hover:border-slate-600/60 hover:shadow-2xl overflow-hidden"
              >
                {/* Background ambient subtle glow */}
                <div
                  className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${accent} opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity`}
                />

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-lg shadow-black/40 group-hover:rotate-3 transition-transform`}
                    >
                      {icon}
                    </div>
                    <div className="flex items-center gap-2">
                      {app.badge && (
                        <Badge variant="outline" className="text-xs bg-slate-800/80 text-blue-300 border-blue-500/30">
                          {app.badge}
                        </Badge>
                      )}
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    {app.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-blue-400 transition-colors">
                  <span>Daxil ol</span>
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
