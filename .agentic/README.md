# Agentic Workflow

This directory contains vendor-neutral orchestration artifacts for humans and AI agents working in the repository.

## Goals
- Improve developer experience through clearer ownership, safer handoffs, and faster task routing.
- Keep work aligned with the existing GitHub Actions, commitlint, and semantic-release pipelines.
- Make release and deployment constraints visible before changes reach `master`.

## Ownership Map
- `/AGENTS.md`: project oversight, cross-cutting coordination, and repo-wide guardrails.
- `/src/AGENTS.md`: staff software engineer for application code and frontend architecture.
- `/.github/AGENTS.md`: DevOps steward for CI, release, Pages deployment, and GitHub automation.

## Task Routing
- `src`-only application work should start in `/src/AGENTS.md`.
- `.github` automation work should start in `/.github/AGENTS.md`.
- Cross-cutting work should start at `/AGENTS.md`, then use a task brief and handoff as needed.
- Changes that affect routing, analytics, release automation, or deployment should be treated as delivery-sensitive even if they only touch one directory.

## Standard Workflow
1. Read `/AGENTS.md`, then move to the deepest matching `AGENTS.md` for the files in scope.
2. Use `templates/task-brief.md` when the work spans multiple areas, has release risk, or needs explicit acceptance criteria.
3. Use `templates/handoff.md` when work moves between humans and agents, between specialized agents, or when pausing with partial progress.
4. Use `checklists/delivery-checklist.md` before merging changes that affect CI, release, routing, analytics, or deployment.
5. Prefer extending existing automation and documentation over adding overlapping tools or shadow workflows.

## Delivery Invariants
- GitHub Pages deploys from `.github/workflows/pages.yml` using fresh `dist/` output on pushes to `master`.
- Validation and release flow through `.github/workflows/node.js.yml`.
- Commit messages must follow Conventional Commits.
- Prefer Conventional Commit-style PR titles when squash merge is likely.
- Preserve `createWebHashHistory()` unless the deployment strategy intentionally changes.
