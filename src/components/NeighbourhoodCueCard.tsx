"use client";

import { NeighbourhoodProfile } from "@/types/profile";

const BADGE_COLORS: Record<string, string> = {
  "Urban Core": "bg-rose-100 text-rose-600",
  "Cultural Hub": "bg-teal-100 text-teal-600",
  "Student District": "bg-violet-100 text-violet-600",
  "Suburban & Diverse": "bg-orange-100 text-orange-600",
  "Emerging": "bg-yellow-100 text-yellow-700",
  "Residential": "bg-blue-100 text-blue-600",
  "Entertainment District": "bg-pink-100 text-pink-600",
};

const PILL_COLORS = [
  "bg-orange-100 text-orange-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
];

interface Props {
  name: string;
  profile: NeighbourhoodProfile | null;
  loading: boolean;
  onLearnMore: () => void;
  onClose: () => void;
}

export default function NeighbourhoodCueCard({
  name,
  profile,
  loading,
  onLearnMore,
  onClose,
}: Props) {
  const badgeClass = profile?.primary_badge
    ? (BADGE_COLORS[profile.primary_badge] ?? "bg-gray-100 text-gray-600")
    : "";

  const allKeywords = [
    ...(profile?.best_for ?? []),
    ...(profile?.secondary_badges ?? []),
  ];

  return (
    <div className="absolute right-6 top-6 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-500 hover:bg-gray-100 text-xs z-10"
      >
        ✕
      </button>

      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900 pr-8 leading-tight">{name}</h2>

        {loading && (
          <div className="mt-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
          </div>
        )}

        {profile && !loading && (
          <>
            {/* Badge + vibe */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {profile.primary_badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                  {profile.primary_badge}
                </span>
              )}
              {profile.vibe && (
                <span className="text-gray-400 text-xs">{profile.vibe}</span>
              )}
            </div>

            {/* Summary */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Summary
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">{profile.summary}</p>
            </div>

            {/* Demographics */}
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Demographics
              </p>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                {profile.demographics}
              </p>
              <button
                onClick={onLearnMore}
                className="mt-2 px-3 py-1 bg-orange-50 hover:bg-orange-100 text-orange-500 text-xs font-semibold rounded-full transition-colors"
              >
                Learn More
              </button>
            </div>

            {/* Keywords */}
            {allKeywords.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Keywords
                </p>
                <div className="flex flex-wrap gap-1">
                  {allKeywords.slice(0, 5).map((kw, i) => (
                    <span
                      key={kw}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${PILL_COLORS[i % 3]}`}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: "linear-gradient(135deg, #F97316, #EC4899)" }}>
          G
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-700">GeoZones</p>
          <p className="text-xs text-gray-400">AI-powered insights</p>
        </div>
      </div>
    </div>
  );
}
