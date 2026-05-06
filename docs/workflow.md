# Workflow Reference

For a full explanation of each step, see [onboarding.md](onboarding.md).

---

## Choose Your Tier

| Tier | When | Time horizon |
|---|---|---|
| **1 — Hotfix** | Bug, typo, config change | < 2 hours |
| **2 — Standard Feature** | Clear scope, fits a sprint | < 1 week |
| **3 — Major Feature** | Architecture change, cross-team, unclear scope | > 1 week |

---

## Tier 1: Hotfix

```
/ce-debug "issue description"
/ce-code-review
```

---

## Tier 2: Standard Feature

```
/opsx:propose feature-name
/ce-brainstorm           ← optional, use when approach is unclear
/ce-plan
/ce-work
/ce-code-review
/ce-compound
```

---

## Tier 3: Major Feature

```
/ce-strategy
/ce-ideate
/opsx:propose
/opsx:apply
/ce-plan
/ce-work
/ce-code-review
/ce-compound
/ce-product-pulse
```

---

## Bug Fix (any tier)

```
/ce-debug "issue description"
/ce-code-review
/ce-compound
```

Always run `/ce-compound` after a non-trivial bug fix — bugs often reveal systemic patterns worth capturing.
