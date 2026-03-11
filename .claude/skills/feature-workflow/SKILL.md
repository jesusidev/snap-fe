---
name: feature-workflow
description: Complete feature development workflow with planning, implementation, review, and documentation
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# Feature Workflow

Complete development lifecycle for new features in the Snap project.

## Phases

### Phase 1: Plan
1. Create technical analysis at `docs/features/{feature}/analysis.md`
2. Include reference implementation examples from existing code
3. List all files to create/modify with estimated line counts
4. Define acceptance criteria

### Phase 2: Implement
1. Create/modify files following project patterns
2. Use service hooks for data fetching (never direct tRPC)
3. Use `useNotificationDispatcher` for user messages
4. Use `NavLink` for internal navigation
5. CSS: mobile-first, Mantine variables, `light-dark()`
6. Add prefetch methods to service hooks for new queries

### Phase 3: Review
Delegate to `code-reviewer` agent to validate:
- All critical rules followed
- Architecture patterns correct
- No hardcoded values in styles
- Hydration safety for client-only values

Then delegate to `accessibility-auditor` agent to validate:
- WCAG 2.1 AA compliance on new/modified components
- Semantic HTML, ARIA attributes, keyboard navigation
- Focus management in modals and dynamic content
- Color contrast and motion preferences

### Phase 4: Documentation
Delegate to `docs-updater` agent to update:
- `docs/guidelines.md` if new rules established
- `docs/frontend-guide.md` if new patterns added
- `README.md` if user-facing feature added
- Relevant feature-specific docs

### Phase 5: Complete
- Verify build passes (`npm run build`)
- Verify type check passes (`npm run check`)
- Summary of changes

## Key Patterns

| Pattern | Implementation |
|---------|---------------|
| Data fetching | Service hook in `~/domains/<domain>/hooks/` |
| Notifications | `useNotificationDispatcher` from `~/events` |
| Navigation | `NavLink` from `~/shared/components/NavigationLoader` |
| Prefetching | `usePrefetch*` methods on `onMouseEnter` |
| Events | `useEvent('domain:action')` from `~/events` |
| Deferred actions | `useStorePendingAction` / `usePendingAction` from `~/shared/hooks` |
| View transitions | `useViewTransition` from `~/state` |
| Forms | `useFormInitialization` from `~/shared/hooks` |
