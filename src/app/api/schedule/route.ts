import { NextResponse } from "next/server";

export async function GET() {
  const schedule = [
    { period: 1, name: "1-ci Dərs", startTime: "08:30", endTime: "09:15", breakAfter: "10 dəqiqə" },
    { period: 2, name: "2-ci Dərs", startTime: "09:25", endTime: "10:10", breakAfter: "10 dəqiqə" },
    { period: 3, name: "3-ci Dərs", startTime: "10:20", endTime: "11:05", breakAfter: "15 dəqiqə (Böyük tənəffüs)" },
    { period: 4, name: "4-cü Dərs", startTime: "11:20", endTime: "12:05", breakAfter: "10 dəqiqə" },
    { period: 5, name: "5-ci Dərs", startTime: "12:15", endTime: "13:00", breakAfter: "40 dəqiqə (Nahar)" },
    { period: 6, name: "6-cı Dərs", startTime: "13:40", endTime: "14:25", breakAfter: "10 dəqiqə" },
    { period: 7, name: "7-ci Dərs", startTime: "14:35", endTime: "15:20", breakAfter: "Dərslərin Sonu" },
  ];

  return NextResponse.json({
    date: new Date().toISOString(),
    schedule,
  });
}
