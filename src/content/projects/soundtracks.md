---
title: Soundtracks
description: An iOS app for the memories tied to songs. Log the moment while it's fresh, and let the song bring you back to it later.
date: 2026-02-12
status: shipped
stack: [Expo, React Native, TypeScript, Supabase]
tags: [mobile, ai-agents, evals]
repo: https://github.com/jsphelps12/music-memory-app
url: https://apps.apple.com/us/app/soundtracks/id6759203604
featured: true
---

Soundtracks is a memory app, live on the App Store. You log a moment along with the song that goes with it, and later the app uses the song to bring you back to the moment.

## Problem

Years ago I was driving back to Provo from Goblin Valley in central Utah with my friends, listening to "Runaway" by Kanye West for the first time. That song and that moment are tied together in my head for good. Once I noticed it, I saw it everywhere: a lot of my memories are attached to a song.

I wanted one place to hold all of that: the moment, the song, what I'm listening to and how my taste changes over time. Music can pull you back to a single afternoon or a whole era of your life, so in a way the app is a time machine. It isn't a music app, and it isn't really a journal. Music is just the way back in.

It's a personal project. I love music, and blowing up was never the success metric.

## Approach

**A moment is a song plus whatever you want to remember.** You can add a note, photos, moods, the people you were with, a place and a date. The app fills in the time of day and the weather. Songs come from Apple Music, with Spotify added later.

**Capture has to be nearly free.** Memories fade fast, so the goal the whole way through has been cutting the steps between "this song means something" and having it saved. My favorite feature is the share extension: you can log a song straight from the Music app, or start from a photo in the Photos app, without opening Soundtracks first. A home screen widget does the same from anywhere on the phone.

**Logging is the investment; getting it back is the payoff.** The Rediscover tab and notifications bring old moments back: On This Day, A Month Ago, a weekly rewind and a random memory now and then.

**Memories are shared with the people who were there.** You can send a moment to a friend, build shared albums, and send a link to someone who doesn't have the app yet.

The stack is Expo / React Native with Supabase for auth, Postgres and storage. I'm glad I went with React Native: putting it on Google Play is now an easy decision instead of a rewrite.

**How I built it.** Soundtracks was also where I practiced building with Claude Code. I turned features into PRDs, split those into slices, and ran them through an orchestrator → executor → evaluator setup. The evaluator checks the tests, then drives the iPhone simulator with Maestro end-to-end tests to try the new feature and rerun old regressions. That caught bugs unit tests never would have. In one, song search dropped keystrokes under load: the test typed "Bohemian Rhapsody" and the field ended up with "Bdy," because a re-render was overwriting text the keyboard had already accepted.

## Evaluation

I don't have polished numbers, and I haven't tried to produce them. What I can say:

- **People find it and try it.**
- **Activation works.** New users log their first few moments. Onboarding offers a quick capture, or a longer one that shows how much a moment can hold.
- **Retention doesn't work yet.** Most people don't stay.
- **End-to-end testing paid off,** especially in the friend features, where most bugs only showed up across accounts and screens.

## What failed

Retention. The resurfacing features only work on what you've already logged. On This Day has nothing to show a new user until a year after their first moment. So in the early weeks, the app asks for the investment and has no payoff to give back yet. Until then, a journal depends on the user remembering to open it, and that isn't enough.

## What's next

Pull in Apple Music listening history. Find songs someone played a lot and hasn't played in a while, guess which ones might mean something, and send a notification asking about the memory behind them. That gives a brand-new user something to rediscover on day one, and turns the app from "remember to open it" into "it reaches out to you."
