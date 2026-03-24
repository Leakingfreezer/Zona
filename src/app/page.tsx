"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";

const TorontoMap = dynamic(() => import("@/components/TorontoMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-950">
      <p className="text-gray-500 text-sm">Initializing map...</p>
    </div>
  ),
});

interface NeighbourhoodProfile {
  vibe: string;
  summary: string;
  demographics: string;
  hotspots: string[];
  traffic: string;
  income_tier: string;
  business_density: string;
  best_for: string[];
}

export default function Home() {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [profile, setProfile] = useState<NeighbourhoodProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleZoneHover = useCallback(async (_name: string | null) => {}, []);

  const handleZoneClick = useCallback(async (name: string) => {
    setActiveZone(name);
    setProfileLoading(true);
    setProfile(null);
    try {
      const res = await fetch(`/api/profile/${encodeURIComponent(name)}`);
      const data = await res.json();
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  return (
    <div className="flex h-full bg-gray-950">
      <aside className="w-80 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white tracking-tight">Zona</h1>
          <p className="text-gray-400 text-sm mt-1">Toronto market explorer</p>
        </div>

        <div className="p-6 flex flex-col gap-4 flex-1">
          {!activeZone && (
            <>
              <p className="text-gray-500 text-xs uppercase tracking-widest">Explore</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Click any zone to see its demographic profile.
              </p>
            </>
          )}

          {activeZone && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Neighbourhood</p>
                <h2 className="text-white font-bold text-base">{activeZone}</h2>
                {profile && (
                  <span className="text-blue-400 text-xs">{profile.vibe}</span>
                )}
              </div>

              {profileLoading && (
                <p className="text-gray-500 text-sm">Loading profile...</p>
              )}

              {profile && !profileLoading && (
                <>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Overview</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{profile.summary}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Demographics</p>
                    <p className="text-gray-300 text-sm">{profile.demographics}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Hotspots</p>
                    <ul className="flex flex-col gap-1">
                      {profile.hotspots.map((h) => (
                        <li key={h} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">›</span>{h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Traffic", value: profile.traffic },
                      { label: "Income", value: profile.income_tier },
                      { label: "Businesses", value: profile.business_density },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-800 rounded-lg p-2 text-center">
                        <p className="text-gray-500 text-xs">{label}</p>
                        <p className="text-white text-xs font-medium capitalize mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Best for</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.best_for.map((b) => (
                        <span key={b} className="bg-blue-900/40 text-blue-300 text-xs px-2 py-1 rounded-full">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800">
          <p className="text-gray-600 text-xs">
            Data:{" "}
            <a
              href="https://open.toronto.ca/dataset/neighbourhoods/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Toronto Open Data
            </a>
          </p>
        </div>
      </aside>

      <main className="flex-1 relative">
        <TorontoMap onZoneHover={handleZoneHover} onZoneClick={handleZoneClick} activeZone={activeZone} />
      </main>
    </div>
  );
}
