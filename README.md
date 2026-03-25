# Zona - Find your market! 

## Work in Progress
Figma branding/design process: https://www.figma.com/design/yVWkDdQK1MUVnUOiGRooaC/Zona-Branding-design?node-id=323-2&t=bYfhYwhqbB9qd3d2-1 
System Architecture flow: https://www.figma.com/board/SOETxYH98piTRqjI4XzuMk/Zona-Architecture-System-Flow?node-id=0-1&t=bYfhYwhqbB9qd3d2-1

## Getting Started
Zona started at a hackathon when I was experimenting with the Mapbox API, I realized how powerful it could be for building visual, interactive tools around geography.

At the same time, I’m a spatial designer with UW Reality Labs, where I think a lot about how we interact with space, how our hands, eyes, and movement translate into understanding environments. That made me want something more immersive for exploring real-world geography, especially for things like urban planning or business decisions.

### That’s where Zona came from.

It takes a really overwhelming question — “where do I even begin?” — and turns it into something visual and understandable. It solves a real problem, but it’s also flexible. You can use it out of curiosity, for a project, or to actually guide how you launch or market something. I see Zona as a space for high-agency builders, whether you’re just exploring ideas or trying to make something real, it's to ground your thinking in the real world instead of guessing.

### Prerequisites
- Node.js v18 or higher
- npm (comes with Node)

### Accounts & API keys (All free tiers work)
- Mapbox — create account → get a public token → add localhost:3000 to allowed URLs
- Anthropic — create account → add credits → generate API key
- Supabase — create project → create a table:

create table neighbourhood_profiles (
  id bigint generated always as identity primary key,
  name text unique not null,
  profile jsonb not null
);
→ copy the project URL and anon key

## Steps to use project
### 1. Clone the repo
git clone <repo-url>
cd geo-zones

### 2. Install dependencies
npm install

### 3. Create environment file
cp .env.example .env.local
#### Fill in your 4 keys:
- NEXT_PUBLIC_MAPBOX_TOKEN=
- ANTHROPIC_API_KEY=
- NEXT_PUBLIC_SUPABASE_URL=
- NEXT_PUBLIC_SUPABASE_ANON_KEY=

### 4. Run the dev server
npm run dev
Open http://localhost:3000

## 🌍 Purpose
I love the Waterloo community. It’s a place that constantly pushes out high-agency builders: students launching startups, YC-level thinkers, people who don’t just ideate but actually create. I see myself in that.

But even with strong ideas, one thing is often missing: the right audience in the right place.

Deciding where to pitch an idea for which audience is still driven by gut feeling, surface-level trends, or extensive research. Student founders and small business owners rarely have access to structured, data-backed insights about who actually lives in an area, what they need, and what’s missing.

Zona was built to change that --> making location intelligence accessible by turning messy geographic, demographic, and environmental data into clear, actionable insights for real-world decisions.

## 💡 Solution
I built Zona because I kept running into the same problem — we have good ideas, but no real way of knowing where they actually make sense.

Zona takes messy location data — things like demographics, traffic, income signals, and business density — and turns it into something I can actually understand and use. Instead of just maps or raw stats, it breaks areas down into clear “zones” and explains what each one is like, who lives there, and what kind of businesses would fit.

The goal isn’t to be another analytics dashboard. I wanted something that helps me answer simple questions like:
- Who lives here?
- What’s the vibe of this area?
- Is there unmet demand?
- What businesses would actually succeed here?

Future implementation: For retailers & sales representatives
- where should I sell?
- what should I sell here, what does my product mix look like?
- how would I reach this audience?

It does this by:
- Aggregating location-based data (demographics, traffic, density, income signals)
- Structuring areas into interpretable “zones”
- Generating human-readable summaries + personas
- Highlighting opportunity gaps and business fit

It’s basically a way to go from random idea → grounded decision, without guessing.

## Zona
