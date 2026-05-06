# End-to-End Workflow Walkthrough

**Purpose:** Verify the full AI-assisted lifecycle works with the current plugin setup. This document is both a tutorial and a test instrument — run it once, record what breaks, and use the findings to close the open decision in [toolchain-review.md](toolchain-review.md).

**Scenario:** `notification-preferences` — add per-user control over which in-app notifications a user receives.

---

## Pre-Flight Checklist

Before starting, confirm:

```bash
# OpenSpec installed
openspec --version

# Claude Code installed
claude --version

# In project root, clean state
git status   # should show clean working tree
git checkout -b feature/notification-preferences
```

In Claude Code (run once per project):
```
/plugin marketplace add EveryInc/compound-engineering-plugin
/plugin install compound-engineering
/ce-setup
```

---

## Section 1: Tier 2 — Standard Feature

Full walkthrough of the most common workflow path.

---

### Step 0 — Tier Decision

**Decision:** Scope is clear (add a preferences page), fits a sprint, no architecture change → **Tier 2**.

If you're unsure, go one tier up. The overhead of Tier 3 is one hour. The cost of under-speccing a Tier 3 feature is weeks of rework.

---

### Step 1 — Propose (`/opsx:propose`)

Provide context **before** running the command. The more specific the description, the tighter the generated spec.

```
We're adding a notification preferences page. Users can toggle each notification 
type (new comment, @mention, digest) on or off. Settings are per-user and 
persist across sessions. Backend stores preferences in user profile table.

/opsx:propose notification-preferences
```

**What OpenSpec creates:**
```
openspec/changes/notification-preferences/
├── proposal.md
├── design.md
├── tasks.md
└── .openspec.yaml
```

**Validation checkpoints — read all three before continuing:**

| Artifact | What to check | Red flag |
|---|---|---|
| `proposal.md` | Success criteria exist and are measurable | "Users are happier" — not measurable |
| `proposal.md` | Out of Scope section has at least one entry | Empty out-of-scope is an open invitation for scope creep |
| `design.md` | Tech approach matches your actual stack | Proposes a framework you don't use |
| `design.md` | Architecture Decisions table is filled | Empty table = unresolved decisions baked into code |
| `tasks.md` | Tasks are actionable (not "implement feature") | Vague tasks produce vague code |
| `tasks.md` | Tasks section has at least Setup + Core Implementation + Tests | Missing tests section = no test plan |

**How to correct without re-running:**
```
The design.md proposes WebSockets but we use polling. 
Revise the approach to use a 30s polling interval instead.
```

Claude updates the artifact and maintains consistency across all three files. Do not edit manually.

---

### Step 2 — Plan (`/ce-plan`)

CE reads from OpenSpec's `tasks.md` and produces an ordered execution plan.

```
/ce-plan

Note: read from openspec/changes/notification-preferences/tasks.md
```

**Validation checkpoints:**

- Plan respects the task ordering from `tasks.md`
- Dependencies are correctly sequenced (e.g. schema migration before feature code)
- No tasks appear that are not in `tasks.md` — if CE adds something, flag it

**Efficiency test:** Did CE find `tasks.md` at the OpenSpec path without being told the full path?

---

### Step 3 — Implement (`/ce-work`)

CE implements task by task. It reads from `openspec/changes/notification-preferences/tasks.md` and marks each completed task `[x]`.

```
/ce-work
```

Stay present — this is pair programming, not fire-and-forget.

**During execution:**

| Situation | How to respond |
|---|---|
| CE asks a clarifying question | Answer specifically; vague answers produce vague code |
| CE implements something not in `tasks.md` | "That's not in the spec. Add it to tasks.md first if needed." |
| CE marks a task `[x]` before you've reviewed | Review the change before typing anything |
| CE gets stuck | Give it the missing context, don't say "just figure it out" |

**Validation checkpoints after `/ce-work` completes:**

- All tasks in `openspec/changes/notification-preferences/tasks.md` are checked `[x]`
- No new files created outside the scope described in `design.md`
- Tests section has actual test files written, not just the checkbox ticked

**Efficiency test:** Count how many times CE went off-spec. Zero is ideal. More than two is a signal the spec was too vague.

---

### Step 4 — Code Review (`/ce-code-review`)

CE reviews the full changeset against `proposal.md` and `tasks.md`. Uses specialized persona agents internally (security, performance, architecture).

```
/ce-code-review

Pay attention to the user preferences persistence logic and 
any edge cases around default values when a user has no saved preferences.
```

**Validation checkpoints:**

- Findings are specific and actionable — not "consider improving error handling"
- Findings reference the spec when flagging deviations
- Each finding is either fixed or explicitly dismissed with a reason:

```
Finding 3 is intentional — we're defaulting all notifications to ON for 
existing users. This is documented in proposal.md Success Criteria item 2. 
Mark as acknowledged.
```

**Efficiency test:** Did `/ce-code-review` find real issues, or only surface theoretical concerns? Real = you fixed it. Theoretical = you dismissed it with a reason.

---

### Step 5 — Spec Compliance Verify (`/opsx:verify`)

OpenSpec validates the implementation against all three spec artifacts. This catches spec-vs-code divergence that code review misses.

```
/opsx:verify notification-preferences
```

**Severity levels:**
- `CRITICAL` — must fix before continuing
- `WARNING` — address or document in `tasks.md` Notes section
- `SUGGESTION` — optional improvement

**Validation checkpoint:** No CRITICAL issues. For each WARNING, either fix it or add a note in `tasks.md`:

```
## Notes
Warning from /opsx:verify: email digest toggle not implemented.
Deferred — email notifications are out of scope per proposal.md line 24.
```

**Efficiency test:** Did `/opsx:verify` surface anything `/ce-code-review` missed? If yes, note what category of issue (completeness, correctness, or coherence).

---

### Step 6 — Capture Learnings (`/ce-compound`)

Seed the learning capture with a short reflection before running the command.

```
The polling approach for preference sync worked but we discovered the 
default-values edge case late — that should have been in design.md.
Test coverage for the toggle state machine is incomplete.

/ce-compound
```

**Validation checkpoint:** Output contains all three categories:
- Patterns to reuse
- Pitfalls to avoid
- Gaps to close

**Efficiency test:** Two minutes of input. If it took more, the reflection prompt was too vague.

---

### Step 7 — PR, Merge, Archive

```
/ce-commit-push-pr
```

CE commits staged changes, pushes the branch, and opens a PR using the pull request template.

**Before merging — PR checklist must be complete:**
- [ ] Tier 2 selected
- [ ] All four spec artifact checkboxes checked
- [ ] `/ce-code-review` run and findings addressed
- [ ] `/ce-compound` run

**After merge:**
```
/opsx:archive notification-preferences
```

OpenSpec moves the change to `openspec/changes/archive/YYYY-MM-DD-notification-preferences/` — all artifacts preserved for audit trail.

**Validation checkpoint:** `openspec/changes/notification-preferences/` is gone. Archive directory exists. CI passed.

---

### Tier 2 Efficiency Rubric

Fill this in after running the walkthrough:

| Criterion | Score (1–5) | Notes |
|---|---|---|
| Spec quality — artifacts accurate on first generation | | |
| Path contract — CE found `openspec/changes/` without explicit help | | |
| Off-spec drift — number of times CE implemented outside tasks.md | | |
| Review utility — /ce-code-review found real, actionable issues | | |
| Verify coverage — /opsx:verify caught something /ce-code-review missed | | |
| Time to PR (minutes from /opsx:propose to /ce-commit-push-pr) | | |
| Plugin stability — any commands that failed or produced empty output | | |

Record aggregate findings in [toolchain-review.md](toolchain-review.md) under the Decision section.

---

## Section 2: Tier 3 Delta — What Changes

Tier 3 is Tier 2 with three additions: **strategy**, **ideation**, and **security review**. Everything else is identical. This section shows only the differences.

---

### Before `/opsx:propose`: Strategy + Ideation

**Branch prefix:** `major/notification-center` or `epic/notification-center`

#### Step 0a — Strategy (`/ce-strategy`)

```
We're building a notification system for the web app.
Users miss important updates because there is no in-app alerting.
Constraint: must work without a push notification service — we're on shared hosting.
Timeline: 6 weeks. Team of 3.

/ce-strategy
```

**Produces:** `STRATEGY.md` at the project root.

**Validation:** CI blocks `major/*` PRs if `STRATEGY.md` is missing or has empty sections. Check it passes the enforce-strategy workflow before continuing.

| Section | What to verify |
|---|---|
| Direction | One paragraph max — if it's longer, the direction isn't clear |
| Metrics | Measurable outcomes, not outputs ("40% drop in missed alerts" not "add notifications") |
| Constraints | All hard limits listed — hidden constraints are the most expensive kind |

#### Step 0b — Ideation (`/ce-ideate`)

```
/ce-ideate

Prefer solutions that don't require persistent server connections.
```

**Produces:** Ranked list of approaches with critique and a recommendation.

**Validation:**
- Read the alternatives before accepting the recommendation
- Is the recommended approach realistic for your constraints?
- Does it conflict with anything in `STRATEGY.md`?

Feed the chosen approach into `/opsx:propose`:
```
/opsx:propose notification-center

Use the polling approach recommended in ideation. 
30s interval, preferences stored in user profile table, 
no push notification service dependency.
```

---

### After `/ce-code-review`: Security Review

This step is Tier 3 only. `/security-review` is a **Claude Code native skill** — it is not from CE or OpenSpec. It runs a dedicated security pass on the current branch diff.

```
/security-review
```

**Why two review steps for Tier 3:**
- `/ce-code-review` (CE) — broad quality review using persona agents including embedded security reviewers
- `/security-review` (Claude Code native) — dedicated security-only second pass, independent of CE's agents

**Validation:**
- Address any HIGH or CRITICAL findings before `/opsx:verify`
- MEDIUM findings: fix or document in `tasks.md` Notes with a mitigation rationale

---

### After `/opsx:archive`: Product Pulse

Run this **after the feature has been live for at least a week** — not immediately after merge.

```
We shipped the notification center 10 days ago.
- Support tickets about missed alerts dropped 40%
- Users are not finding the dismiss-all button (only 12% usage)
- Three requests for email digest in addition to in-app

/ce-product-pulse
```

**Produces:** `docs/pulse-reports/YYYY-MM-DD-notification-center.md`

This report feeds back into the next `/ce-strategy` cycle, closing the loop.

---

### Tier 3 Efficiency Rubric (additions to Tier 2)

| Criterion | Score (1–5) | Notes |
|---|---|---|
| Strategy quality — STRATEGY.md captured real constraints | | |
| Ideation value — did alternatives improve the final approach? | | |
| Security delta — did /security-review find anything /ce-code-review missed? | | |
| Pulse accuracy — did post-ship data match the success criteria in proposal.md? | | |

---

## After Running This Walkthrough

1. Fill in both efficiency rubrics above
2. Update `toolchain-review.md` → Decision section with your findings
3. Choose Option A, B, or C from `toolchain-review.md` based on plugin stability observed
4. Commit the filled rubrics and decision as `chore/toolchain-decision`
