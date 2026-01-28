#!/bin/bash

# Register Agent Script for MCP Agent Mail
# Usage: ./register_agent.sh "AgentName" "model-id" "/absolute/path/to/project"

AGENT_NAME="$1"
MODEL_ID="$2"
PROJECT_PATH="$3"
AGENT_MAIL_URL="${4:-http://127.0.0.1:8765/mcp/}"
BEARER_TOKEN="${5:-c66fe43368bcac37f0ae42182f4142bd4108e6b686f0cbfa89a04d935b926f23}"

# Validate inputs
if [ -z "$AGENT_NAME" ] || [ -z "$MODEL_ID" ] || [ -z "$PROJECT_PATH" ]; then
    echo "Usage: $0 \"AgentName\" \"model-id\" \"/absolute/path/to/project\""
    exit 1
fi

# Validate naming convention (must be AdjectiveNoun in PascalCase)
if [[ ! "$AGENT_NAME" =~ ^[A-Z][a-z]+[A-Z][a-z]+$ ]]; then
    echo "Error: Agent name must be in AdjectiveNoun PascalCase format (e.g., WhiteCastle)"
    exit 1
fi

# Slugify project path to match server logic
PROJECT_SLUG=$(echo "$PROJECT_PATH" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/^-//' | sed 's/-$//')

# Register the agent
echo "Registering agent: $AGENT_NAME with model: $MODEL_ID for project: $PROJECT_PATH"

curl -s -X POST "$AGENT_MAIL_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"register_agent\",
      \"arguments\": {
        \"agent_name\": \"$AGENT_NAME\",
        \"program\": \"$MODEL_ID\",
        \"model\": \"$MODEL_ID\",
        \"project_slug\": \"$PROJECT_SLUG\",
        \"project_key\": \"$PROJECT_PATH\"
      }
    }
  }"

echo ""