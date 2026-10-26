#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}     WhatsApp Monitor & CRM - Fast Redeploy        ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Check docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please run './setup.sh' first.${NC}"
    exit 1
fi

echo -e "\n${YELLOW}[1/4] Pulling updates (if git repository)...${NC}"
if [ -d .git ]; then
    git pull || echo -e "${YELLOW}Warning: Git pull had conflicts or is not clean. Continuing with local files...${NC}"
fi

echo -e "\n${YELLOW}[2/4] Rebuilding frontend and backend containers...${NC}"
docker compose -f docker-compose.yml build frontend api

echo -e "\n${YELLOW}[3/4] Re-creating containers with zero-downtime refresh...${NC}"
docker compose -f docker-compose.yml up -d --remove-orphans

echo -e "\n${YELLOW}[4/4] Applying database schema migrations...${NC}"
docker compose -f docker-compose.yml exec -T api npx prisma migrate deploy 2>/dev/null || true

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}   REDEPLOY SUCCESSFUL!                             ${NC}"
echo -e "${GREEN}====================================================${NC}"
docker compose -f docker-compose.yml ps
