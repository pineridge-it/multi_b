# MCP Agent Mail Registration SOP

To successfully register agents in the future, follow this strict protocol:

## 1. Pre-Flight Checks
- **Server Status**: Ensure the MCP Agent Mail server is running.
  ```bash
  curl -s http://127.0.0.1:8765/health/liveness
  # If failed, start with: python3 -m mcp_agent_mail.cli serve-http
  ```

## 2. Naming Convention (CRITICAL)
- **Format**: Must be `AdjectiveNoun` (PascalCase).
- **Validation**: Names like "AbacusSonnet" or "TestAgent" are **REJECTED**.
- **Examples**:
  - ✅ `WhiteCastle`
  - ✅ `GreenLake`
  - ❌ `MyAgent`
  - ❌ `SonnetBot`

## 3. Registration Sequence
The system requires a strict order of operations:

### Step A: Ensure Project Exists
You cannot register an agent to a non-existent project.
```bash
./ensure_project.sh "/absolute/path/to/project"
```

### Step B: Register Agent Identity
Once the project exists, register the specific agent.
```bash
./register_agent.sh "ValidName" "model-id" "/absolute/path/to/project"
```

## 4. Verification
Always verify registration immediately after:
```bash
./scripts/verify_agent_mail.sh
```

## Quick Start Scripts
Use the helper scripts created in the root directory:
- `./ensure_project.sh`
- `./register_agent.sh`

## 5. Abacus AI MCP Integration

### How Agent Mail Works with Abacus AI

Agent Mail runs as an MCP server using the **Streamable HTTP transport** protocol, not a standard REST API. This means:

1. **Server Process**: Agent Mail runs via `uv run python -m mcp_agent_mail.cli serve-http`
2. **Default Port**: Listens on port **8765** (not 3333)
3. **Protocol**: Uses MCP protocol messages, not direct HTTP/REST calls
4. **Integration**: Abacus AI connects to Agent Mail through its MCP client integration

### Checking Agent Mail Status

```bash
# Check if process is running
ps aux | grep "mcp_agent_mail"

# Find which port it's listening on
netstat -tlnp 2>/dev/null | grep python || ss -tlnp 2>/dev/null | grep pytho

# Expected output: port 8765
# LISTEN 0      2048      127.0.0.1:8765       0.0.0.0:*
```

### Communication Methods

**❌ Direct HTTP calls (won't work):**
```bash
# This will fail with "Not Found"
curl -X POST http://localhost:8765/tools/call \
  -H "Content-Type: application/json" \
  -d '{"name": "send_message", "arguments": {...}}'
```

**✅ Through Abacus AI MCP integration:**
- Agent Mail tools are available automatically when MCP is configured in Abacus AI
- Messages are sent through Abacus AI's MCP client
- No direct curl/HTTP calls needed from agent code

### MCP Server Configuration

Agent Mail server configuration is typically in:
- `~/mcp_agent_mail/.env` (if exists)
- Default settings if no .env file

The server uses:
- **Transport**: Streamable HTTP (MCP protocol)
- **Port**: 8765 (default)
- **Host**: 127.0.0.1 (localhost only)

### Troubleshooting

If Agent Mail appears offline:
1. Check process is running: `ps aux | grep mcp_agent_mail`
2. Verify port 8765 is listening: `ss -tlnp | grep 8765`
3. Don't try direct HTTP calls - they won't work with MCP protocol
4. Ensure Abacus AI has MCP integration configured
5. Agent Mail communication happens through Abacus AI's MCP client, not direct API calls

### Key Learnings

- Agent Mail is **online and functional** even if direct HTTP calls fail
- The server uses **MCP protocol**, not REST API
- Port **8765** is the default (not 3333)
- Communication must go through **Abacus AI's MCP integration**
- Direct curl commands to Agent Mail endpoints will return "Not Found"
- This is expected behavior - not a server failure
