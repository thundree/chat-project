# TTInteractive Chat Project Management

This document provides instructions for managing the TTInteractive chat application project, including context detection, task management, and AI service integration.

## Project Overview

This is a modern chat application built with:
- **Frontend**: React 19.1.0 + TypeScript + Vite 6.3.5
- **Styling**: TailwindCSS 4.1.10 + Flowbite React components
- **AI Services**: OpenAI GPT & Google AI (Gemini) APIs via unified interface
- **Database**: Dexie (IndexedDB) for local data persistence
- **Deployment**: GitHub Pages with automated workflows

## Context Detection and Actions

First, I'll analyze the current state:
1. Check if this is a new conversation or continuing work
2. Examine git status for informational purposes only (NO git actions)
3. Review project documentation and recent commits for context
4. Check AI service integrations and database schema
5. Determine appropriate action based on chat application context

**IMPORTANT**: Never perform git operations like commit, reset, push, merge, or branch creation. Only use git for read-only operations like `git status` and `git log` for context.

## Execution Plan

### IF NEW CONVERSATION:
- Read project documentation (`/documentation/*.md`) and analyze structure
- Check `git status` and `git log --oneline -15` for informational context only
- Examine current chat features, AI service integrations, and component architecture
- Identify and propose the next logical task considering:
  - Chat functionality improvements (message editing, character selection)
  - AI service enhancements (model switching, API key management)
  - UI/UX improvements (responsive design, accessibility)
  - Database optimizations (message storage, chat persistence)
  - Testing and deployment pipeline improvements

### IF MID-TASK (uncommitted changes detected):
- **DO NOT** stage, commit, or modify git state
- Focus on code development and file editing only
- Update project documentation with:
  - Component interface changes and prop modifications
  - AI service API updates and model integrations
  - Database schema changes and migration notes
  - Active issues and blockers discovered
  - Important architectural decisions and patterns
- Keep working on React development without git operations

### IF TASK COMPLETE (clean working directory detected):
- Update project documentation to reflect completed work:
  - Preserve component interfaces and TypeScript definitions
  - Keep AI service configurations and API contracts
  - Remove implementation details and debugging notes
  - Consolidate learnings into concise insights
- **DO NOT** perform any git operations or archiving
- Run project health checks:
  - `npm run lint` for code quality
  - `npm run build` for TypeScript compilation
  - Test AI service connections and database operations
- Focus on preparing next development tasks

## Argument Handling

$ARGUMENTS

### Process any arguments:
- **"ultrathink"**: Engage extended analysis mode. Provide architectural overview of the application, AI service integration patterns, database design considerations, and strategic planning for scalability rather than tactical next steps.
- **"analyze"**: Perform comprehensive code analysis and suggest improvements without making changes.
- **"test"**: Run project health checks: `npm run lint`, `npm run build`, and test AI service connections.
- **"docs"**: Focus on updating and improving project documentation.

**REMOVED ARGUMENTS**: Git-related arguments (push, main, deploy) have been removed to prevent accidental git operations.

## Project-Specific Safety Checks
- **NEVER** perform git operations like commit, reset, push, merge, branch creation, or any state-changing git commands
- **ONLY** use read-only git commands for context: `git status`, `git log`, `git diff` (without applying changes)
- Preserve all meaningful work through file editing, not git operations
- Focus on code development, documentation updates, and project analysis
- Ensure TypeScript compilation passes with `npm run build`
- Validate AI service integrations don't break
- Test database operations for consistency
- Verify responsive design and accessibility standards
- Ensure documentation stays current with code changes

## Prohibited Git Commands
**DO NOT USE**: `git commit`, `git reset`, `git push`, `git pull`, `git merge`, `git rebase`, `git checkout`, `git branch`, `git add`, `git stash`, or any other state-changing git commands.

## Key Project Areas to Monitor
1. **Chat Components**: `src/components/Chat*.tsx`, `src/components/Message*.tsx`
2. **AI Services**: `src/services/*Service.ts`, `src/hooks/useAI.ts`
3. **Database Layer**: `src/services/databaseService.ts`, `src/utils/databaseUtils.ts`
4. **Type Definitions**: `src/types/index.ts`
5. **Context Management**: `src/contexts/ChatContext.tsx`
6. **Documentation**: `documentation/*.md`

## Output
Provide clear summary of:
1. Actions taken (code changes, documentation updates, analysis performed)
2. Current chat application state
3. AI service and database status
4. Recommended next development steps
5. Any warnings or considerations specific to React/TypeScript/AI integration
6. **NO git operation recommendations** - focus on development tasks only