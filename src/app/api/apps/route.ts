import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const revalidate = 60; // Cache for 60 seconds

const FALLBACK_APPS = [
  {
    id: "tdv-e-school",
    name: "TDV E-Məktəb Portalı",
    description: "Akademik idarəetmə paneli, fənlər, dərslər, sınaq imtahanları və Süni İntellekt fərdi müəllim.",
    url: "https://tdv-e-school.vercel.app",
    category: "Təhsil",
    badge: "Yeniləndi",
    icon_name: "GraduationCap",
    accent_color: "from-blue-600 to-indigo-600",
    order_index: 1,
    status: "Aktiv",
  },
  {
    id: "school-minifootball-tournament",
    name: "Mini-Futbol Turniri Liqası",
    description: "Məktəblərarası çempionatın canlı nəticələri, turnir cədvəli, playoff mərhələsi və Qızıl Butsi bombardir statistikası.",
    url: "https://school-minifootball-tournament.vercel.app",
    category: "İdman",
    badge: "Playoffs Canlı",
    icon_name: "Trophy",
    accent_color: "from-emerald-600 to-teal-600",
    order_index: 2,
    status: "Aktiv",
  },
  {
    id: "tdv-boardgames",
    name: "TDV Arena Boardgames",
    description: "Klassik və strateji stolüstü oyunlar platforması: Şahmat, Dama, Nərd və rəqabətli onlayn matçlar.",
    url: "https://tdv-boardgames.vercel.app",
    category: "Oyunlar",
    badge: "Çoxoyunçulu",
    icon_name: "Gamepad2",
    accent_color: "from-amber-600 to-orange-600",
    order_index: 3,
    status: "Aktiv",
  },
  {
    id: "tdv-mafia",
    name: "TDV Mafia Sosial Deduksiya",
    description: "Dostlarla və lisey yoldaşları ilə interaktiv qaranlıq mafiya sessiyaları, rollar və səsvermə sistemi.",
    url: "https://tdv-mafia-pzvc.vercel.app",
    category: "Oyunlar",
    badge: "Populyar",
    icon_name: "Users",
    accent_color: "from-purple-600 to-pink-600",
    order_index: 4,
    status: "Aktiv",
  },
  {
    id: "tdv-games",
    name: "TDV Retro Arcade & Mini-Games",
    description: "Maraqlı mini-oyunlar, 2048, Snake, Flappy və məktəb rekordu mübarizəsi.",
    url: "/games.html",
    category: "Oyunlar",
    badge: "Arcade",
    icon_name: "Sparkles",
    accent_color: "from-cyan-600 to-blue-600",
    order_index: 5,
    status: "Aktiv",
  },
];

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("hub_apps")
      .select("*")
      .order("order_index", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json(FALLBACK_APPS);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(FALLBACK_APPS);
  }
}
