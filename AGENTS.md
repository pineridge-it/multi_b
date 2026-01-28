# AGENTS.md — Agent Coordination & Rules

## RULE 1 – ABSOLUTE (DO NOT EVER VIOLATE THIS)

You may **NOT delete any file or directory** unless I explicitly give the exact command **in this session**.

- This includes files you just created (tests, tmp files, scripts, etc.)
- You do not get to decide that something is "safe" to remove
- If you think something should be removed, **stop and ask**. You must receive clear written approval **before** any deletion command is even proposed

Treat "never delete files without permission" as a hard invariant.

---

## IRREVERSIBLE GIT & FILESYSTEM ACTIONS

Absolutely forbidden unless I give the **exact command and explicit approval** in the same message:

- `git reset --hard`
- `git clean -fd`
- `rm -rf`
- Any command that can delete or overwrite code/data

**Rules:**

1. If you are not 100% sure what a command will delete, **do not propose or run it**. Ask first.
2. Prefer safe tools: `git status`, `git diff`, `git stash`, copying to backups, etc.
3. After approval, restate the command verbatim, list what it will affect, and wait for confirmation.

---

## Project Stack

**Languages & Runtimes:**

- Bun (JavaScript/TypeScript)
- Python (via uv)
- Rust (if needed)

**Key Tools:**

- Beads (`bd`) - Task tracking
- UBS (`ubs`) - Bug scanning before commits
- Agent Mail (`am_*`) - Multi-agent coordination
- CASS (`cass`) - Session search
- CASS Memory (`cm`) - Procedural memory

**Coding Agents:**

- Abacus CLI with models: Sonnet, GPT, Gemini
- Aliases: `cc`, `cod`, `gmi`

---

## Agent Coordination Workflow

### 1. Session Start

Every agent MUST do this on first message:

```bash
# Register with Agent Mail
source ~/.acfs/scripts/agent-mail-helpers.sh
am_register "YourAgentName" "abacusai" "sonnet"  # Pick a memorable name

# Check who else is active
am_agents

# Check inbox for messages
am_inbox "YourAgentName"

```

### 2. Getting Context

Before starting work:

```bash
# Get CASS Memory context
~/cm-context-prompt.sh "your task description"

# Check task priorities
bv --robot-triage | jq '.recommendations[0:3]'

# Check ready tasks
bd ready --json

```

### 3. Claiming Work

```bash
# Pick a task (use BV recommendations)
TASK_ID="bd-X"  # From bv --robot-triage

# Claim it
bd update $TASK_ID --status in_progress

# Reserve files you'll edit (REQUIRED for multi-agent)
am_reserve "YourAgentName" "src/**,tests/**" 3600 true

# Announce to other agents
am_send "YourAgentName" "All" "Working on $TASK_ID" "I'm starting work on: [description]"

```

### 4. During Work

**Check messages periodically:**

```bash
am_inbox "YourAgentName"

```

**If another agent reserved files you need:**

- Send them a message asking about status
- Work on something else meanwhile
- Don't force-edit reserved files

**Update bead status if you discover new work:**

```bash
bd create "New subtask discovered" --deps discovered-from:$TASK_ID

```

### 5. Before Committing

**ALWAYS run UBS:**

```bash
# Stage your changes
git add <files>

# Run UBS on staged files
ubs $(git diff --cached --name-only)

# Fix any issues UBS reports
# Then commit
git commit -m "descriptive message"

```

**UBS will run automatically via pre-commit hook.**

### 6. Completing Work

```bash
# Release file reservations
am_release "YourAgentName" "src/**,tests/**"

# Close the bead with details
bd close $TASK_ID --reason "Completed: [what you did]"

# Notify other agents
am_send "YourAgentName" "All" "Completed $TASK_ID" "Task complete. Changed files: [list]"

# Commit final state
git add .
git commit -m "Complete: [description]"

```

## Code Quality Standards

### Before ANY Commit

1. **Run UBS** on changed files
2. **Fix all UBS issues** (don't skip unless false positive)
3. **Review the diff**: `git diff --cached`
4. **Write descriptive commit message**

### TypeScript/JavaScript

- Use TypeScript strict mode
- No `any` types without justification
- Prefer functional patterns over classes
- Use async/await over raw Promises
- Export types for public APIs

### Python

- Use type hints (PEP 484)
- Follow PEP 8 style
- Use `uv` for dependency management
- No bare `except:` clauses

### Testing

- Write tests for new features
- Run existing tests before committing
- Don't break existing tests
- Use meaningful test names

---

## Communication Patterns

### When to Send Messages

**ALWAYS send when:**

- Starting work on a task
- Completing a task
- Discovering a blocker
- Finding a bug that affects others
- Changing shared interfaces/APIs

**Optional but helpful:**

- Found a useful pattern others should know
- Need input on architecture decisions
- Finished a complex refactor

### Message Format

Use clear subjects and structured bodies:

```bash
am_send "YourName" "OtherAgent,ThirdAgent" \
  "Subject: Clear summary" \
  "Body with details:
  - What: ...
  - Why: ...
  - Impact: ...
  - Next steps: ..."

```

## File Reservation Rules

### When to Reserve

**REQUIRED:**

- Editing any file another agent might touch
- Refactoring shared modules
- Changing interfaces/types

**NOT REQUIRED:**

- Creating new files in your own feature branch
- Editing documentation
- Read-only operations

### Reservation Patterns

```bash
# Specific files
am_reserve "Name" "src/api/auth.ts,src/types/user.ts" 3600 true

# Directory patterns
am_reserve "Name" "src/components/**" 3600 true

# Multiple areas
am_reserve "Name" "src/api/**,tests/api/**" 3600 true

# Shorter duration for quick edits
am_reserve "Name" "src/utils/helpers.ts" 600 true

```

### Handling Conflicts

If you get `FILE_RESERVATION_CONFLICT`:

1. Check who has the reservation: `am_agents`
2. Message them: `am_send "You" "Them" "Need access" "I need to edit X for Y"`
3. Wait for their response or lease expiry
4. Use non-exclusive reservation if just reading: `am_reserve "You" "path" 3600 false`

---

## Using Beads Effectively

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

### Task Types

- `bug` - Something broken (priority 0-1)
- `feature` - New functionality (priority 1-2)
- `task` - General work item (priority 2-3)
- `chore` - Maintenance (priority 3-4)

### Dependency Structure

```bash
# Create parent task
bd create "Implement authentication" -p 1 -t feature

# Create dependent subtasks
bd create "Set up Supabase client" -t task --deps discovered-from:bd-1
bd create "Create auth context" -t task --deps discovered-from:bd-1
bd create "Add login UI" -t feature --deps discovered-from:bd-2,bd-3

```

### Using BV for Planning

```bash
# Get recommendations
bv --robot-triage

# Check dependency graph
bv --robot-insights

# See parallel work tracks
bv --robot-plan

# Visual TUI
bv

```

## Using CASS Memory

### Before Starting Complex Work

```bash
# Get relevant context
~/cm-context-prompt.sh "implement OAuth flow"

# This gives you:
# - Relevant rules from past work
# - Anti-patterns to avoid
# - Links to similar past solutions

```

### Adding Learnings

When you discover something useful:

```bash
cm playbook add "Always validate OAuth state parameter to prevent CSRF" \
  --category "security" --tags "oauth,authentication"

```

### Searching Past Sessions

```bash
# Find how you solved similar problems
cass search "authentication setup" --limit 5

# View specific session
cass view <path> -n <line>

# Get context around a solution
cass expand <path> -n <line> --context 10

```

## CASS Memory System (Session Retention)

**CASS** (Coding Agent Session Search) provides persistent memory across agent sessions. This allows future agents to learn from past work.

### Current Status

- **CASS Tool**: Installed and functional (v0.1.36)
- **Database**: `/home/ubuntu/.local/share/coding-agent-search/agent_search.db`
- **Abacus AI Support**: Not natively supported - requires manual export

### Retaining Abacus AI Sessions

Since CASS doesn't have a native Abacus AI connector, sessions must be manually exported to codex format:

### 1. Create Session File

Create a JSONL file in codex format at:

```
~/.codex/sessions/YYYY/MM/DD/rollout-<session-name>.jsonl

```

### 2. Session Format

Each line is a JSON envelope with this structure:

```
{"timestamp":"2026-01-27T05:00:00.000Z","type":"session_meta","payload":{"id":"session-id","cwd":"/path/to/project","cli_version":"abacus-ai-desktop"}}
{"timestamp":"2026-01-27T05:01:00.000Z","type":"response_item","payload":{"type":"message","role":"user","content":[{"type":"input_text","text":"user message here"}]}}
{"timestamp":"2026-01-27T05:02:00.000Z","type":"response_item","payload":{"type":"message","role":"assistant","content":[{"type":"text","text":"assistant response here"}]}}

```

**Required fields:**

- `timestamp`: ISO 8601 format
- `type`: `session_meta` (first line) or `response_item` (messages)
- `payload.role`: `user` or `assistant`
- `payload.content`: Array with text content

### 3. Index the Session

After creating the file:

```bash
cass index

```

### 4. Verify Indexing

```bash
cass status          # Check conversation count
cass search "query"  # Test search functionality

```

### Best Practices

1. **Export at session end** - Create the JSONL file before ending the session
2. **Use descriptive names** - `rollout-<project>-<feature>.jsonl`
3. **Include key context** - Major decisions, solutions, blockers
4. **Summarize work done** - List completed tasks and outcomes
5. **Run index immediately** - Don't forget `cass index` after creating the file

### Searching Past Sessions

```bash
# Search for specific topics
cass search "stripe billing"
cass search "agent mail MCP"

# View full session
cass view <path> <line>

# Check what's indexed
cass stats

```

### Example Export Script

```bash
#!/bin/bash
# export_session.sh - Helper to create CASS-compatible session files

SESSION_NAME="$1"
PROJECT_PATH="$2"
DATE=$(date +%Y/%m/%d)
SESSION_DIR="$HOME/.codex/sessions/$DATE"
SESSION_FILE="$SESSION_DIR/rollout-$SESSION_NAME.jsonl"

mkdir -p "$SESSION_DIR"

# Create session metadata
echo "{\\"timestamp\\":\\"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\\",\\"type\\":\\"session_meta\\",\\"payload\\":{\\"id\\":\\"$SESSION_NAME\\",\\"cwd\\":\\"$PROJECT_PATH\\",\\"cli_version\\":\\"abacus-ai-desktop\\"}}" > "$SESSION_FI>

echo "Session file created: $SESSION_FILE"
echo "Add messages, then run: cass index"

```

Usage:

```bash
./export_session.sh "myproject-work" "/home/ubuntu/Developer/myproject"
```

## Common Patterns

### Starting a New Feature

```
1. ~/cm-context-prompt.sh "feature description"
2. bv --robot-triage | jq '.recommendations[0]'
3. bd update bd-X --status in_progress
4. am_reserve "Name" "relevant/paths/**"
5. Create feature branch: git checkout -b feature/name
6. Implement with tests
7. ubs . before each commit
8. bd close bd-X
9. am_release "Name" "relevant/paths/**"

```

### Fixing a Bug

```
1. Create bug bead: bd create "Bug: description" -p 0 -t bug
2. Claim it: bd update bd-X --status in_progress
3. Reserve affected files
4. Write failing test first
5. Fix bug
6. Verify test passes
7. ubs . before commit
8. Close bead with fix description

```

### Refactoring

```
1. Announce to team: am_send "Name" "All" "Refactoring X" "..."
2. Reserve broadly: am_reserve "Name" "src/**,tests/**" 7200 true
3. Create refactor task in beads
4. Ensure all tests pass BEFORE refactoring
5. Make changes incrementally
6. Run tests after each step
7. ubs . frequently
8. Close bead, release reservations

```

## When Multiple Agents Work Simultaneously

### Coordination Strategy

**Spatial Separation:**

- Agent A: Backend (src/api/**)
- Agent B: Frontend (src/components/**)
- Agent C: Tests (tests/**)

**Temporal Coordination:**

- Use reservations to serialize work on shared files
- Check messages frequently
- Announce blocks immediately

**Handoff Protocol:**

```bash
# Agent A finishes API
am_send "AgentA" "AgentB" "API ready" "Auth endpoints done at /api/auth/*"

# Agent B can now start
am_reserve "AgentB" "src/components/auth/**"

---

## Emergency Procedures

### If You Made a Mistake

**Don't panic. Don't use `git reset --hard`.**

```bash
# 1. Stop and assess
git status

# 2. If uncommitted, stash
git stash

# 3. If committed, revert
git revert HEAD

# 4. Ask for help
am_send "You" "All" "Need help" "I made mistake: [what happened]"

```

### If Agent Mail is Down

```bash
# Check status
am_status

# Restart if needed
tmux send-keys -t acfs-services C-c
tmux send-keys -t acfs-services "am" Enter

# If really broken, work solo mode
# (Skip am_* commands, coordinate via commits)

```

### If UBS Blocks Commit (False Positive)

```bash
# Review the UBS output carefully
ubs <file>

# If genuinely false positive:
SKIP_UBS=1 git commit -m "message (UBS false positive: reason)"

# But document WHY in commit message

---

## Anti-Patterns (DON'T DO THESE)

❌ **Don't:**

- Delete files without explicit permission
- Force push (`git push -f`)
- Commit without running UBS
- Edit reserved files
- Ignore messages from other agents
- Work on tasks without claiming them in beads
- Skip testing
- Use `-dangerously-skip-permissions` flags in production
- Commit directly to main (use feature branches)

✅ **Do:**

- Ask before destructive operations
- Reserve files before editing
- Check messages regularly
- Update beads as you work
- Run UBS before every commit
- Write tests for new code
- Use feature branches
- Communicate early and often

---

## Quick Reference

```bash
# Agent Mail
am_register "Name" "abacusai" "model"
am_agents
am_inbox "Name"
am_send "Name" "To" "Subject" "Body"
am_reserve "Name" "paths/**" 3600 true
am_release "Name" "paths/**"

# Beads
bd ready
bd create "title" -p 1 -t task
bd update bd-X --status in_progress
bd close bd-X --reason "done"
bv --robot-triage

# CASS Memory
~/cm-context-prompt.sh "task"
cm playbook add "rule" --category "cat"
cass search "query"

# UBS
ubs .
ubs $(git diff --cached --name-only)

# Git
git status
git diff --cached
git add <files>
git commit -m "message"

```
## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
    
    ```bash
    git pull --rebase
    bd sync
    git push
    git status  # MUST show "up to date with origin"
    
    ```
    
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
