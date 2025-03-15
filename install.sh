#!/bin/sh

set -e  # Exit immediately if a command exits with a non-zero status

# ANSI color codes
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
CYAN="\033[1;36m"
RED="\033[1;31m"
NC="\033[0m" # No color

# Fancy banner
echo "${CYAN}"
echo "  ____                    _ _           "
echo " / ___| _   _ _ __   __ _| | |_ __ ___  "
echo " \___ \| | | | '_ \ / _\` | | | '_ \` _ \\ "
echo "  ___) | |_| | |_) | (_| | | | | | | | |"
echo " |____/ \__,_| .__/ \__,_|_|_|_| |_| |_|"
echo "            |_|                         "
echo "======================================"
echo "  🚀 SupaLLM Installation Script  "
echo "======================================"
echo "${NC}"

echo "${YELLOW}➡️  Downloading required files...${NC}"

# Download the docker-compose file
if curl -fsSL https://raw.githubusercontent.com/supallm/supallm/main/docker-compose.yml -o docker-compose.yml; then
    echo "${GREEN}✅ docker-compose.yml downloaded successfully.${NC}"
else
    echo "${RED}❌ Failed to download docker-compose.yml.${NC}"
    exit 1
fi

# Download the environment configuration file
if curl -fsSL https://raw.githubusercontent.com/supallm/supallm/main/.env.exemple -o .env; then
    echo "${GREEN}✅ .env file downloaded successfully.${NC}"
else
    echo "${RED}❌ Failed to download .env file.${NC}"
    exit 1
fi

# Final message
echo ""
echo "${GREEN}🎉 Installation completed successfully.${NC}"
echo "--------------------------------------"
echo "📄 Next Steps:\n"
echo "1️⃣  Edit your .env file to configure your environment."
echo "2️⃣  Start your stack with: ${CYAN}docker compose up -d${NC}"
echo "3️⃣  Open the dashboard at ${CYAN}http://localhost:3001${NC} (or the port of your choice if you updated it)."

echo "--------------------------------------"