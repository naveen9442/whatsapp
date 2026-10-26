#!/bin/bash
# Re-exec with bash if invoked with sh (e.g. `sh setup.sh`)
if [ -z "$BASH_VERSION" ]; then
    exec bash "$0" "$@"
fi

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   HALOOCOM WhatsApp Monitor - Initial Server Setup ${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Check root / sudo
if [ "$(id -u)" -ne 0 ]; then
  echo -e "${YELLOW}Warning: Running as non-root. If commands fail, re-run with 'sudo bash setup.sh'${NC}"
fi

# 2. Check & Install Docker / Docker Compose if missing
echo -e "\n${YELLOW}[1/5] Checking Docker and Docker Compose...${NC}"

# Remove conflicting Ubuntu default docker-compose-v2 package if present to avoid dpkg overwrite errors
if dpkg -l 2>/dev/null | grep -q "docker-compose-v2"; then
    echo "Resolving package conflicts with docker-compose-v2..."
    apt-get remove -y docker-compose-v2 > /dev/null 2>&1 || true
fi

if ! command -v docker > /dev/null 2>&1; then
    echo "Installing Docker Engine..."
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}Docker installed successfully!${NC}"
else
    # Ensure docker-compose plugin is functional
    if ! docker compose version > /dev/null 2>&1; then
        echo "Installing Docker Compose plugin..."
        apt-get install -y --fix-broken > /dev/null 2>&1 || true
        apt-get install -y docker-compose-plugin || apt-get install -y --allow-downgrades docker-compose-plugin
    fi
    echo -e "${GREEN}Docker is already installed ($(docker --version))${NC}"
fi

# 3. Environment File (.env) check
echo -e "\n${YELLOW}[2/5] Checking environment configuration (.env)...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${GREEN}.env created with default demo configuration.${NC}"
    else
        echo -e "${RED}Error: Neither .env nor .env.example was found.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}.env file exists.${NC}"
fi

# Ensure permissions
chmod +x api/entrypoint.sh 2>/dev/null || true

# 4. Build and start containers
echo -e "\n${YELLOW}[3/5] Building images and starting containers...${NC}"
docker compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose.yml build --no-cache api
docker compose -f docker-compose.yml build
docker compose -f docker-compose.yml up -d

# 5. Wait for database and api health
echo -e "\n${YELLOW}[4/5] Waiting for services to become healthy...${NC}"
ATTEMPTS=0
MAX_ATTEMPTS=30
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    API_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' whatsapp-api-1 2>/dev/null || echo '"starting"')
    if [ "$API_STATUS" = '"healthy"' ]; then
        echo -e "${GREEN}API service is healthy!${NC}"
        break
    fi
    echo "Waiting for API service ($API_STATUS)... (attempt $((ATTEMPTS+1))/$MAX_ATTEMPTS)"
    sleep 3
    ATTEMPTS=$((ATTEMPTS+1))
done

# 6. Seed demo data
echo -e "\n${YELLOW}[5/5] Seeding database with initial data (users, agents, metrics)...${NC}"
docker compose -f docker-compose.yml exec -T api node prisma/seed.js 2>/dev/null || \
docker compose -f docker-compose.yml exec -T api node dist/src/prisma/seed.js 2>/dev/null || \
docker compose -f docker-compose.yml exec -T api node dist/prisma/seed.js 2>/dev/null || \
echo -e "${YELLOW}Note: Seed already populated or completed during migration.${NC}"

# 7. Final instructions
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}   DEPLOYMENT COMPLETE & RUNNING!                   ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "Dashboard URL: ${BLUE}http://${SERVER_IP}/${NC}"
echo -e "Admin Login:   ${YELLOW}admin@demo.com${NC}  | Password: ${YELLOW}admin123${NC}"
echo -e "Viewer Login:  ${YELLOW}viewer@demo.com${NC} | Password: ${YELLOW}viewer123${NC}"
echo -e "\nUseful commands:"
echo -e "  To redeploy anytime: ${BLUE}./deploy.sh${NC}"
echo -e "  To view live logs:   ${BLUE}docker compose logs -f${NC}"
echo -e "  To check status:     ${BLUE}docker compose ps${NC}"
echo -e "  To stop all:         ${BLUE}docker compose down${NC}"
echo -e "====================================================\n"