# Feature Workflow

Complete development workflow for the Snap project. Guides implementation from planning through review and documentation.

Feature request: $ARGUMENTS

## Phases

### Phase 0: Git Branch
- Check current branch with `git branch --show-current`
- If on `main`, create a feature branch: `git checkout -b feat/{feature-name}`
- If already on a feature branch, continue

### Phase 1: Analysis
1. Search the codebase for similar patterns and reference implementations
2. Create `docs/features/{feature}/analysis.md` with:
   - Feature scope and objective
   - Reference implementation examples (actual code from this codebase)
   - List of files to create/modify with estimated line counts
   - Acceptance criteria
3. Present the plan and get user approval before proceeding

### Phase 2: Implementation
Implement the feature following project patterns:

**Critical rules:**
- Service hooks for data fetching (never direct tRPC)
- `useNotificationDispatcher` for messages (never Mantine directly)
- `NavLink` for internal navigation (never next/link directly)
- CSS: mobile-first `min-width`, Mantine variables, `light-dark()`
- Theme callback for inline styles
- Prefetch methods on hover for navigable elements
- Hydration-safe client-only values

**Use skills automatically:**
- `trpc-router` — when creating API endpoints
- `domain-component` — when creating React components
- `service-hook` — when creating data fetching hooks
- `notification` — when showing user messages
- `view-transition` — when adding page transitions

### Phase 3: Review
Delegate to the `code-reviewer` agent:
- Validate all critical rules
- Check architecture patterns
- Verify CSS conventions
- Check for hydration safety

Then delegate to the `accessibility-auditor` agent:
- Audit new/modified components for WCAG 2.1 AA compliance
- Check semantic HTML, ARIA attributes, keyboard navigation
- Verify focus management in modals and dynamic content
- Check color contrast and motion preferences

Fix any issues found before proceeding.

### Phase 4: Build Validation
Run and verify:
```bash
npm run check      # TypeScript + lint + format
npm run build      # Production build
```
Fix any failures.

### Phase 5: Documentation
Delegate to the `docs-updater` agent:
- Update `docs/guidelines.md` if new rules established
- Update `docs/frontend-guide.md` if new patterns introduced
- Update `README.md` if user-facing feature added
- Update relevant feature-specific docs

### Phase 6: Summary
- List all files created/modified
- Summarize the feature and how it works
- Note any follow-up items

## Error Handling
If any phase fails, STOP and present the error with recovery options. Do not proceed to the next phase until the current one passes.
