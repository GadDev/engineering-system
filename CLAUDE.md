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

OpenSpec stores these at: `openspec/changes/<change-name>/`

You MUST NOT write code before `tasks.md` exists and has been reviewed.

Execution loop:
1. `/ce-brainstorm` (optional — use when approach is unclear)
2. `/ce-plan` — reads `openspec/changes/<name>/tasks.md` for sequencing
3. `/ce-work` — reads and marks tasks in `openspec/changes/<name>/tasks.md`
4. `/ce-code-review`
5. `/opsx:verify`
6. `/ce-compound`
7. `/ce-commit-push-pr` → merge → `/opsx:archive`

---

## Tier 3: Major Feature

Full lifecycle required:

```
/ce-strategy → /ce-ideate → /opsx:propose → /ce-plan → /ce-work → /ce-code-review → /security-review¹ → /opsx:verify → /ce-compound → /ce-commit-push-pr → merge → /opsx:archive → /ce-product-pulse

¹ `/security-review` is a Claude Code native skill, not from CE or OpenSpec. For Tier 3, run it as a dedicated second pass after `/ce-code-review`.
```

`STRATEGY.md` must exist and be complete before any spec work begins.

---

## Framework Boundaries

Two frameworks collaborate. Each owns a distinct layer — do not cross the boundary.

| Layer | Owner | Commands | Produces |
|---|---|---|---|
| **Spec artifacts** | OpenSpec | `/opsx:propose`, `/opsx:verify`, `/opsx:archive`, `/opsx:sync`, `/opsx:explore` | `proposal.md`, `design.md`, `tasks.md`, archived change |
| **Strategy & ideation** | CE | `/ce-strategy`, `/ce-ideate`, `/ce-brainstorm` | `STRATEGY.md`, ranked options |
| **Execution planning** | CE | `/ce-plan` | In-session execution plan (reads OpenSpec's `tasks.md`) |
| **Implementation** | CE | `/ce-work` | Code changes; marks tasks `[x]` in OpenSpec's `tasks.md` |
| **Code review** | CE | `/ce-code-review` | Review findings (includes embedded security agents) |
| **Spec compliance** | OpenSpec | `/opsx:verify` | CRITICAL / WARNING / SUGGESTION report |
| **Security gate** | Claude Code native | `/security-review` | Dedicated security pass (Tier 3 only) |
| **Knowledge capture** | CE | `/ce-compound` | Team learnings repository |
| **PR & commit** | CE | `/ce-commit-push-pr` | Git commit, push, opened PR |
| **Feedback loop** | CE | `/ce-product-pulse` | `docs/pulse-reports/` |

**Artifact path contract:** OpenSpec writes to `openspec/changes/<change-name>/`. CE commands (`/ce-plan`, `/ce-work`) MUST read from this path. Never duplicate or shadow OpenSpec artifacts.

---

## Rules (All Tiers)

- Never skip `/ce-code-review` — applies to all tiers including hotfixes
- Never skip `/ce-compound` for Tier 2 and 3
- Treat `tasks.md` as the executable ground truth during Tier 2/3 execution
- If scope changes mid-execution, update `tasks.md` and re-run `/ce-plan` before continuing
- **Testing** — Tier 1: confirm no regressions (existing tests must pass); Tier 2+: write tests covering changed behavior before merging
- **Escalation** — if mid-execution scope exceeds the current tier, stop immediately, re-tier, and restart with the correct process; never continue under the wrong tier
- **Definition of done** — merge criteria, PR approval, and branch lifecycle are defined in `CONTRIBUTING.md`; consult it before closing any work
- Prefer clarity over speed

---

## Behavior Guidelines

- Follow existing specs strictly
- Update artifacts when new information is discovered
- If a user tries to skip a required step, explain why it matters and offer to run it
- Flag deviations from spec during review — do not silently accept them
