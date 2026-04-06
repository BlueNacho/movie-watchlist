"use client";

import { useEffect, useState } from "react";
import { WifiHigh, SignalHigh, BatteryMedium } from "lucide-react";

export function StatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      setTime(new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }));
    }
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between px-5 py-1.5 bg-theme-badge border-b-3 border-theme-border text-xs font-mono font-bold text-theme-text">
      <span>{time}</span>
      <div className="flex items-center gap-1">
        <SignalHigh size={16} strokeWidth={2.5} />
        <WifiHigh size={20} strokeWidth={2.5} className="-mt-1"/>
        <BatteryMedium size={20} strokeWidth={2} className="ml-0.5" />
      </div>
    </div>
  );
}
