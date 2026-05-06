# How to Run the AI-Assisted Engineering Lifecycle

This document explains how to interact with Claude effectively at each phase of the workflow. The [onboarding guide](onboarding.md) covers which commands to run — this covers how to get good results from them.

---

## What "AI-Assisted" Actually Means Here

Claude is not autocomplete. It reads your project context, the artifacts in your repo (`proposal.md`, `tasks.md`, `STRATEGY.md`), and the rules in `CLAUDE.md` before responding. The quality of its output depends directly on:

1. The quality of input you give it
2. The artifacts already in the repo
3. The specificity of your request

Bad input → vague output → wasted time. The sections below show what good input looks like at each phase.

---

## Opening Claude Code

```bash
claude
```

Run this from your project root. Claude reads `CLAUDE.md` on startup — this is what enforces the workflow. Always open Claude from the project root, not a subdirectory.

---

## Phase 1: Strategy (`/ce-strategy`)

**When to use:** Tier 3 features only. Skip this for anything with obvious scope.

**What to provide:**
Before running `/ce-strategy`, write a few sentences in the chat describing:
- The problem you're trying to solve
- Who is affected
- Any hard constraints (deadline, tech limits, team size)

```
We're building a notification system for our web app. 
Users currently miss important updates because there's no in-app alerting. 
Constraint: must work without a push notification service — we're on a shared hosting plan.

/ce-strategy
```

**What Claude produces:** A `STRATEGY.md` with direction, target users, metrics, and constraints.

**How to validate it:**
- Does the direction section match your intent in one paragraph?
- Are the metrics measurable, not aspirational?
- Are the constraints complete? Missing constraints will surface later as blockers.

**If output is wrong:** Don't re-run. Tell Claude what's incorrect and ask it to revise the specific section. Re-running from scratch is slower and loses context.

---

## Phase 2: Ideation (`/ce-ideate`)

**When to use:** Tier 3 only, after `/ce-strategy`.

**What to provide:** Nothing extra — Claude reads `STRATEGY.md`. But you can bias it:

```
/ce-ideate

Prefer solutions that don't require a backend infrastructure change.
```

**What Claude produces:** A ranked list of solution approaches with critique and a recommendation.

**How to validate it:**
- Is the recommended option actually viable for your constraints?
- Are the alternatives genuinely different, or is Claude presenting variations of the same approach?
- Do you disagree with the ranking? Say so — Claude will re-rank with your reasoning incorporated.

**A common mistake:** Accepting the first recommendation without reading the alternatives. The second or third option is sometimes better for your specific context and Claude doesn't know everything about your environment.

---

## Phase 3: Specification (`/opsx:propose`)

**When to use:** Tier 2 and Tier 3, after ideation (Tier 3) or directly from a feature idea (Tier 2).

**What to provide:** A feature name and a clear one-sentence description:

```
/opsx:propose notification-center

Build an in-app notification center that aggregates system alerts 
and user-triggered events into a single dismissible panel.
```

The more specific the description, the tighter the generated spec. A vague description produces a vague `proposal.md` that wastes time to correct.

**What Claude produces:** `proposal.md`, `design.md`, `tasks.md`.

**This is the most important validation step in the workflow.** Read all three artifacts before continuing. Check:

- `proposal.md` — Are the success criteria measurable? Is anything in scope that shouldn't be?
- `design.md` — Is the technical approach realistic? Does it fit your stack?
- `tasks.md` — Are the tasks granular enough to be actionable? Are dependencies sequenced correctly?

**How to correct artifacts:**
Don't edit the files manually and re-run. Tell Claude what's wrong:

```
The design.md proposes using WebSockets but we don't have a persistent 
server connection. Revise the approach to use polling instead.
```

Claude will update the artifact and maintain consistency across all three files.

---

## Phase 4: Planning (`/ce-plan`)

**When to use:** After spec artifacts are validated.

**What to provide:** Nothing — Claude reads `tasks.md`. But flag any external constraints:

```
/ce-plan

Note: the database migration in task 3 must happen in a separate 
deployment from the feature code — we can't do them atomically.
```

**What Claude produces:** An ordered execution plan with dependencies resolved.

**How to validate it:**
- Does the sequencing match your deployment constraints?
- Are there tasks that could run in parallel that Claude has sequenced linearly?
- Is the plan realistic for the time you have?

---

## Phase 5: Execution (`/ce-work`)

**When to use:** After plan is validated.

**How to interact during execution:**

Claude works task by task and will ask questions or flag ambiguities. Treat this as pair programming, not code generation. Stay present.

When Claude completes a task, it marks it in `tasks.md` and states what it did. Review the change before moving on:

```
That looks right. One thing — the `dismissAll` method should also 
clear the unread count in the header badge, not just the list. 
Update that before moving to the next task.
```

**When Claude gets stuck:** It will tell you. Give it the missing context rather than telling it to "just figure it out." The more context, the better the output.

**When Claude goes off-spec:** If you notice it implementing something not in `tasks.md`, stop it:

```
That's not in the spec. If you think it's needed, add it to tasks.md 
as a new task and I'll decide whether to include it.
```

This keeps scope controlled and keeps `tasks.md` as the ground truth.

---

## Phase 6: Review (`/ce-code-review`)

**When to use:** After `/ce-work` completes, before merging.

**What to provide:** Nothing — Claude reviews the diff against the spec. But you can focus it:

```
/ce-code-review

Pay extra attention to error handling in the notification fetch logic 
and any edge cases around empty states.
```

**What Claude produces:** A structured review flagging deviations from spec, quality issues, and missing cases.

**How to use the review:** Treat Claude's findings as a starting point, not a verdict. Some findings will be genuine issues; some will be false positives based on incomplete context. For each finding, either fix it or explicitly dismiss it with a reason:

```
Finding 3 is intentional — we're not handling the offline case in this 
iteration, it's deferred to tasks.md line 18. Mark it as acknowledged.
```

---

## Phase 7: Learnings (`/ce-compound`)

**When to use:** After review passes, before closing the feature.

**What to provide:** A short reflection to seed the learning capture:

```
/ce-compound

The polling approach worked but introduced more complexity than expected 
in the reconnection logic. We also discovered that our test suite 
doesn't cover async state updates well.
```

**What Claude produces:** A structured learning summary — patterns to reuse, mistakes to avoid, gaps to address.

**Why this matters:** This output feeds future sessions. If you skip it, Claude starts the next feature with no memory of what worked or what didn't. Two minutes of input here compounds across every future feature.

---

## Phase 8: Product Pulse (`/ce-product-pulse`)

**When to use:** Tier 3 features only, after the feature has been live for at least a week.

**What to provide:** Real-world observations — user feedback, support tickets, analytics, anything concrete:

```
We shipped the notification center 10 days ago. 
- Support tickets about missed alerts dropped 40%
- Users are not discovering the dismiss-all button (only 12% usage)
- Three requests for email digest in addition to in-app

/ce-product-pulse
```

**What Claude produces:** A pulse report saved in `docs/pulse-reports/` that feeds back into the next strategy cycle.

---

## General Tips

**Give Claude the constraint before the command, not after.**  
If you know a constraint (tech, time, team), state it before running the command. Constraints discovered after output is generated require a full revision.

**Correct specifically, not generally.**  
"This is wrong, redo it" produces another miss. "The success criteria in section 2 are outputs not outcomes — rewrite them as measurable user outcomes" produces a targeted fix.

**Don't fight the workflow.**  
If you're tempted to skip from `/opsx:propose` straight to `/ce-work`, the spec probably isn't ready. The workflow steps exist because each one validates the previous one. The time cost of skipping is always higher than the time cost of following the step.

**Claude forgets between sessions.**  
Start each new Claude session with a brief context reset if you're mid-feature:

```
We're continuing work on the notification-center feature. 
Current status: proposal.md and design.md are approved, 
tasks.md has tasks 1-3 completed. Resume from task 4.
```
