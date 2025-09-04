#!/bin/bash

# MCP Project Manager Installation Script
# This script installs the project-specific MCP management tool

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

echo "========================================="
echo "MCP Project Manager Installation"
echo "========================================="
echo ""

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! command -v npm &> /dev/null; then
    log_error "npm is not installed. Please install npm first."
    exit 1
fi

log_success "Node.js version: $(node --version)"
log_success "npm version: $(npm --version)"

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_MANAGER_DIR="$SCRIPT_DIR/mcp-project-manager"

# Check if mcp-project-manager directory exists
if [ ! -d "$PROJECT_MANAGER_DIR" ]; then
    log_error "mcp-project-manager directory not found at $PROJECT_MANAGER_DIR"
    exit 1
fi

# Change to project manager directory
cd "$PROJECT_MANAGER_DIR"

log_info "Installing dependencies..."
npm install

log_info "Building TypeScript..."
npm run build

log_info "Linking package globally..."
npm link

log_success "MCP Project Manager installed successfully!"

echo ""
echo "========================================="
echo "Available Commands:"
echo "========================================="
echo ""
echo "🧙‍♂️  mcp-setup        - Setup wizard (EASIEST - recommended!)"
echo "🚀 mcp-init          - Initialize project with MCP servers"
echo "➕ mcp-add           - Add servers to current project"
echo "➖ mcp-remove        - Remove servers from current project"
echo "📋 mcp-list          - List servers and project info"
echo "🔄 mcp-sync          - Sync IDE configurations"
echo "📦 mcp-migrate       - Migrate from global setup"
echo ""
echo "🌟 Super Quick Start (30 seconds):"
echo "  cd your-project"
echo "  mcp-setup     # 🧙‍♂️ Just answer 2 questions!"
echo ""
echo "🔧 Manual Setup:"
echo "  cd your-project"
echo "  mcp-init      # Full control over configuration"
echo ""

log_success "Ready to use! 🚀"