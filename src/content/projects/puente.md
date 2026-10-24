---
title: Puente
description: A credit-building remittance app I co-founded and built as CTO. Sending money home to Mexico would also build your US credit. It moved real money, and we shut it down when the evidence said the business wouldn't work.
date: 2026-06-18
status: archived
stack: [TypeScript, Fastify, Next.js, React Native, Expo, Supabase]
tags: [ai-agents, evals, fintech]
repo: https://github.com/PuenteFinancial/PuenteApp
featured: true
---

Puente was a remittance app for LATAM immigrants in the US: send money to Mexico, and build your credit while you do it. It moved real money in production, and three months in we shut it down: better-funded competitors had already shown people wouldn't pay for what we were adding.

## Problem

The idea came from talking to immigrants themselves: how they send money home, and what they want financially. We also talked to a lot of experts across the industry. My own ties helped. My mom is from Venezuela, many of my friends are foreign students, and my co-founder married a Mexican immigrant.

I came from tech; he came from Capital One and financial products. Neither of us knew fintech. We learned all of it from zero: licensing, regulation, KYC, stablecoins, and how to build a system where a bug means someone loses money.

## Approach

**Partners.** We built on Bridge, a licensed money transmitter, for payouts to Mexico. It worked from zero volume with no big platform fees, and not many fintech providers are self-serve like that. Stripe collected the USD.

**Money correctness came first.** I wrote the ledger rules and the transfer state machine before any money code, then split the MVP into eight slices, starting with a double-entry ledger. The rules were non-negotiable: integer amounts (no floats), the ledger as the source of truth, an idempotency key on every endpoint that moves money, reversals as states rather than deletes, and nightly reconciliation.

**The harness came before the product.** On day one, alongside the scaffold, I set up the harness I'd build everything through. Nearly every commit was written with Claude, so the job was making that safe:

- **Reviewer agents.** One reviews security (secrets, auth, PII in logs). One reviews compliance (FCRA, Reg E, BSA/AML and more). Both run on any change that touches money, auth or credit.
- **A second model.** Claude reviewing Claude has correlated blind spots, so a review skill ran Codex headless and read-only over the branch's diff and saved its raw output to a file. Claude then had to quote every Codex finding word for word, before adding its own take, and call out any finding it disagreed with. A disagreement between the two models was my cue to read that code myself.
- **Strict CI/CD.** Typecheck after every edit, secret scanning, an API boot smoke test (added after a bad import crashed a deploy), and DB tests. Merging to main only reached staging. Production moved through an approval-gated promote, with migrations applied before code.
- **A decision log** for any choice that would make a future engineer ask "why on earth…". It has entries like reusing an existing state for cancel-before-pay instead of adding a new one, because a new state touched eight places for a row where no money ever moved.

The harness caught real bugs: a refund that the poller and an operator script could both pay out, a double credit when a late bank transfer cleared after a reversal, a rate-limit race in one-time passcodes, and a privacy note that would have wrongly told senders their SSN went to Stripe.

## Evaluation

We ran it with a lot of internal testers and a handful of real users, and the money moved to Mexico correctly. The ledger and reconciliation held up. One thing we hadn't modeled: Bridge would kick back some money because of FX, and the ledger had to account for it once we learned about it.

The best lesson was about what testing proves. A dispute that arrived two seconds before its funding event would have funded a transfer nobody knew was disputed, and it got past 1,886 passing unit tests. One run on staging against real providers caught it. Stripe doesn't guarantee the order of different event types, so the dispute landed on a transfer that wasn't funded yet, and there was nothing to hold. The payout only stopped because the same dispute had also frozen the sender. The fix: the dispute handler now marks the transfer as disputed whatever state it's in, and the funding handler checks for that mark and holds the payout. After that, I tracked whether each failure path had ever run against a real provider, not just whether its lines were covered.

The harness taught me the same thing. Our CI reviewer once went green while posting nothing. It took several fixes to make the check prove a review actually ran. A green check that isn't evidence of a review is worse than no check.

## What failed

The business. Credit building was the point, and offering it added costs on top of a plain remittance. Competitors with scale and money had tried this, and it didn't work for them because the willingness to pay wasn't there. Those added costs didn't make sense on unit economics. We also believe standalone remittance companies won't exist in five years. People's own banks are going global, as Revolut and Nubank already have, and sending money home will just be something your bank does. Stablecoin card products are already doing more than what we were building. We were building toward something that was being replaced.

The Stripe USDC on-ramp was the worst part of the build. The user should only ever feel like they're sending money, never like they're buying crypto, and the on-ramp didn't hide that. It also didn't share KYC with Bridge, so every user went through KYC twice, and its fees ate our margin and then some.

What I'd do differently: white-label an existing remittance app to get off the ground and get volume, then build the credit-building piece on top. By the time we figured that out, and had found a real way to do credit building, we'd decided to shut down.

## What's next

Puente is wound down, and the code is public. If I build in fintech again, I'd start from this harness: reviewer agents, a second model, and gates that demand evidence.
