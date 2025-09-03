#!/bin/bash

# MCP Server Installation Script
# This script installs all MCP servers at the user level (globally via npm)

# Better error handling
set -euo pipefail  # Exit on error, undefined variables, pipe failures
IFS=$'\n\t'      # Secure Internal Field Separator

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Cleanup function
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "MCP installation failed with exit code $exit_code"
        log_info "Check the error messages above for details"
    fi
    exit $exit_code
}

# Set trap for cleanup
trap cleanup EXIT

echo "======================================"
echo "MCP Server Installation Script"
echo "======================================"
echo ""

# Check if Node.js and npm are installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Array of MCP servers to install
declare -a servers=(
    "@playwright/mcp@0.0.36"
    "@modelcontextprotocol/server-filesystem@2025.8.21"
    "@modelcontextprotocol/server-github@2025.4.8"
    "@modelcontextprotocol/server-sequential-thinking@2025.7.1"
    "duckduckgo-mcp-server@0.1.2"
    "n8n-mcp@2.10.6"
    "ref-tools-mcp@3.0.0"
    "webflow-mcp-server@0.7.0"
)

# Function to check if an MCP server is already installed
check_mcp_server() {
    local server_package="$1"
    local package_name
    
    # Extract package name without version
    package_name=$(echo "$server_package" | cut -d'@' -f1)
    if [[ "$package_name" == "@"* ]]; then
        # Handle scoped packages like @playwright/mcp@0.0.36
        package_name=$(echo "$server_package" | cut -d'@' -f1-2)
    fi
    
    # Check if package is installed globally
    if npm list -g "$package_name" &>/dev/null; then
        return 0  # Already installed
    else
        return 1  # Not installed
    fi
}

# Install each server with skip logic
echo "Installing MCP servers globally..."
echo "======================================"

installed_count=0
skipped_count=0
failed_count=0

for server in "${servers[@]}"; do
    echo ""
    log_info "Processing: $server"
    
    if check_mcp_server "$server"; then
        log_success "$server is already installed, skipping"
        ((skipped_count++))
    else
        if npm install -g "$server" &>/dev/null; then
            log_success "Successfully installed: $server"
            ((installed_count++))
        else
            log_warning "Failed to install $server"
            # Check if it's actually installed despite the error
            if check_mcp_server "$server"; then
                log_success "$server is actually installed and working"
                ((installed_count++))
            else
                ((failed_count++))
            fi
        fi
    fi
done

echo ""
log_info "Installation summary: $installed_count installed, $skipped_count skipped, $failed_count failed"

echo ""
echo "======================================"
echo "Installing Playwright browsers..."
echo "======================================"

# Install Playwright browsers
if command -v playwright &> /dev/null; then
    echo "Installing Playwright browser binaries..."
    playwright install chromium firefox webkit
    playwright install-deps
    echo "✅ Playwright browsers installed"
else
    echo "⚠️  Playwright CLI not found, skipping browser installation"
    echo "   You may need to run: npx playwright install"
fi

echo ""
echo "======================================"
echo "Installation Summary"
echo "======================================"
echo ""
echo "Installed MCP Servers:"
npm list -g --depth=0 | grep -E "(mcp|MCP|@modelcontextprotocol|@playwright/mcp)" || true

echo ""
echo "======================================"
echo "✅ Installation complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Configure your IDE/CLI with the MCP servers"
echo "2. Set up any required API keys (GitHub, n8n, Webflow)"
echo "3. Verify the installation in your preferred MCP client"
echo ""
echo "Configuration files are available in: ~/Documents/MCP Tools/configs/"
