#!/bin/bash

# Agent Mail Helpers for Abacus AI
# Source this file to get am_* functions

AGENT_MAIL_URL="http://127.0.0.1:8765/mcp/"

# Register agent
am_register() {
    local agent_name="$1"
    local model="$2"
    local project_path="$3"
    if [ -z "$agent_name" ] || [ -z "$model" ] || [ -z "$project_path" ]; then
        echo "Usage: am_register <agent_name> <model> <project_path>"
        return 1
    fi
    local project_slug
    project_slug=$(basename "$project_path" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
    curl -s -X POST -H "Content-Type: application/json" -d "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"register_agent\", \"params\": {\"agent_name\": \"$agent_name\", \"program\": \"AbacusSonnet\", \"model\": \"$model\", \"project_slug\": \"$project_slug\"}}" "$AGENT_MAIL_URL"
}

# List agents
am_agents() {
    curl -s -X POST -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "list_agents", "params": {}}' "$AGENT_MAIL_URL"
}

# Check inbox
am_inbox() {
    curl -s -X POST -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "get_inbox", "params": {}}' "$AGENT_MAIL_URL"
}

# Reserve file
am_reserve() {
    local file_path="$1"
    if [ -z "$file_path" ]; then
        echo "Usage: am_reserve <file_path>"
        return 1
    fi
    curl -s -X POST -H "Content-Type: application/json" -d "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"reserve_file\", \"params\": {\"file_path\": \"$file_path\"}}" "$AGENT_MAIL_URL"
}

# Send message
am_send() {
    local recipient="$1"
    local message="$2"
    if [ -z "$recipient" ] || [ -z "$message" ]; then
        echo "Usage: am_send <recipient> <message>"
        return 1
    fi
    curl -s -X POST -H "Content-Type: application/json" -d "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"send_message\", \"params\": {\"recipient\": \"$recipient\", \"message\": \"$message\"}}" "$AGENT_MAIL_URL"
}

# Release file
am_release() {
    local file_path="$1"
    if [ -z "$file_path" ]; then
        echo "Usage: am_release <file_path>"
        return 1
    fi
    curl -s -X POST -H "Content-Type: application/json" -d "{\"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"release_file\", \"params\": {\"file_path\": \"$file_path\"}}" "$AGENT_MAIL_URL"
}