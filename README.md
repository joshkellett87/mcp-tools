# MCP Project Manager

**Project-specific MCP (Model Context Protocol) server management for multiple IDEs**

Stop installing MCP servers globally! This tool lets you configure MCP servers on a per-project basis, giving you better control, team collaboration, and cleaner development environments.

## 🚀 Super Quick Start (30 seconds!)

```bash
# Install the MCP Project Manager
chmod +x ~/Documents/mcp-tools/install-project-manager.sh
~/Documents/mcp-tools/install-project-manager.sh

# Go to your project and run the setup wizard
cd your-project
mcp-setup  # 🧙‍♂️ Interactive wizard - just answer 2 questions!
```

**The wizard will:**
- ✅ Ask what type of project you're building
- ✅ Auto-detect your installed IDEs
- ✅ Set up everything automatically
- ✅ Show you exactly what to do next

## 🔧 Advanced Options

```bash
# Manual setup with full control
mcp-init

# Quick setup with specific bundle
mcp-init --bundle web-dev --ides cursor,windsurf

# Add servers to existing project
mcp-add github playwright
```

## ✨ Why Project-Specific MCP?

### Problems with Global Setup:
- ❌ All projects get all servers (overkill)
- ❌ No team collaboration on MCP configs
- ❌ Global API keys create security risks
- ❌ Hard to manage different project needs

### Benefits of Project-Specific Setup:
- ✅ **Only install what you need** - Choose servers per project
- ✅ **Team collaboration** - Share configs through version control
- ✅ **Environment-specific keys** - Different API keys per project/environment
- ✅ **Multi-IDE support** - Works with Cursor, Windsurf, Claude Code, Warp
- ✅ **Clean development** - No global server pollution

## 📦 Available MCP Servers

### Core Servers (Essential)
- **filesystem** - File operations and management
- **sequential-thinking** - Advanced reasoning capabilities

### Integration Servers  
- **github** - GitHub repositories and issues (requires `GITHUB_TOKEN`)
- **duckduckgo** - Web search capabilities
- **ref-tools** - Reference and documentation tools

### Specialized Servers
- **playwright** - Browser automation and testing
- **n8n** - Workflow automation (requires `N8N_API_KEY`, `N8N_BASE_URL`)
- **webflow** - Webflow CMS management (requires `WEBFLOW_API_TOKEN`)

## 🎯 Predefined Bundles

- **essential** - Core servers only (filesystem, sequential-thinking)
- **web-dev** - Web development (+ github, duckduckgo, playwright)
- **automation** - Workflow tools (+ n8n, webflow)
- **research** - Research tools (+ duckduckgo, ref-tools, github)
- **full** - All available servers

## 🛠️ Supported IDEs

- **Cursor** - AI-powered code editor
- **Windsurf** - Next-generation IDE  
- **Claude Code CLI** - Command-line interface
- **Claude Desktop** - Anthropic's desktop app
- **Warp** - AI-powered terminal

## 📋 Commands

### Initialize Project
```bash
# Interactive setup
mcp-init

# Quick setup with bundle
mcp-init --bundle web-dev --ides cursor,windsurf

# Non-interactive
mcp-init --bundle essential --no-interactive
```

### Manage Servers
```bash
# Add servers to current project
mcp-add github playwright

# Remove servers
mcp-remove webflow n8n

# List project servers
mcp-list

# List all available servers
mcp-list --available

# Show server bundles
mcp-list --bundles
```

### Sync & Migrate
```bash
# Sync IDE configurations
mcp-sync

# Sync specific IDEs
mcp-sync --ides cursor,windsurf

# Migrate from global setup
mcp-migrate --from-global
```

## 📁 Project Structure

After initialization, your project will have:

```
your-project/
├── .mcp/
│   ├── config.json          # Project MCP configuration
│   ├── .env                 # Environment variables (template)
│   ├── cursor.json          # Cursor IDE configuration
│   ├── windsurf.json        # Windsurf configuration
│   ├── claude-desktop.json  # Claude Desktop configuration
│   ├── warp.json           # Warp configuration
│   └── claude-code-setup.sh # Claude Code setup script
├── .gitignore              # Ignores sensitive files
└── ...your project files
```

## 🔐 Environment Variables

Some servers require API keys. The tool creates a `.env` template in `.mcp/`:

```bash
# Copy template to project root and edit
cp .mcp/.env .env
vim .env  # Add your API keys

# Apply environment variables to configurations
mcp-sync
```

Example `.env`:
```bash
# GitHub integration
GITHUB_TOKEN=ghp_your_token_here

# n8n workflow automation
N8N_API_KEY=your_key_here
N8N_BASE_URL=https://your-n8n-instance.com

# Webflow CMS
WEBFLOW_API_TOKEN=your_token_here
```

## 👥 Team Collaboration

1. **Initialize project with MCP servers:**
   ```bash
   mcp-init --bundle web-dev
   git add .mcp/
   git commit -m "Add MCP configuration"
   ```

2. **Team members clone and configure:**
   ```bash
   git clone your-repo
   cd your-repo
   cp .mcp/.env .env  # Copy and fill in their API keys
   mcp-sync           # Apply to their IDEs
   ```

3. **The `.mcp/.env` is ignored by git** - each developer adds their own API keys

## 🔧 Installation

### Automatic Installation
```bash
chmod +x ~/Documents/mcp-tools/install-project-manager.sh
~/Documents/mcp-tools/install-project-manager.sh
```

### Manual Installation
```bash
cd ~/Documents/mcp-tools/mcp-project-manager
npm install
npm run build
npm link
```

## 📚 Examples & Documentation

- **[Complete Examples](mcp-project-manager/EXAMPLES.md)** - Real-world usage patterns
- **[Project Manager README](mcp-project-manager/README.md)** - Detailed documentation

## 🔄 Migration from Global Setup

Already have global MCP servers? Migrate easily:

```bash
cd your-existing-project
mcp-migrate --from-global
```

This will:
1. Detect your current global MCP configurations
2. Create project-specific versions with the same servers
3. Generate IDE configurations
4. Create environment variable templates

## 🐛 Troubleshooting

### Common Issues

**"Project not initialized" error**
```bash
mcp-init  # Run in your project directory first
```

**IDE not detecting servers**
```bash
mcp-sync  # Regenerate and sync configurations
# Then restart your IDE
```

**Environment variables not working**
```bash
cp .mcp/.env .env    # Copy template to project root
vim .env             # Add your actual API keys
mcp-sync             # Update configurations
```

**Claude Code servers not appearing**
```bash
# Ensure Claude Code CLI is installed
npm install -g @anthropic-ai/claude-cli

# Run the setup script
./.mcp/claude-code-setup.sh
```

## 📋 Requirements

- **Node.js 18+** and npm
- **macOS** (paths configured for macOS)
- One or more supported IDEs

## 📄 License

MIT License - see mcp-project-manager/LICENSE for details.

---

**🎯 Ready to get started?** Run the installation script and create your first project-specific MCP configuration!