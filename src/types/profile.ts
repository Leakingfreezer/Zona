export interface NeighbourhoodProfile {
  vibe: string;
  summary: string;
  demographics: string;
  hotspots: string[];
  traffic: string;
  income_tier: string;
  business_density: string;
  best_for: string[];
  age_distribution?: {
    "0-17": number;
    "18-34": number;
    "35-54": number;
    "55+": number;
  };
  ethnicity_mix?: Record<string, number>;
  business_mix?: Record<string, number>;
  walkability_score?: number;
  transit_score?: number;
  density_score?: number;
  primary_badge?: string;
  secondary_badges?: string[];
}
