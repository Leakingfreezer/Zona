import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ neighbourhood: string }> }
) {
  const { neighbourhood } = await params;
  const name = decodeURIComponent(neighbourhood);

  const { data: cached } = await supabase
    .from("neighbourhood_profiles")
    .select("profile")
    .eq("name", name)
    .single();

  if (cached) {
    return NextResponse.json(cached.profile);
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Generate a detailed demographic and business profile for the Toronto neighbourhood: "${name}".

Return a JSON object with exactly these fields:
{
  "vibe": "2-3 word vibe (e.g. 'Trendy & Young')",
  "summary": "2-3 sentence plain-English overview",
  "demographics": "Who mainly lives here — ethnicity, age groups, income level",
  "hotspots": ["up to 4 key landmarks, streets, or transit hubs"],
  "traffic": "low | medium | high",
  "income_tier": "low | medium | high | mixed",
  "business_density": "low | medium | high",
  "best_for": ["up to 3 business types that would thrive here"],
  "age_distribution": { "0-17": 22, "18-34": 28, "35-54": 30, "55+": 20 },
  "ethnicity_mix": { "Top group": 40, "Second group": 25, "Third group": 18, "Fourth group": 10, "Other": 7 },
  "business_mix": { "Food & Restaurant": 35, "Retail": 25, "Services": 20, "Education": 12, "Creative / Tech": 8 },
  "walkability_score": 68,
  "transit_score": 72,
  "density_score": 74,
  "primary_badge": "one of: Urban Core | Cultural Hub | Student District | Suburban & Diverse | Emerging | Residential | Entertainment District",
  "secondary_badges": ["up to 3 from: Foodie Haven | Nightlife | Family-Friendly | Arts Scene | Tech Hub | Luxury | Budget-Friendly | Student Hub | Transit Hub"]
}

Use realistic estimates based on Toronto neighbourhood knowledge. All percentage fields must sum to 100. Return only valid JSON, no markdown fences.`,
      },
    ],
  });

  const raw =
    message.content[0].type === "text" ? message.content[0].text : "{}";
  const text = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  const profile = JSON.parse(text);

  await supabase.from("neighbourhood_profiles").insert({ name, profile });

  return NextResponse.json(profile);
}
