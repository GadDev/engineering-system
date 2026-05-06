# Contributing Guide

> Source of truth for PR approval, merge strategy, and branch lifecycle.
> Tier definitions and workflow rules live in [CLAUDE.md](./CLAUDE.md).

---

## Definition of Done

A work item is **done** when all of the following are true:

| # | Criterion | Tier |
|---|---|---|
| 1 | All tasks in `tasks.md` are checked off | Tier 2/3 |
| 2 | Existing tests pass — no regressions | All |
| 3 | New tests written for changed behavior | Tier 2/3 |
| 4 | `/opsx:verify` reports no CRITICAL issues | Tier 2/3 |
| 5 | `/ce-code-review` run and feedback addressed | All |
| 6 | `/security-review` run and findings resolved | Tier 3 |
| 7 | PR approved (see approval requirements below) | All |
| 8 | Branch merged and deleted | All |
| 9 | Change archived via `/opsx:archive` | Tier 2/3 |

---

## Creating a PR

Use `/ce-commit-push-pr` to commit, push, and open a PR with an adaptive description.

PR titles follow `<type>(<scope>): <summary>`:

| Type | When |
|---|---|
| `fix` | Tier 1 hotfix |
| `feat` | Tier 2 standard feature |
| `feat!` | Tier 3 major/breaking feature |
| `chore` | Config, tooling, dependencies |
| `refactor` | Code restructure with no behavior change |

---

## Approval Requirements

| Tier | Approvals required | Who can approve |
|---|---|---|
| Tier 1 — Hotfix | 1 | Any team member |
| Tier 2 — Standard | 1 | Any team member with context |
| Tier 3 — Major | 2 | At least one senior or tech lead |

- Self-approval is not permitted
- Stale approvals are dismissed on new push

---

## Merge Strategy

| Tier | Strategy | Reason |
|---|---|---|
| Tier 1 | Squash merge | Clean history, one atomic fix |
| Tier 2 | Squash merge | Feature as a single commit |
| Tier 3 | Merge commit | Preserve full history for audits |

Never force-push to `main`. If a branch is behind, rebase locally and re-push.

---

## Branch Lifecycle

1. Branch from `main` using the correct prefix — `hotfix/`, `fix/`, `chore/`, `feature/`, `major/`, `epic/`
2. Keep branches short-lived: merge within the sprint (Tier 2) or milestone (Tier 3)
3. Delete branch after merge (enable "Automatically delete head branches" in repository settings)
4. For Tier 2/3: run `/opsx:archive` after merge to close the OpenSpec change and move artifacts to `openspec/changes/archive/`

---

## Blocked PRs

Do not merge a PR if any of the following are true:

- CI is failing
- There are unresolved review comments
- `tasks.md` has unchecked items (Tier 2/3)
- `/opsx:verify` reported CRITICAL issues
- `/security-review` reported unresolved HIGH or CRITICAL findings (Tier 3)

---

## Scope Escalation

If a PR review reveals the scope has grown beyond its current tier, close the PR, re-tier, and restart per the escalation rule in [CLAUDE.md](./CLAUDE.md). Do not patch a Tier 1 PR into Tier 2 scope.
