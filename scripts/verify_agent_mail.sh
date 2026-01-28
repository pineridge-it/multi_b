
# Quick verification script for Agent Mail integration

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Agent Mail Connection Test ===${NC}\n"

# Check if Agent Mail server is running
echo -e "${BLUE}1. Checking Agent Mail server...${NC}"
if curl -s http://127.0.0.1:8765/health/liveness > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Agent Mail server is running${NC}\n"
else
    echo -e "${RED}✗ Agent Mail server is not responding${NC}"
    echo -e "${RED}  Run 'am' to start the server${NC}\n"
    exit 1
fi

# Check if MCP server is configured in Abacus
echo -e "${BLUE}2. Checking MCP configuration...${NC}"
if abacusai mcp list | grep -q "agent-mail"; then
    echo -e "${GREEN}✓ Agent Mail MCP server is configured${NC}\n"
else
    echo -e "${RED}✗ Agent Mail MCP server not found${NC}"
    echo -e "${RED}  Run ./setup_abacus_agents.sh first${NC}\n"
    exit 1
fi

# List registered agents
echo -e "${BLUE}3. Listing registered agents...${NC}"

# Get bearer token
if [ -f ~/.mcp_agent_mail_git_mailbox_repo/.env ]; then
    BEARER_TOKEN=$(grep "^HTTP_BEARER_TOKEN=" ~/.mcp_agent_mail_git_mailbox_repo/.env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
fi

PROJECT_PATH=$(pwd)

# Query for registered agents
# Slugify project path to match server logic
PROJECT_SLUG=$(echo "$PROJECT_PATH" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/^-//' | sed 's/-$//')
AGENTS=$(curl -s -X POST "http://127.0.0.1:8765/mcp/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -d "{
                                                                                              
