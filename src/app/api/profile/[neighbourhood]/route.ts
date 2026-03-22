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

  // Return cached profile if it exists
  const { data: cached } = await supabase
    .from("neighbourhood_profiles")
    .select("profile")
    .eq("name", name)
    .single();

  if (cached) {
    return NextResponse.json(cached.profile);
  }

  // Generate profile with Claude
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate a demographic and lifestyle profile for the Toronto neighbourhood: "${name}".

Return a JSON object with exactly these fields:
{
  "vibe": "2-3 word vibe (e.g. 'Trendy & young')",
  "summary": "2-3 sentence plain-English overview of the neighbourhood",
  "demographics": "Who mainly lives here — ethnicity, age groups, income level",
  "hotspots": ["up to 4 key landmarks, streets, or transit hubs"],
  "traffic": "low | medium | high",
  "income_tier": "low | medium | high | mixed",
  "business_density": "low | medium | high",
  "best_for": ["up to 3 business types that would thrive here"]
}

Return only valid JSON, no markdown fences.`,
      },
    ],
  });

  const raw =
    message.content[0].type === "text" ? message.content[0].text : "{}";
  const text = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  const profile = JSON.parse(text);

  // Save to Supabase so next hover is instant
  await supabase.from("neighbourhood_profiles").insert({ name, profile });

  return NextResponse.json(profile);
}
