---
title: Soundtracks
description: An iOS journal for the songs tied to your memories, and an experiment in how much of an app I could hand off to Claude Code while still steering it.
date: 2026-02-12
status: shipped
stack: [Expo, React Native, TypeScript, Supabase]
tags: [evals, ai-agents, mobile]
repo: https://github.com/jsphelps12/music-memory-app
url: https://apps.apple.com/us/app/soundtracks/id6759203604
featured: true
---

Soundtracks is a journal for the links between music and memory, live on the App Store. It was also my testbed for one question: how much of building an app can I hand off to AI while still steering it where I want it to go?

## Problem

Years ago I was driving back to Provo from Goblin Valley in central Utah with my friends, listening to "Runaway" by Kanye West for the first time. That song and that moment are tied together in my head for good. Once I noticed it, I saw it everywhere: a lot of my memories are attached to a song.

I wanted one place to hold all of that. Record the moment and the song, keep track of what I'm listening to and how my taste changes over time, and journal normally when I feel like it. Music has a way of pulling you back to a moment or a whole era of your life, so in a way the app is a time machine.

It's a personal project. I love music, and I wanted a real app to practice building with Claude Code. Blowing up was never the success metric.

## Approach

The app is Expo / React Native with Supabase for auth, Postgres and storage. Songs come in through Apple Music, with Spotify support added later. I'm glad I went React Native: putting it on the Google Play Store is now an easy decision instead of a rewrite.

My favorite feature is the share extension. You can log a song straight from the Music app, or start from a photo in the Photos app, without opening Soundtracks first. Cutting the friction of capture has been the goal the whole way through.

How I built it mattered as much as what I built. I kept pushing to see how much I could automate:

- **Planning:** Claude helped with scaffolding, compared tech stacks with me, and sharpened my feature ideas. I practiced turning features into PRDs, splitting those into slices, and handing the slices to Claude to build.
- **Running agents:** I ran agents in parallel, set up loops, and tried orchestrator/sub-agent setups, including an orchestrator → executor → evaluator split.
- **Testing:** I practiced test-driven development, plus Maestro and end-to-end tests. The evaluator checks against the tests, then runs end-to-end tests and drives the iPhone simulator to try the new feature and to rerun regressions, so bugs I'd already fixed don't come back.
- **Design:** Most of the mocks came from Claude Design.

I also use the app myself and keep refining it from real use.

## Evaluation

I don't have polished numbers, and I haven't tried to produce them. What I can say:

- **People find it.** They download it and use it pretty often.
- **Activation works.** New users create a first few moments. The onboarding offers a quick capture and a longer one that shows how deep the app can go, and I think it's well done.
- **Retention doesn't work yet.** Most people don't stay. That's the problem I'm working on now (see below).
- **Simulator and end-to-end testing paid off.** It caught a lot that unit tests never could, especially in the friend features.

## What failed

Retention. The first session works, but the app doesn't yet give people a reason to come back. A journal depends on the user remembering to open it, and that isn't enough.

## What's next

- **Pull in Apple Music listening history.** Look at songs someone played a lot and haven't played in a while, guess which ones might mean something, and send a push notification asking them to log the memory behind it. This turns the app from "remember to open it" into "it reaches out to you."
- **A home screen widget** for quick capture, to cut friction further.
- **Back to the loop:** brainstorm with AI, clean up the UI, then run the next round of features through the workflow I've built up.
