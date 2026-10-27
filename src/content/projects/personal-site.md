---
title: joshuaphelps.com
description: This site. A Football Manager-style player profile for showing my work, plus an MCP server so I can post to it from a chat.
date: 2026-10-16
status: building
stack: [Astro, TypeScript, Cloudflare, MCP]
tags: [web, llm]
repo: https://github.com/jsphelps12/PersonalSite
url: https://joshuaphelps.com
featured: true
---

This site is my snapshot: who I am and what I can do, for hiring managers and for me. It went from an empty repo to live on joshuaphelps.com in a day, and everything on it since has been posted from a chat.

## Problem

I wanted a personal site for three reasons: to showcase my work, to practice building, and to make something that's mine. A resume and a LinkedIn profile tell you what I've done. I wanted a place that shows it, and that sounds like me.

## Approach

**Design.** I'm a football fan, so the site borrows from Football Manager's player profile screens: attributes out of 20, positions on a pitch, a form guide and a scout report. No deeper point; it's just fun, and it's true to me. A few details I like: ratings link to the posts and projects that back them up (a rating with no evidence shows as a range until it's proven), predictions are scored on the record, and the skin follows the visitor's clock from night to dawn to day.

**Posting by chat.** I built a local MCP server so Claude can write to the site for me. I wanted to build one, and I wanted to do everything from a chat. It has tools to draft posts and project writeups, post takes, resolve predictions, add books and films to the shelf, update the Now page, add photos and publish. Two rules keep it safe:

- Every write is validated against the site's own content schemas, shared by the site and the server, so the server can never write a file the site would reject.
- Nothing goes live until I say publish, which pushes to main. Cloudflare deploys from there.

The part I like most is the interviews. Prompts for trip reports and project writeups have Claude ask me questions a couple at a time, then draft in my words, never inventing facts, and save only after I approve. This page was written that way.

**Build.** Astro, TypeScript and plain Markdown in a git repo, hosted on Cloudflare. I built it with Claude Code without a tight harness, because the stakes are low. A personal site is the right place to move fast.

## Evaluation

It does what I wanted. It was live the day I started it, and since then a trip report, a take, three project writeups, and the About and Now pages have all gone up from a chat.

## What failed

- **A path traversal bug in the MCP server.** The edit tools built file paths straight from the ID the caller passed in, so an ID like `../../x` could reach Markdown files outside the content folder. IDs are now matched against the collection's real files.
- **iPhone photos.** The image library I used couldn't decode HEIC, so photos go through macOS's built-in converter first. Every photo has its metadata, including GPS, stripped before it's committed.
- **Shipping placeholders.** The first version went live with placeholder ratings and a draft scout report, labeled as drafts on the page. They stayed up for about a week before I replaced them with my own.

## What's next

- **A remote MCP server**, so I can post from anywhere, not just my laptop.
- **JoshGPT**, a version of me that's actually an AI.
- **"Ask the site"**: ask a question and get an answer from everything I've written here.
