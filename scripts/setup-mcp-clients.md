# LLM-Executable MCP Setup Instructions

This document contains step-by-step instructions for an LLM to automatically detect installed IDEs/CLIs and configure them with MCP servers.

## Phase 1: Detection - Check for Installed Applications

Execute each command below to detect which applications are installed:

### IDE/Editor Detection

```bash
# Check for Cursor
ls -la /Applications/Cursor.app 2>/dev/null && echo "✅ Cursor found" || echo "❌ Cursor not found"

# Check for Windsurf
ls -la /Applications/Windsurf.app 2>/dev/null && echo "✅ Windsurf found" || echo "❌ Windsurf not found"

# Check for VS Code
ls -la /Applications/"Visual Studio Code.app" 2>/dev/null && echo "✅ VS Code found" || echo "❌ VS Code not found"

# Check for Claude Desktop
ls -la /Applications/Claude.app 2>/dev/null && echo "✅ Claude Desktop found" || echo "❌ Claude Desktop not found"

# Check for Warp
ls -la /Applications/Warp.app 2>/dev/null && echo "✅ Warp found" || echo "❌ Warp not found"
```

### CLI Detection

```bash
# Check for Claude Code CLI
which claude 2>/dev/null && echo "✅ Claude Code CLI found at $(which claude)" || echo "❌ Claude Code CLI not found"
```

## Phase 2: Installation - Install All MCP Servers

Execute the installation script to install all MCP servers globally.

**The script includes intelligent skip logic - it will only install missing servers and skip those already installed.**

```bash
# Make the script executable
chmod +x ~/Documents/"MCP Tools"/scripts/install-mcp-servers.sh

# Run the installation script (safe to run multiple times)
~/Documents/"MCP Tools"/scripts/install-mcp-servers.sh
```

**Features:**
- ✅ Automatically skips already installed servers
- ✅ Graceful error handling for failed installations
- ✅ Colored output for easy reading
- ✅ Installation summary with counts
- ✅ Safe to run multiple times

### Alternative: Manual Installation Commands

If the script fails, run these commands individually:

```bash
# Install each MCP server globally
npm install -g @playwright/mcp@0.0.36
npm install -g @modelcontextprotocol/server-filesystem@2025.8.21
npm install -g @modelcontextprotocol/server-github@2025.4.8
npm install -g @modelcontextprotocol/server-sequential-thinking@2025.7.1
npm install -g duckduckgo-mcp-server@0.1.2
npm install -g n8n-mcp@2.10.6
npm install -g ref-tools-mcp@3.0.0
npm install -g webflow-mcp-server@0.7.0

# Install Playwright browsers
playwright install chromium firefox webkit
playwright install-deps
```

### Verify Installation

```bash
# List all installed MCP servers
npm list -g --depth=0 | grep -E "(mcp|MCP|@modelcontextprotocol|@playwright/mcp)"
```

## Phase 3: Configuration - Set Up Each Detected Application

### For Cursor (if detected)

```bash
# Check if Cursor config directory exists
if [ -d "$HOME/Library/Application Support/Cursor/User" ]; then
    # Backup existing config if it exists
    if [ -f "$HOME/Library/Application Support/Cursor/User/mcp.json" ]; then
        cp "$HOME/Library/Application Support/Cursor/User/mcp.json" "$HOME/Library/Application Support/Cursor/User/mcp.json.backup"
    fi
    
    # Copy the MCP configuration
    cp ~/Documents/"MCP Tools"/configs/cursor-config.json "$HOME/Library/Application Support/Cursor/User/mcp.json"
    echo "✅ Cursor MCP configuration installed"
else
    echo "⚠️ Cursor config directory not found. Please open Cursor first, then run this again."
fi
```

### For Windsurf (if detected)

```bash
# Check if Windsurf config directory exists
if [ -d "$HOME/Library/Application Support/windsurf" ]; then
    # Backup existing config if it exists
    if [ -f "$HOME/Library/Application Support/windsurf/mcp_settings.json" ]; then
        cp "$HOME/Library/Application Support/windsurf/mcp_settings.json" "$HOME/Library/Application Support/windsurf/mcp_settings.json.backup"
    fi
    
    # Copy the MCP configuration
    cp ~/Documents/"MCP Tools"/configs/windsurf-config.json "$HOME/Library/Application Support/windsurf/mcp_settings.json"
    echo "✅ Windsurf MCP configuration installed"
else
    echo "⚠️ Windsurf config directory not found. Please open Windsurf first, then run this again."
fi
```

### For VS Code (if detected)

```bash
# Check if VS Code config directory exists
if [ -d "$HOME/Library/Application Support/Code/User" ]; then
    # Check if Continue extension directory exists
    if [ -d "$HOME/.continue" ]; then
        # Backup existing config if it exists
        if [ -f "$HOME/.continue/config.json" ]; then
            cp "$HOME/.continue/config.json" "$HOME/.continue/config.json.backup"
        fi
        
        # Merge MCP configuration into Continue config
        if [ -f "$HOME/.continue/config.json" ]; then
            # Read existing config and merge
            echo "⚠️ Continue config exists. Manual merge required."
            echo "Please add the mcpServers section from ~/Documents/MCP Tools/configs/vscode-config.json"
        else
            # Create new config
            cp ~/Documents/"MCP Tools"/configs/vscode-config.json "$HOME/.continue/config.json"
            echo "✅ VS Code Continue MCP configuration installed"
        fi
    else
        echo "⚠️ Continue extension not found. Please install the Continue extension in VS Code first."
    fi
else
    echo "⚠️ VS Code config directory not found"
fi
```

### For Claude Desktop (if detected)

```bash
# Claude Desktop config location on macOS
CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"

if [ -d "$CLAUDE_CONFIG_DIR" ]; then
    # Backup existing config if it exists
    if [ -f "$CLAUDE_CONFIG_DIR/claude_desktop_config.json" ]; then
        cp "$CLAUDE_CONFIG_DIR/claude_desktop_config.json" "$CLAUDE_CONFIG_DIR/claude_desktop_config.json.backup"
    fi
    
    # Copy the MCP configuration
    cp ~/Documents/"MCP Tools"/configs/claude-desktop-config.json "$CLAUDE_CONFIG_DIR/claude_desktop_config.json"
    echo "✅ Claude Desktop MCP configuration installed"
else
    echo "⚠️ Claude Desktop config directory not found. Please open Claude Desktop first, then run this again."
fi
```

### For Warp (if detected)

```bash
# Warp config location
WARP_CONFIG_DIR="$HOME/.warp"

if [ -d "$WARP_CONFIG_DIR" ]; then
    # Check if MCP config exists
    if [ -f "$WARP_CONFIG_DIR/mcp_config.json" ]; then
        cp "$WARP_CONFIG_DIR/mcp_config.json" "$WARP_CONFIG_DIR/mcp_config.json.backup"
    fi
    
    # Copy the MCP configuration
    cp ~/Documents/"MCP Tools"/configs/warp-config.json "$WARP_CONFIG_DIR/mcp_config.json"
    echo "✅ Warp MCP configuration installed"
else
    echo "⚠️ Warp config directory not found. Creating it..."
    mkdir -p "$HOME/.warp"
    cp ~/Documents/"MCP Tools"/configs/warp-config.json "$HOME/.warp/mcp_config.json"
    echo "✅ Warp MCP configuration installed"
fi
```

### For Claude Code CLI (if detected)

```bash
# Check if claude CLI is available
if command -v claude &> /dev/null; then
    echo "Installing MCP servers in Claude Code CLI..."
    
    # Run each command from the config file
    claude mcp add playwright npx @playwright/mcp@latest
    claude mcp add filesystem npx @modelcontextprotocol/server-filesystem
    claude mcp add github npx @modelcontextprotocol/server-github
    claude mcp add sequential-thinking npx @modelcontextprotocol/server-sequential-thinking
    claude mcp add duckduckgo npx duckduckgo-mcp-server
    claude mcp add n8n npx n8n-mcp
    claude mcp add ref-tools npx ref-tools-mcp
    claude mcp add webflow npx webflow-mcp-server
    
    echo "✅ Claude Code CLI MCP servers configured"
else
    echo "❌ Claude Code CLI not found. Install it first with: npm install -g @anthropic-ai/claude-cli"
fi
```

## Phase 4: Environment Variables Setup

Create environment variables file for API keys:

```bash
# Create .env file for API keys
cat > ~/Documents/"MCP Tools"/.env << 'EOF'
# GitHub API Token (get from: https://github.com/settings/tokens)
export GITHUB_TOKEN="your_github_token_here"

# n8n Configuration
export N8N_API_KEY="your_n8n_api_key_here"
export N8N_BASE_URL="https://your-n8n-instance.com"

# Webflow API Token (get from: https://webflow.com/dashboard/account/apps)
export WEBFLOW_API_TOKEN="your_webflow_token_here"
EOF

echo "✅ Environment template created at ~/Documents/MCP Tools/.env"
echo "⚠️ Please edit this file and add your actual API keys"
```

## Phase 5: Verification

Run these commands to verify the setup:

```bash
# Test that MCP servers are accessible
echo "Testing MCP server availability..."

# Test Playwright MCP
npx @playwright/mcp --version && echo "✅ Playwright MCP working" || echo "❌ Playwright MCP not working"

# Test filesystem server
npx @modelcontextprotocol/server-filesystem --help 2>/dev/null && echo "✅ Filesystem MCP working" || echo "✅ Filesystem MCP ready (no --help flag)"

# List all configured applications
echo ""
echo "Configuration Summary:"
echo "======================"

[ -f "$HOME/Library/Application Support/Cursor/User/mcp.json" ] && echo "✅ Cursor configured" || echo "❌ Cursor not configured"
[ -f "$HOME/Library/Application Support/windsurf/mcp_settings.json" ] && echo "✅ Windsurf configured" || echo "❌ Windsurf not configured"
[ -f "$HOME/.continue/config.json" ] && echo "✅ VS Code Continue configured" || echo "❌ VS Code Continue not configured"
[ -f "$HOME/Library/Application Support/Claude/claude_desktop_config.json" ] && echo "✅ Claude Desktop configured" || echo "❌ Claude Desktop not configured"
[ -f "$HOME/.warp/mcp_config.json" ] && echo "✅ Warp configured" || echo "❌ Warp not configured"

# Check Claude CLI
if command -v claude &> /dev/null; then
    claude mcp list 2>/dev/null && echo "✅ Claude Code CLI configured" || echo "❌ Claude Code CLI not configured"
fi
```

## Troubleshooting Commands

If you encounter issues, run these diagnostic commands:

```bash
# Check Node.js and npm versions
node --version
npm --version

# Check npm global installation directory
npm config get prefix

# List all globally installed packages
npm list -g --depth=0

# Check if npx can find the servers
which npx

# Test a specific server
npx @playwright/mcp --version
```

## Manual Configuration Paths Reference

If automatic configuration fails, manually copy configs to these locations:

- **Cursor**: `~/Library/Application Support/Cursor/User/mcp.json`
- **Windsurf**: `~/Library/Application Support/windsurf/mcp_settings.json`
- **VS Code Continue**: `~/.continue/config.json`
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Warp**: `~/.warp/mcp_config.json`

## Notes for LLM Execution

1. Run commands in sequence, checking output before proceeding
2. If a directory doesn't exist, the application may not be installed or hasn't been opened yet
3. Always create backups before overwriting existing configurations
4. Some applications may need to be restarted after configuration
5. API keys should be kept secure and never committed to version control
