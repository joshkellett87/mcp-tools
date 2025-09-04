# 🤖 LLM-Executable MCP Setup Guide

**Complete instructions for AI assistants to set up project-specific MCP servers**

This guide contains step-by-step instructions that any LLM can follow to help users set up MCP (Model Context Protocol) servers for their specific project needs.

## 🎯 Quick Decision Tree

### For LLMs: Ask the user these questions first:

1. **"What type of project are you working on?"**
   - Web development → Use `web-dev` bundle
   - Research/documentation → Use `research` bundle  
   - Workflow automation → Use `automation` bundle
   - Just getting started → Use `essential` bundle
   - Custom needs → Use `individual` selection

2. **"Which IDEs do you use?"** (can select multiple)
   - Cursor
   - Windsurf  
   - Claude Code CLI
   - Claude Desktop
   - Warp

3. **"Do you have API keys ready?"** (show what's needed based on bundle)
   - GitHub Token (for github server)
   - n8n API Key + Base URL (for n8n server)
   - Webflow API Token (for webflow server)

## 🚀 Installation Commands

### Step 1: Install MCP Project Manager
```bash
# Run this first - it installs the management tool
chmod +x ~/Documents/mcp-tools/install-project-manager.sh
~/Documents/mcp-tools/install-project-manager.sh
```

**Expected output:** You should see "✅ MCP Project Manager installed successfully!"

### Step 2: Navigate to Project Directory
```bash
# Go to your project folder
cd /path/to/your/project

# OR create a new project
mkdir my-new-project && cd my-new-project
```

## 📦 Project Type Setup Commands

Copy and run the appropriate command based on the user's project type:

### Web Development Projects
```bash
# Includes: filesystem, sequential-thinking, github, duckduckgo, playwright
mcp-init --bundle web-dev --ides cursor,windsurf
```
**Servers included:** File operations, reasoning, GitHub integration, web search, browser automation

### Research Projects  
```bash
# Includes: filesystem, sequential-thinking, duckduckgo, ref-tools, github
mcp-init --bundle research --ides cursor,windsurf
```
**Servers included:** File operations, reasoning, web search, documentation tools, GitHub integration

### Automation Projects
```bash
# Includes: filesystem, sequential-thinking, n8n, webflow
mcp-init --bundle automation --ides cursor,windsurf
```
**Servers included:** File operations, reasoning, workflow automation, Webflow CMS

### Essential Only (Minimal Setup)
```bash
# Includes: filesystem, sequential-thinking
mcp-init --bundle essential --ides cursor,windsurf
```
**Servers included:** File operations, reasoning capabilities only

### Custom Interactive Setup
```bash
# Let user choose servers individually
mcp-init
```
**Process:** User will get interactive prompts to select specific servers and IDEs

## 🔑 Environment Variables Setup

If the user selected servers that need API keys, help them set this up:

### Step 1: Check what's needed
```bash
# After running mcp-init, check if .env template was created
ls .mcp/
```

If you see `.env` file, continue with setup:

### Step 2: Copy and edit environment file
```bash
# Copy template to project root
cp .mcp/.env .env

# Show user what needs to be filled in
cat .env
```

### Step 3: Guide user to fill in API keys

**For GitHub integration:**
1. Go to https://github.com/settings/tokens
2. Create a Personal Access Token
3. Copy token to `.env` file as `GITHUB_TOKEN=your_token_here`

**For n8n integration:**
1. Get API key from your n8n instance
2. Add to `.env`: `N8N_API_KEY=your_key` and `N8N_BASE_URL=https://your-n8n-instance.com`

**For Webflow integration:**
1. Go to https://webflow.com/dashboard/account/apps
2. Create API token
3. Add to `.env`: `WEBFLOW_API_TOKEN=your_token`

### Step 4: Apply environment variables
```bash
# Update all IDE configurations with API keys
mcp-sync
```

## 🔄 Verification Commands

Help user verify everything is working:

### Check project configuration
```bash
# Show configured servers
mcp-list

# Show project structure
ls .mcp/
```

**Expected files:** `config.json`, IDE-specific config files, possibly `.env`

### Test IDE integration
```bash
# For Cursor users
cat .mcp/cursor.json

# For Windsurf users  
cat .mcp/windsurf.json

# For Claude Code users
./.mcp/claude-code-setup.sh
```

## 🛠️ Common Follow-up Actions

### Add more servers later
```bash
# Add specific servers to existing project
mcp-add github playwright

# Remove servers no longer needed
mcp-remove webflow n8n
```

### Sync new IDEs
```bash
# User got a new IDE, add it to existing project
mcp-sync --ides warp
```

### Team setup
```bash
# For team members joining project with existing MCP setup
cp .mcp/.env .env    # Copy template
# Edit .env with their API keys
mcp-sync             # Apply their configuration
```

## 🔍 Troubleshooting Commands

### IDE not showing MCP servers
```bash
# Regenerate all configurations
mcp-sync

# Check specific IDE config
cat .mcp/cursor.json | jq '.mcpServers'
```
**Solution:** Restart the IDE after running mcp-sync

### Environment variables not working
```bash
# Verify .env exists in project root
ls -la .env

# Check content
cat .env

# Reapply configuration
mcp-sync
```

### Command not found errors
```bash
# Reinstall if needed
~/Documents/mcp-tools/install-project-manager.sh

# Check installation
which mcp-init
```

## 📋 Server Bundle Reference

| Bundle | Servers Included | Best For |
|--------|-----------------|----------|
| `essential` | filesystem, sequential-thinking | Basic file operations and reasoning |
| `web-dev` | + github, duckduckgo, playwright | Web development projects |
| `research` | + duckduckgo, ref-tools, github | Research and documentation |
| `automation` | + n8n, webflow | Workflow and CMS automation |
| `full` | All available servers | Comprehensive setups |

## 💡 LLM Instructions Summary

**When helping a user:**

1. **Ask about project type** → Choose appropriate bundle
2. **Ask about IDEs** → Include in `--ides` parameter  
3. **Run installation** → Use install script first
4. **Run project setup** → Use appropriate `mcp-init` command
5. **Handle API keys** → Guide through .env setup if needed
6. **Verify setup** → Use verification commands
7. **Restart IDEs** → Remind user to restart their IDEs

**Key success indicators:**
- ✅ `mcp-list` shows configured servers
- ✅ `.mcp/` directory contains config files
- ✅ IDE restart shows new MCP capabilities
- ✅ No error messages during setup

This guide eliminates the need for users to understand terminal commands while providing LLMs with clear, executable instructions for any MCP setup scenario.