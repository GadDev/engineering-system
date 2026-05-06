# Engineering System: Onboarding Guide

> For: new team members  
> Prerequisites: Node.js ≥ 20.19.0, Claude Code installed

---

## What This System Is

This repo gives your team a structured way to build software with AI assistance. Instead of jumping straight to code, every change goes through a lightweight process that forces clarity before execution.

Two frameworks work together:

- **OpenSpec** — turns a feature idea into structured artifacts (proposal, design, tasks) before any code is written
- **Compound Engineering** — drives execution, review, and learning through Claude Code slash commands

The result: every feature has a paper trail, every decision is traceable, and the team accumulates knowledge instead of repeating mistakes.

---

## Setup (Do This Once Per Project)

### 1. Install OpenSpec

```bash
npm install -g @fission-ai/openspec@latest
```

### 2. Initialize OpenSpec in your project

```bash
cd your-project
openspec init
```

This creates a `.opsx/` config directory.

### 3. Install Compound Engineering in Claude Code

Open Claude Code in your project directory and run:

```
/plugin marketplace add EveryInc/compound-engineering-plugin
/plugin install compound-engineering
/ce-setup
```

---

## How CLAUDE.md Works — Read This First

`CLAUDE.md` is not just documentation. It is the **system prompt** that changes how Claude behaves in this project. When you open Claude Code in this directory, it reads `CLAUDE.md` automatically and follows its rules.

This means:
- Claude will refuse to implement without a `tasks.md`
- Claude will enforce the workflow steps in order
- Claude will ask you to run the correct command if you try to skip steps

**Do not modify `CLAUDE.md` without understanding what you're changing.** It is shared infrastructure for the whole team.

---

## The Three-Tier Workflow

Not every change needs the same process. Choose your tier before starting:

| Tier | When to use | Time horizon |
|---|---|---|
| **1 — Hotfix** | Bug, typo, config tweak, obvious scope | < 2 hours |
| **2 — Standard Feature** | Clear requirements, fits in a sprint | < 1 week |
| **3 — Major Feature** | New product area, architectural change, cross-team impact | > 1 week |

**When in doubt, go one tier up.** Over-speccing a small feature costs an hour. Under-speccing a major feature costs weeks of rework.

---

## Tier 1: Hotfix

Use when the problem and solution are both obvious.

```
/ce-debug "describe the issue"
```

Claude investigates, identifies the root cause, and proposes a targeted fix.

```
/ce-code-review
```

Claude reviews its own fix before you ship it. **Never skip this** — even for small changes, the review catches edge cases and produces a record of what changed and why.

For non-trivial bugs (anything that reveals a systemic issue), also run `/ce-compound` — bugs often expose patterns worth capturing for the team.

---

## Tier 2: Standard Feature

Use when you know what you want to build but need to structure it before writing code.

### Step 1 — Propose

```
/opsx:propose feature-name
```

Claude creates three artifacts in your project:

| Artifact | Content |
|---|---|
| `proposal.md` | Why this feature, who it serves, what success looks like |
| `design.md` | Technical approach and architecture decisions |
| `tasks.md` | Ordered implementation checklist |

**Stop here and read the artifacts.** The spec is only valuable if you've validated it against your intent. Correct scope errors now — after `/ce-work` starts, changes are expensive.

### Step 2 — Plan

```
/ce-plan
```

Claude reads `tasks.md` and produces an ordered execution plan. This is your last cheap opportunity to adjust scope.

### Step 3 — Execute

```
/ce-work
```

Claude works task by task. Stay in the loop — respond to questions, don't approve blindly.

### Step 4 — Review

```
/ce-code-review
```

Claude reviews the full changeset against `proposal.md` and `tasks.md`. It flags deviations, missing cases, and quality issues. Expect findings — that's the point.

### Step 5 — Capture learnings

```
/ce-compound
```

Claude extracts what worked, what didn't, and patterns to reuse. This step is what makes the system compound over time. **It takes two minutes. Do not skip it.**

---

## Tier 3: Major Feature

Use when scope crosses teams, affects architecture, or is unclear enough that strategy must be defined first.

```
/ce-strategy
```
Defines product direction, target users, metrics, constraints. Produces `STRATEGY.md`. This document prevents scope creep in every downstream step.

```
/ce-ideate
```
Explores multiple solutions, ranks them, and recommends one. Required for Tier 3 — don't commit to an approach before this runs.

```
/opsx:propose
/opsx:apply
```
Specs the chosen solution and applies it into the project structure.

```
/ce-plan
/ce-work
/ce-code-review
/ce-compound
```
Same as Tier 2 — plan, execute, review, capture.

```
/ce-product-pulse
```
After shipping, captures real-world feedback. Saved in `docs/pulse-reports/`. Feeds back into the next strategy cycle.

---

## Artifact Reference

These are the files OpenSpec creates. Know their shape so you can validate them quickly.

Full templates live in [`templates/`](../templates/). The shapes below are quick-reference summaries.

### proposal.md — [`templates/proposal.md`](../templates/proposal.md)

Key sections: Problem, Goal, Success Criteria, User Impact, Out of Scope, Dependencies, Open Questions.

The most important section is **Success Criteria** — the CI blocks merges if it's missing or empty.

### design.md — [`templates/design.md`](../templates/design.md)

Key sections: Approach, Architecture, Architecture Decisions, Data Model Changes, API Changes, Risks, Out of Scope.

Write at the decision level. Implementation detail belongs in the code.

### tasks.md — [`templates/tasks.md`](../templates/tasks.md)

Key sections: Status, Setup, Core Implementation, Tests, Cleanup, Notes.

The **Notes** section is where you document deviations from `design.md` — keep them out of code comments.

### STRATEGY.md — [`templates/STRATEGY.md`](../templates/STRATEGY.md) (Tier 3 only)

Key sections: Direction, Target Users, Metrics, Constraints, Out of Scope, Open Questions.

The CI blocks `major/*` and `epic/*` PRs if this file is missing or incomplete.

---

## Your First Feature: A Walkthrough

Let's say you're building a "user preferences" page. Walk through **Tier 2**.

**Decide the tier.** Clear scope, < 1 week → Tier 2.

**Propose.**
```
/opsx:propose user-preferences
```
Claude generates the three artifacts. Read `proposal.md` — does it capture the right success criteria? Read `design.md` — is the technical approach accurate? Correct anything before continuing.

**Plan.**
```
/ce-plan
```
Review the execution order Claude produces. Are dependencies sequenced correctly? Any tasks missing?

**Execute.**
```
/ce-work
```
Claude works through the checklist. You review each significant change.

**Review.**
```
/ce-code-review
```
Claude checks the code against the spec. Expect it to find gaps — that's what it's for.

**Capture.**
```
/ce-compound
```
Two minutes. Don't skip it.

---

## Optional Command: /ce-brainstorm

```
/ce-brainstorm
```

Use this before `/ce-plan` when the approach isn't obvious. Claude explores multiple implementation paths and recommends one. It's optional for Tier 2 and useful for Tier 3 before `/ce-ideate`.

---

## Common Mistakes

**Skipping artifact review after `/opsx:propose`.**  
Claude generates specs in good faith but can get scope wrong. If you don't read and correct `proposal.md` before continuing, you're executing the wrong spec.

**Using Tier 3 for everything.**  
`/ce-strategy` on a bug fix is overhead, not rigor. Match the tier to the task.

**Skipping `/ce-compound`.**  
This is the most commonly skipped step and the one that makes the system compound. Skip it and the team restarts from zero every sprint.

**Editing `tasks.md` mid-execution without re-running `/ce-plan`.**  
Claude uses the plan to track state. Editing tasks outside the workflow produces inconsistent behavior.

**Treating the workflow as optional.**  
For a team new to spec-driven development, consistency matters more than speed in the first month. The overhead pays back within one sprint cycle.

---

## Quick Reference

| Command | Tier | What it does |
|---|---|---|
| `/ce-debug` | 1+ | Investigates a bug, identifies root cause |
| `/ce-code-review` | 1+ | Reviews changeset against spec |
| `/opsx:propose` | 2+ | Creates proposal.md, design.md, tasks.md |
| `/ce-plan` | 2+ | Builds execution plan from tasks.md |
| `/ce-work` | 2+ | Executes the plan task by task |
| `/ce-compound` | 2+ | Captures learnings for future reuse |
| `/ce-brainstorm` | Optional | Explores approaches before planning |
| `/ce-strategy` | 3 | Defines product direction → STRATEGY.md |
| `/ce-ideate` | 3 | Explores and ranks solution options |
| `/opsx:apply` | 3 | Applies spec into project structure |
| `/ce-product-pulse` | 3 | Captures post-ship feedback |
