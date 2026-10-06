"use client";

import React from "react";
import { Sparkles, Globe, Shield, Terminal, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-purple-600/30">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white sm:text-lg">TDV Hub</span>
              <Badge variant="default" className="text-[10px] font-mono tracking-wider">
                CAMPUS PORTAL
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Mərkəzi Rəqəmsal Kampus & Vahid Giriş (SSO) Ekosistemi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>SSO Broker Aktiv</span>
          </div>

          <a
            href="https://github.com/tdv-community-labs"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-white/10">
              <Terminal className="h-3.5 w-3.5" />
              <span>GitHub Org</span>
              <ExternalLink className="h-3 w-3 text-zinc-500" />
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
