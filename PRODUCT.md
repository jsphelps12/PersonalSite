# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: hiring managers and recruiters for applied AI roles.** They arrive from a resume, LinkedIn or an application. They skim the home page in seconds, then dig into one project or post to judge craft, judgment and whether Josh is someone they'd want on a team.

**Secondary: readers** who find a soccer analysis or AI post and come back for the takes and predictions. Josh's own use (a place to think out loud) matters but is not the design driver.

## Product Purpose

joshuaphelps.com is Josh Phelps' personal site: a portfolio and blog that shows an applied AI engineer with real opinions who is also a real person. Success means a recruiter leaves thinking Josh is clearly good *and* someone they'd want to grab a beer with ("fun & real"), and a reader has a reason to come back.

## Positioning

The site doesn't just list skills. It shows judgment in public: project writeups framed as case studies with evals and failures, soccer analysis built on real data, and timestamped predictions that get scored (Josh vs. AI vs. Josh's model vs. the market). The combination of applied AI, soccer analytics and accountability for being wrong is the thing a generic portfolio can't copy.

## Operating Context

- Content is Markdown/MDX in git, validated by Astro content collections (`src/content.config.ts`): posts, takes, projects, shelf.
- Posts span categories: tech, ml, sports (analysis), adventure (trip reports with stats), life.
- Takes are a microblog; a take can carry a prediction (claim, confidence, resolution date, outcome, market probability).
- Planned: posting via an MCP server, a predictions ledger with calibration and AI hotness scoring, JoshGPT (visitors submit prompts, Josh answers; later an AI version), "Ask the site" RAG, soccer viz components (radar/pizza charts, heat maps, pitch plots).

## Capabilities and Constraints

- Static Astro 7 site with MDX, RSS and sitemap, deployed to Cloudflare. Server routes come later for JoshGPT and the ledger.
- Pages: Home, Writing, Sports, Takes, Projects, Shelf, Now, About, Colophon, 404.
- Must stay easy to maintain: few sections, each worth keeping fresh. A section ships only when it has real content.
- Data visualization (soccer charts, calibration charts) is a first-class future content type and must sit naturally inside articles in light and dark themes.

## Brand Commitments

- Name: Joshua Phelps / Josh. Domain joshuaphelps.com.
- Voice: cheeky, but with substance. Fun and real; opinionated without being toxic. Humor is welcome (e.g., the 404 is "Offside").
- "Very much me": no generic templates, and not random. Everything fits Build / Think / Do / Consume.

## Evidence on Hand

- No photos (of Josh, trips or projects) yet. The design must work typographically without photography, and must not use stock or fabricated imagery.
- Real content so far: this site as a project. Everything else is marked SAMPLE and is placeholder.
- No testimonials, employers, metrics or credentials have been provided. Do not invent any.

## Product Principles

1. **Show judgment, not just output.** Evals, tradeoffs, misses and predictions beat polish.
2. **Fun and real.** Personality is in the writing and details, never at the cost of credibility with a recruiter.
3. **Skimmable first, deep second.** A recruiter gets who Josh is in seconds, and every piece rewards reading.
4. **Not random.** Every section earns its place and fits the Build / Think / Do / Consume frame.
5. **Accountable in public.** Being wrong is shown, scored and owned.
