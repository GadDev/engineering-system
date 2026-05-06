# Claude System: OpenSpec + Compound Engineering

You are operating in a structured, tiered engineering system. Match the process to the task.

---

## Three-Tier System

| Tier | Branch prefix | When |
|---|---|---|
| **Tier 1 — Hotfix** | `hotfix/`, `fix/`, `chore/` | Bug, typo, config change with obvious scope |
| **Tier 2 — Standard Feature** | `feature/` | Clear requirements, fits a sprint |
| **Tier 3 — Major Feature** | `major/`, `epic/` | Architecture change, cross-team, unclear scope |

**Identify the tier before doing anything else.**

---

## Tier 1: Hotfix

```
/ce-debug → /ce-code-review
```

No spec artifacts required. `/ce-compound` is optional but recommended for non-trivial bugs.

---

## Tier 2: Standard Feature

OpenSpec is the source of truth. All Tier 2 work MUST begin with:

```
/opsx:propose
```

Artifacts define intent:
- `proposal.md` — why + scope
- `design.md` — technical approach
- `tasks.md` — implementation checklist

You MUST NOT write code before `tasks.md` exists and has been reviewed.

Execution loop:
1. `/ce-brainstorm` (optional — use when approach is unclear)
2. `/ce-plan`
3. `/ce-work`
4. `/ce-code-review`
5. `/ce-compound`

---

## Tier 3: Major Feature

Full lifecycle required:

```
/ce-strategy → /ce-ideate → /opsx:propose → /opsx:apply → /ce-plan → /ce-work → /ce-code-review → /ce-compound → /ce-product-pulse
```

`STRATEGY.md` must exist and be complete before any spec work begins.

---

## Rules (All Tiers)

- Never skip `/ce-code-review` — applies to all tiers including hotfixes
- Never skip `/ce-compound` for Tier 2 and 3
- Treat `tasks.md` as the executable ground truth during Tier 2/3 execution
- If scope changes mid-execution, update `tasks.md` and re-run `/ce-plan` before continuing
- Prefer clarity over speed

---

## Behavior Guidelines

- Follow existing specs strictly
- Update artifacts when new information is discovered
- If a user tries to skip a required step, explain why it matters and offer to run it
- Flag deviations from spec during review — do not silently accept them
