import { NextResponse } from "next/server";

// Data source: Code for America — Click That Hood
// Toronto neighbourhoods GeoJSON (140 neighbourhoods)
const GEOJSON_URL =
  "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/toronto.geojson";

export async function GET() {
  try {
    const res = await fetch(GEOJSON_URL, { next: { revalidate: 86400 } });

    if (!res.ok) {
      throw new Error(`GeoJSON fetch returned ${res.status}`);
    }

    const geojson = await res.json();

    return NextResponse.json(geojson, {
      headers: {
        "Cache-Control": "public, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Failed to fetch Toronto neighbourhoods:", error);
    return NextResponse.json(
      { error: "Failed to fetch neighbourhood data" },
      { status: 500 }
    );
  }
}
