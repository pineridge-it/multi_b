
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Agent Mail Setup for Abacus CLI ===${NC}\n"

# Configuration
AGENT_MAIL_URL="http://127.0.0.1:8765/mcp/"
PROJECT_PATH=$(pwd)

# Get bearer token from .env if it exists
if [ -f ~/.mcp_agent_mail_git_mailbox_repo/.env ]; then
    BEARER_TOKEN=$(grep "^HTTP_BEARER_TOKEN=" ~/.mcp_agent_mail_git_mailbox_repo/.env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
fi

if [ -z "$BEARER_TOKEN" ]; then
    echo -e "${YELLOW}Warning: Could not find bearer token in .env${NC}"
    echo -e "${YELLOW}Assuming localhost unauthenticated access.${NC}"
    BEARER_TOKEN=""
fi

echo -e "${GREEN}Step 1: Adding Agent Mail MCP server to Abacus CLI${NC}"

# Add Agent Mail as an MCP server using the JSON config format
abacusai mcp add-json agent-mail "{
  \"command\": \"npx\",
  \"args\": [\"-y\", \"@modelcontextprotocol/server-fetch\", \"$AGENT_MAIL_URL\"],
  \"env\": {
    \"BEARER_TOKEN\": \"$BEARER_TOKEN\"
  }
}"

echo -e "${GREEN}✓ Agent Mail MCP server added${NC}\n"

echo -e "${GREEN}Step 2: Creating helper scripts${NC}"

# Create ensure_project.sh
cat > ./ensure_project.sh <<'ENSURE_SCRIPT'
#!/bin/bash

PROJECT_PATH="$1"
AGENT_MAIL_URL="${2:-http://127.0.0.1:8765/mcp/}"
BEARER_TOKEN="$3"
                                                                                              
