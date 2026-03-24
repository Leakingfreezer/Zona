"use client";

import { useState } from "react";
import { NeighbourhoodProfile } from "@/types/profile";

// Brand palette
const ETHNICITY_COLORS = ["#F97316", "#EC4899", "#14B8A6", "#6366F1", "#94A3B8"];
const BUSINESS_COLORS = ["#F97316", "#EC4899", "#14B8A6", "#8B5CF6", "#F59E0B"];
const AGE_COLORS = ["#EF4444", "#EC4899", "#8B5CF6", "#3B82F6"];
const AGE_KEYS = ["0-17", "18-34", "35-54", "55+"] as const;

function buildConicGradient(data: Record<string, number>, colors: string[]) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 100;
  let cum = 0;
  const parts = Object.values(data).map((v, i) => {
    const pct = (v / total) * 100;
    const start = cum;
    cum += pct;
    return `${colors[i % colors.length]} ${start.toFixed(1)}% ${cum.toFixed(1)}%`;
  });
  return `conic-gradient(${parts.join(", ")})`;
}

function DonutChart({
  data,
  colors,
  centerLabel,
}: {
  data: Record<string, number>;
  colors: string[];
  centerLabel: string;
}) {
  const gradient = buildConicGradient(data, colors);
  const entries = Object.entries(data);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-28 h-28 rounded-full shrink-0"
        style={{ background: gradient }}
      >
        <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-700 text-center leading-tight px-1">
            {centerLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
        {entries.map(([label, value], i) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-xs text-gray-500">
              {label} {value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgeBarChart({ data }: { data: Record<string, number> }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-3">Working Population</p>
      <div className="space-y-2.5">
        {AGE_KEYS.map((key, i) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-10 text-xs text-gray-400 text-right shrink-0">{key}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                style={{
                  width: `${data[key] ?? 25}%`,
                  backgroundColor: AGE_COLORS[i],
                }}
                className="h-full rounded-full transition-all duration-500"
              />
            </div>
            <span className="w-8 text-xs text-gray-500 shrink-0">{data[key] ?? 25}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  const colorClass =
    value >= 70 ? "text-teal-500" : value >= 45 ? "text-orange-400" : "text-rose-400";
  const delta = value >= 50;

  return (
    <div className="flex flex-col bg-gray-50 rounded-xl p-3">
      <span className="text-xs text-gray-400 mb-1">
        {icon} {label}
      </span>
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
      <span className={`text-xs mt-0.5 ${delta ? "text-teal-400" : "text-rose-400"}`}>
        {delta ? "▲" : "▼"} /100
      </span>
    </div>
  );
}

const INCOME_MAP: Record<string, string> = {
  low: "$30K – $55K",
  medium: "$55K – $90K",
  high: "$90K – $150K+",
  mixed: "$30K – $120K",
};

function DemographicsTab({ profile }: { profile: NeighbourhoodProfile }) {
  const ageData = profile.age_distribution ?? {
    "0-17": 22,
    "18-34": 28,
    "35-54": 30,
    "55+": 20,
  };

  const ethnicityData = profile.ethnicity_mix ?? {
    "Diverse Mix": 60,
    "Other": 40,
  };

  const topEthnicity =
    Object.entries(ethnicityData).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  const oppScore = Math.round(
    ((profile.walkability_score ?? 65) + (profile.transit_score ?? 70)) / 2
  );

  return (
    <div className="space-y-6">
      {/* Row 1: age bars + score chips */}
      <div className="grid grid-cols-2 gap-6">
        <AgeBarChart data={ageData} />

        <div className="grid grid-cols-1 gap-2">
          <ScoreChip label="Density" value={profile.density_score ?? 60} icon="⬡" />
          <ScoreChip label="Walkability" value={profile.walkability_score ?? 65} icon="★" />
          <ScoreChip label="Transit" value={profile.transit_score ?? 70} icon="◆" />
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Row 2: details table + ethnicity donut */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">Details</p>
          <div className="space-y-2">
            {[
              { label: "Income Range", value: INCOME_MAP[profile.income_tier] ?? profile.income_tier },
              { label: "Foot Traffic", value: profile.traffic },
              { label: "Business Density", value: profile.business_density },
              { label: "Opp. Score", value: `${oppScore} / 100` },
              { label: "Top Hotspot", value: profile.hotspots?.[0] ?? "—" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between border-b border-gray-100 pb-1.5"
              >
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs font-medium text-gray-700 capitalize text-right max-w-[140px] truncate">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-300 mt-2">
            *AI estimate — {new Date().toLocaleDateString()}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">Ethnicity</p>
          <DonutChart
            data={ethnicityData}
            colors={ETHNICITY_COLORS}
            centerLabel={`Predominantly ${topEthnicity}`}
          />
        </div>
      </div>
    </div>
  );
}

function BusinessTab({ profile }: { profile: NeighbourhoodProfile }) {
  const businessData = profile.business_mix ?? {
    "Food & Restaurant": 35,
    Retail: 25,
    Services: 20,
    Education: 12,
    "Creative / Tech": 8,
  };

  const totalEstimate =
    profile.business_density === "high"
      ? 1800
      : profile.business_density === "medium"
      ? 900
      : 350;

  const topBusiness =
    Object.entries(businessData).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const bestOpp = profile.best_for?.[0] ?? topBusiness;

  const insightChips: { label: string; color: string }[] = [];
  if (profile.traffic === "high") {
    insightChips.push({ label: "High Foot Traffic", color: "bg-orange-100 text-orange-600" });
    insightChips.push({ label: "High Weekend Traffic", color: "bg-pink-100 text-pink-600" });
  }
  if (profile.traffic === "medium") {
    insightChips.push({ label: "Moderate Traffic", color: "bg-yellow-100 text-yellow-700" });
  }
  profile.secondary_badges?.forEach((b) => {
    insightChips.push({ label: b, color: "bg-teal-100 text-teal-600" });
  });

  return (
    <div className="space-y-6">
      {/* Row 1: donut + best opportunity */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-1">Current Business Mix</p>
          <p className="text-xs text-gray-400 mb-3">*including all types of businesses</p>
          <DonutChart
            data={businessData}
            colors={BUSINESS_COLORS}
            centerLabel={`Total ~${totalEstimate.toLocaleString()}`}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Best Opportunity</p>
            <div
              className="rounded-xl px-4 py-3 text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #14B8A6 0%, #3B82F6 100%)" }}
            >
              {bestOpp}
            </div>
          </div>

          {profile.best_for?.length > 1 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Market Gap Opportunity</p>
              <p className="text-sm font-medium text-gray-700">{profile.best_for[1]}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 mb-1">Positioning</p>
            <p className="text-sm font-medium text-gray-700">Complementary</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Insight chips */}
      {insightChips.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Insight Chips</p>
          <div className="flex flex-wrap gap-2">
            {insightChips.map((chip) => (
              <span
                key={chip.label}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${chip.color}`}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sector prospects */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-3">Sector Prospects</p>
        <div className="space-y-2">
          {Object.entries(businessData).map(([label, value], i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-32 text-xs text-gray-500 truncate shrink-0">{label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  style={{
                    width: `${value}%`,
                    backgroundColor: BUSINESS_COLORS[i % BUSINESS_COLORS.length],
                  }}
                  className="h-full rounded-full transition-all duration-500"
                />
              </div>
              <span className="w-8 text-xs text-gray-400 shrink-0 text-right">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Brand accent bar */}
      <div className="flex rounded-full overflow-hidden h-1.5">
        {Object.values(businessData).map((v, i) => (
          <div
            key={i}
            style={{ backgroundColor: BUSINESS_COLORS[i % BUSINESS_COLORS.length], flex: v }}
          />
        ))}
      </div>
    </div>
  );
}

interface Props {
  name: string;
  profile: NeighbourhoodProfile;
  onClose: () => void;
}

export default function DashboardModal({ name, profile, onClose }: Props) {
  const [tab, setTab] = useState<"demographics" | "business">("demographics");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{name}</h2>
              {profile.vibe && (
                <p className="text-gray-400 text-sm mt-0.5">{profile.vibe}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-sm shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setTab("demographics")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                tab === "demographics"
                  ? "bg-pink-500 text-white"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              Demographics
            </button>
            <button
              onClick={() => setTab("business")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                tab === "business"
                  ? "bg-orange-400 text-white"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              Business Opp.
            </button>
          </div>

          <div className="h-px bg-gray-100 mt-3" />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[62vh]">
          {tab === "demographics" ? (
            <DemographicsTab profile={profile} />
          ) : (
            <BusinessTab profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
}
