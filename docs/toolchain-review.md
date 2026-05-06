# Toolchain Review: OpenSpec + Compound Engineering

**Status:** Open — decision pending  
**Date:** 2026-05-05  
**Author:** Engineering System design session

---

## Context

This system combines two third-party tools:

- **OpenSpec** (`@fission-ai/openspec`) — generates structured feature artifacts (proposal, design, tasks)
- **Compound Engineering** (`EveryInc/compound-engineering-plugin`) — drives execution, review, and learning through Claude Code slash commands

This document evaluates whether this combination is the right long-term foundation for a team of 6 people new to spec-driven development.

---

## What the Combo Gets Right

**The lifecycle model is sound.** Strategy → Ideation → Spec → Execute → Review → Learn → Feedback is a well-structured loop. Named commands lower friction — `/ce-plan` is harder to skip than an informal instruction to "plan before coding."

**OpenSpec's artifact decomposition is solid.** Separating *why* (proposal.md), *how* (design.md), and *what to do* (tasks.md) is the right mental model and maps cleanly onto how engineers should think before writing code.

---

## Problems

### 1. Two external dependencies, both fragile

Neither `@fission-ai/openspec` nor `EveryInc/compound-engineering-plugin` is owned by the team. Either going unmaintained, changing its API, or conflicting with a Claude Code update breaks the entire workflow. For a template meant to be trusted by six people over months, this is the single biggest risk.

### 2. The Claude Code plugin ecosystem is young

`/plugin marketplace` is a new feature with sparse documentation and a thin ecosystem. Compound Engineering is one of very few plugins available. If Claude Code changes its plugin API — likely in a product this new — commands break without warning and newcomers won't know why.

### 3. The abstraction hides failures

When `/ce-plan` produces a bad output, a developer can't tell if the plugin is broken, if `CLAUDE.md` is conflicting with the plugin's own system prompt, or if the input just needs improvement. For a team new to the workflow, opaque failures kill trust fast.

### 4. No documented contract between the two tools

OpenSpec owns the artifact layer. Compound Engineering owns the execution layer. Both operate in the same Claude context with no documented interface between them. If `/ce-plan` reads a `tasks.md` in an unexpected format, failure attribution is unclear.

---

## Options

### Option A — Keep both tools as-is

**Pros:** Fast to set up, no custom work needed, lifecycle is fully covered out of the box.  
**Cons:** Two external dependencies, plugin instability risk, opaque failures, no team control.  
**Risk level:** High for a long-lived team template.

### Option B — Keep OpenSpec, replace Compound Engineering with native commands

Claude Code supports custom slash commands defined as markdown files in `.claude/commands/`. The Compound Engineering commands (`/ce-plan`, `/ce-work`, `/ce-code-review`, `/ce-compound`, etc.) can be reimplemented as native commands the team owns and controls.

**Pros:** One dependency instead of two, fully debuggable, team can modify commands, no plugin API risk, same developer experience.  
**Cons:** Requires a few hours to build the native commands, team must maintain them.  
**Risk level:** Low.

### Option C — Drop both tools, use CLAUDE.md + templates only

Rely entirely on `CLAUDE.md` rules, markdown artifact templates, and Claude's native intelligence to enforce the workflow.

**Pros:** Zero external dependencies, maximum transparency.  
**Cons:** No enforcement mechanism, commands are informal — harder for newcomers to follow consistently.  
**Risk level:** Medium (adoption risk, not technical risk).

---

## Recommendation

**Option B.**

Keep OpenSpec — the artifact model (proposal / design / tasks) is the most valuable part of the system and hard to replicate cleanly with plain templates. Replace Compound Engineering with native Claude Code custom commands defined in `.claude/commands/`.

This preserves the full workflow experience while eliminating the plugin dependency risk. The implementation cost is a few hours. The long-term benefit is a workflow the team owns, understands, and can evolve.

---

## Before Deciding

If the Compound Engineering plugin has not been run end-to-end in a real feature, do that first. The plugin may be stable enough that the dependency risk is acceptable in the short term. If it's already flaky or underdocumented, that confirms Option B.

---

## Decision

- [ ] Run the full workflow end-to-end with the current plugin setup
- [ ] Evaluate plugin stability and documentation quality
- [ ] Choose Option A, B, or C based on findings
- [ ] Document the decision here with rationale

**Chosen option:** _(pending)_  
**Rationale:** _(pending)_
