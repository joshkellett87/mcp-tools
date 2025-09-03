# MCP Tools - Complete Setup Package

This repository contains everything needed to install and configure Model Context Protocol (MCP) servers across multiple IDEs and development tools.

## 📁 Directory Structure

```
MCP Tools/
├── configs/                    # Configuration files for each IDE/CLI
│   ├── cursor-config.json      # Cursor IDE configuration
│   ├── windsurf-config.json    # Windsurf editor configuration
│   ├── claude-desktop-config.json # Claude Desktop configuration
│   ├── claude-code-config.txt  # Claude Code CLI commands
│   ├── warp-config.json        # Warp terminal configuration
│   └── vscode-config.json      # VS Code configuration
├── scripts/                    # Automation scripts
│   ├── install-mcp-servers.sh  # Installs all MCP servers globally
│   └── setup-mcp-clients.md    # LLM-executable setup instructions
├── .env                        # Environment variables template (created during setup)
└── README.md                   # This file
```

## 🚀 Quick Start

### For LLMs/AI Agents
Direct the LLM to read and execute: `~/Documents/MCP Tools/scripts/setup-mcp-clients.md`

This file contains complete, step-by-step instructions that an LLM can follow to:
1. Detect installed applications
2. Install all MCP servers
3. Configure each application
4. Verify the setup

### For Manual Installation
```bash
# Make script executable
chmod +x ~/Documents/"MCP Tools"/scripts/install-mcp-servers.sh

# Run installation
~/Documents/"MCP Tools"/scripts/install-mcp-servers.sh
```

## 📦 Included MCP Servers

This package includes configuration for 8 MCP servers:

| Server | Purpose | Package Name | Version |
|--------|---------|--------------|---------|
| **Playwright** | Browser automation | `@playwright/mcp` | 0.0.36 |
| **Filesystem** | File system operations | `@modelcontextprotocol/server-filesystem` | 2025.8.21 |
| **GitHub** | GitHub integration | `@modelcontextprotocol/server-github` | 2025.4.8 |
| **Sequential Thinking** | Reasoning capabilities | `@modelcontextprotocol/server-sequential-thinking` | 2025.7.1 |
| **DuckDuckGo** | Web search | `duckduckgo-mcp-server` | 0.1.2 |
| **n8n** | Workflow automation | `n8n-mcp` | 2.10.6 |
| **Ref Tools** | Reference tools | `ref-tools-mcp` | 3.0.0 |
| **Webflow** | Webflow integration | `webflow-mcp-server` | 0.7.0 |

## 🛠️ Supported Applications

Configuration files are provided for:

- **Cursor** - AI-powered code editor
- **Windsurf** - Next-generation IDE
- **VS Code** - Via Continue extension
- **Claude Desktop** - Anthropic's desktop application
- **Claude Code CLI** - Command-line interface
- **Warp** - AI-powered terminal

## 📋 Prerequisites

- **Node.js** 18 or newer
- **npm** package manager
- **macOS** (paths are configured for macOS)

## 🔑 API Keys Required

Some MCP servers require API keys to function:

1. **GitHub MCP Server**
   - Get token from: https://github.com/settings/tokens
   - Set: `GITHUB_TOKEN`

2. **n8n MCP Server**
   - Set: `N8N_API_KEY` and `N8N_BASE_URL`

3. **Webflow MCP Server**
   - Get token from: https://webflow.com/dashboard/account/apps
   - Set: `WEBFLOW_API_TOKEN`

## 📝 File Descriptions

### Configuration Files (`/configs`)

Each JSON configuration file contains the complete MCP server setup for its respective application. These files:
- Define how to launch each MCP server
- Include environment variable placeholders for API keys
- Use `npx` commands for portability

### Installation Script (`/scripts/install-mcp-servers.sh`)

A bash script that:
- Checks for Node.js/npm prerequisites
- Installs all 8 MCP servers globally
- Installs Playwright browser binaries
- Provides installation summary

### LLM Setup Instructions (`/scripts/setup-mcp-clients.md`)

Comprehensive markdown document designed for LLM execution containing:
- Detection commands for each supported application
- Installation procedures (using the script or manual commands)
- Configuration steps for each detected application
- Verification commands
- Troubleshooting guide

## 🔧 Manual Configuration

If automatic setup fails, manually copy the appropriate config file to:

| Application | Configuration Path |
|-------------|-------------------|
| Cursor | `~/Library/Application Support/Cursor/User/mcp.json` |
| Windsurf | `~/Library/Application Support/windsurf/mcp_settings.json` |
| VS Code | `~/.continue/config.json` |
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Warp | `~/.warp/mcp_config.json` |

## ✅ Verification

After installation, verify MCP servers are working:

```bash
# Check installed servers
npm list -g --depth=0 | grep -E "(mcp|MCP)"

# Test Playwright MCP
npx @playwright/mcp --version

# Check configurations
ls -la ~/Library/Application\ Support/*/mcp*.json
```

## 🐛 Troubleshooting

### Common Issues

1. **"Command not found" errors**
   - Ensure Node.js and npm are installed
   - Check npm prefix: `npm config get prefix`

2. **Permission errors**
   - Never use `sudo` with npm global installs
   - Check npm directory ownership

3. **Application config not found**
   - Open the application at least once before configuring
   - Some apps create config directories on first launch

4. **MCP servers not appearing in IDE**
   - Restart the application after configuration
   - Check the application's MCP/AI settings panel

### Getting Help

1. Check the troubleshooting section in `setup-mcp-clients.md`
2. Verify Node.js version: `node --version` (should be 18+)
3. Review application-specific MCP documentation

## 🔄 Updates

To update MCP servers to latest versions:

```bash
# Update all servers
npm update -g @playwright/mcp @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-github @modelcontextprotocol/server-sequential-thinking duckduckgo-mcp-server n8n-mcp ref-tools-mcp webflow-mcp-server

# Or reinstall with latest
npm install -g @playwright/mcp@latest
```

## 📚 Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)

## 📄 License

Configuration files and scripts in this package are provided as-is for personal use.

---

**Created by**: MCP Tools Setup Script  
**Last Updated**: 2025
