# CRESCO Key — Fallback Submission Packet Draft

Date: 2026-10-07
Mode: truthful fallback if physical Android/prod-wallet G1 is unavailable before submission.

## One-line Pitch

CRESCO Key lets a young person spend independently inside a standing Solana Key, while every exception is exact, guardian-approved once, and unable to widen the boundary.

## Short Description

CRESCO Key is an Android-first Solana Mobile prototype for progressive financial agency. Instead of giving a young person either full control or surveillance-heavy parental approval, CRESCO creates a standing Key for normal actions and a narrow guardian path for exceptions.

The product law is simple: the exception can move; the boundary cannot. In-bounds actions should pass through the standing Key. Out-of-bounds actions become an exact one-time request. If a guardian approves, only that exact action can execute once. Changed recipient, changed amount, replay, or stale approval must refuse.

## Truth-Bounded Status For Submission

Use this wording if no late G1 is captured:

> The CRESCO Key Devnet program is deployed and bootstrapped on Solana Devnet. The Android APK builds in CI, launches in emulator smoke tests, and passes a bounded Mobile Wallet Adapter session against the official Mock MWA wallet. The mobile app includes judge-facing loop orientation and public runtime receipt export. The final physical Android / production-wallet end-to-end G1 remains pending because no physical Android operator was available before submission.

Do not say "Live Core Loop proven" unless validated G1 receipts exist.

## Demo Video Script

### 0:00-0:05 — Hook

"Most youth finance apps choose between two bad defaults: total lock-down, or broad spending permission. CRESCO Key gives the young person real independence, but makes the boundary explicit."

Visual: role screen with Judge Path card.

### 0:05-0:25 — Product Loop

"This is the standing Key. Normal spending can happen without asking every time. But when the action crosses the boundary, CRESCO refuses first. That refusal is not an error; it is the product protecting the rule."

Visual: Young person flow, intent/checklist, boundary language.

### 0:25-0:50 — Guardian Exception

"The guardian does not grant broad permission. They review one exact action. They can say 'Not this time', or approve exactly this payment once."

Visual: Guardian screen, exact request data, Not this time / Allow Once controls.

### 0:50-1:20 — Consequence And Receipts

"After an exact approval, mutation and replay are still refused. The receipt is shareable because the judge, parent, or operator should be able to see what happened without needing secret material."

Visual: checklist receipt state, latest public runtime receipt area.

### 1:20-1:45 — Technical Backbone

"This is not a mock wallet screen. CRESCO has a distinct Solana Devnet program deployed at `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`, deterministic bootstrap state, Android APK CI evidence, emulator launch evidence, and Mobile Wallet Adapter session evidence."

Visual: GitHub Actions checks / Program ID / bootstrap identifiers.

### 1:45-2:10 — Truth Boundary

Use if no G1:

"The remaining proof is the final physical Android / production-wallet G1. The APK and mobile path are built, and the Devnet program is live, but I am not upgrading emulator or Mock MWA evidence into a physical-device claim."

Use if late G1 succeeds:

"Here is the final physical Android run: receipts exported from the mobile app, validated by the receipt validator, against the same deployed Devnet program."

### 2:10-2:25 — Close

"CRESCO Key is for the moment every family eventually hits: trust the young person more, without quietly erasing the boundary."

## Deck Outline

1. Title: CRESCO Key
   - Subtitle: "The exception moves. The boundary does not."
   - Show Android app first, not architecture first.

2. Problem
   - Youth finance today often collapses into lock-down, surveillance, or broad permission.
   - Real negative event: broad authorization fails when the changed action still inherits permission.

3. Product
   - Standing Key for normal actions.
   - Exact one-time guardian exception for boundary actions.
   - Mutation/replay refusal as product law.

4. Demo Flow
   - 5-unit in-bounds action.
   - 12-unit boundary refusal.
   - Guardian Not this time / Allow Once.
   - Changed recipient refused.
   - Exact retry once.
   - Replay refused.

5. Solana Mobile Native Value
   - Android APK.
   - Mobile Wallet Adapter integration.
   - Solana Pay-style payment intent.
   - Distinct Solana Devnet program.

6. Evidence
   - Program ID: `6SoGabSLX2YHMjFx1ynbz5nLFtd8Z7hURmszddU6DeJP`.
   - G0 Devnet deployment/bootstrap run: `37182728261`.
   - PR #56 UX surface merged: `32faa302e0253485482f6e1ac1d7c3bd71b0df14`.
   - APK / emulator / Mock MWA CI evidence.
   - If late G1 exists: validated receipt bundle.

7. What Is Not Claimed
   - No mainnet custody.
   - No production wallet compatibility unless proven.
   - No physical G1 unless receipts exist.
   - No securities/brokerage behavior.

8. Why It Can Become Bigger
   - The same primitive can become Chain of Keys: narrower delegated authority for agents, subscriptions, emergency exceptions, and family-scale coordination.

## Submission Form Copy

### Project Name

CRESCO Key

### Tagline

A Solana Mobile Key for youth financial independence where exact exceptions never widen the boundary.

### What It Does

CRESCO Key gives a young person bounded spending authority through a standing Key. When an action crosses the boundary, the app refuses first and creates an exact guardian request. The guardian can refuse or approve that one action once. Changed amount, changed recipient, stale approval, or replay cannot inherit the exception.

### How It Uses Solana Mobile

CRESCO is Android-first and uses Mobile Wallet Adapter flows, Solana Pay-style payment intents, and a distinct Solana Devnet program for the authority primitive. The mobile app is the primary product surface; the relay is coordination only and never becomes authority.

### What Is Built

- Android React Native app.
- Distinct Solana Devnet program.
- Deterministic Devnet bootstrap state.
- Boundary relay code with readiness endpoint.
- Mobile Wallet Adapter integration.
- Public runtime receipt export.
- Receipt validation tooling.
- Judge-facing mobile loop orientation.

### Evidence Boundary

The repository contains CI evidence for APK build, emulator launch, and bounded Mock MWA session behavior, plus a deployed Devnet program and deterministic bootstrap. If no late G1 is attached, the final physical Android/prod-wallet end-to-end run remains pending and is not claimed as proven.

## Late-G1 Replacement Checklist

Replace the fallback truth-boundary paragraph only if all are true:

- Physical Android device used.
- Compatible wallet used.
- Latest APK installed.
- Same deployed Program ID used.
- Public receipts exported from app.
- Receipt validator passes.
- Mutation/replay/refusal outcomes are represented.
- No private key material appears in receipts, screenshots, video, or repo.

## Links To Fill At Final Submission

- GitHub repository: https://github.com/Faadil1/cresco-key
- Pull request #56: https://github.com/Faadil1/cresco-key/pull/56
- Pull request #57: https://github.com/Faadil1/cresco-key/pull/57
- APK artifact: TODO final run/artifact link
- Demo video: TODO final uploaded video link
- Pitch deck: TODO final deck link
- G1 receipt bundle: TODO only if captured
- Final submission receipt: TODO human protected action
