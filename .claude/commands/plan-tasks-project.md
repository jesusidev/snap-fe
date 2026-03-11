# Plan Tasks

Break down a feature into atomic, trackable subtasks for the Snap project.

Feature request: $ARGUMENTS

## Phase 1: Planning

1. Analyze the feature request
2. Search the codebase for existing patterns and reference implementations
3. Break down into task groups:

| Group | Examples |
|-------|---------|
| **api** | tRPC routers, Zod schemas |
| **frontend** | Components, pages, CSS modules |
| **state** | Context providers, hooks, events |
| **docs** | Documentation updates |

4. Present the plan:

```
Feature: {feature name}
Objective: {one sentence}

Tasks:
  api-001: Create {domain} tRPC router [priority: high]
  frontend-001: Create {Component} compound component [priority: high]
  frontend-002: Create {Page} page [priority: high, depends: api-001, frontend-001]
  state-001: Add {domain} events [priority: medium]
  docs-001: Update frontend guide [priority: low]

Critical path: api-001 → frontend-001 → frontend-002
Exit criteria: {what "done" looks like}
```

5. Get user approval before creating files

## Phase 2: File Creation

Create task files:

```
docs/features/{feature}/
├── analysis.md            # Technical analysis
└── tasks/
    ├── README.md          # Task index with status tracking
    ├── api-001-{name}.md  # Individual task files
    ├── frontend-001-{name}.md
    └── ...
```

### Task File Template

```markdown
# {Task ID}: {Title}

**Priority:** high | medium | low
**Depends on:** {task IDs or "none"}
**Status:** ⬜ Not started

## Objective
{What this task accomplishes}

## Files
- `src/domains/{domain}/...` — Create/modify

## Implementation
{Step-by-step instructions with code examples}

## Acceptance Criteria
- [ ] {Specific, testable criterion}
- [ ] {Another criterion}
```

### Task README Template

```markdown
# {Feature} Tasks

| ID | Task | Priority | Depends On | Status |
|----|------|----------|------------|--------|
| api-001 | Create router | High | — | ⬜ |
| frontend-001 | Create component | High | — | ⬜ |

## Exit Criteria
- [ ] {Overall completion criteria}
```

## Rules
- Tasks should be atomic (2-4 hours of work)
- Include specific file paths
- Include code examples where helpful
- Map dependencies explicitly
- Each task must have testable acceptance criteria
