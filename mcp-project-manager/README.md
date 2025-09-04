# MCP Project Manager

A project-specific MCP (Model Context Protocol) server management tool that works across multiple IDEs including Cursor, Windsurf, Claude Code, and Warp.

## Features

- 🚀 **Project-specific configuration** - No more global server pollution
- 🎯 **Interactive server selection** - Choose exactly what you need
- 📦 **Predefined bundles** - Quick setup for common use cases
- 🔄 **Multi-IDE support** - Works with Cursor, Windsurf, Claude Code, Warp
- 🛠️ **Easy management** - Add, remove, and sync servers with simple commands
- 🔐 **Environment management** - Secure API key handling per project
- 📋 **Migration tool** - Convert from global to project-specific setup

## Installation

```bash
cd /Users/joshkellett/Documents/mcp-tools/mcp-project-manager
npm install
npm run build
npm link
```

## Quick Start

### Initialize a new project

```bash
# Interactive setup
mcp-init

# Non-interactive with bundle
mcp-init --bundle web-dev --ides cursor,windsurf

# Minimal setup
mcp-init --bundle essential --no-interactive
```

### Available Server Bundles

- **essential** - Core servers (filesystem, sequential-thinking)
- **web-dev** - Web development (+ github, duckduckgo, playwright)
- **automation** - Workflow automation (+ n8n, webflow)
- **research** - Research tools (+ duckduckgo, ref-tools, github)
- **full** - All available servers

### Manage servers

```bash
# Add servers to current project
mcp-add github playwright

# Remove servers
mcp-remove webflow n8n

# List project servers
mcp-list

# List all available servers
mcp-list --available

# List server bundles
mcp-list --bundles
```

### Sync configurations

```bash
# Sync all configured IDEs
mcp-sync

# Sync specific IDEs
mcp-sync --ides cursor,windsurf
```

### Migrate from global setup

```bash
# Convert global MCP setup to project-specific
mcp-migrate --from-global
```

## Project Structure

When you initialize a project, the following structure is created:

```
your-project/
├── .mcp/
│   ├── config.json          # Project configuration
│   ├── .env                 # Environment variables template
│   ├── cursor.json          # Cursor-specific config
│   ├── windsurf.json        # Windsurf-specific config
│   ├── claude-desktop.json  # Claude Desktop config
│   ├── warp.json           # Warp-specific config
│   └── claude-code-setup.sh # Claude Code setup script
├── package.json            # With MCP servers as devDependencies
└── .gitignore             # Ignores sensitive files
```

## Environment Variables

Some MCP servers require API keys. The tool automatically creates a `.env` template in the `.mcp/` directory:

```bash
# GitHub API Token
GITHUB_TOKEN=your_token_here

# n8n Configuration
N8N_API_KEY=your_key_here
N8N_BASE_URL=https://your-n8n-instance.com

# Webflow API Token
WEBFLOW_API_TOKEN=your_token_here
```

Copy this file to your project root and fill in the actual values.

## Available MCP Servers

### Core Servers
- **filesystem** - File system operations and management
- **sequential-thinking** - Advanced reasoning and problem-solving

### Integration Servers
- **github** - GitHub integration (requires GITHUB_TOKEN)
- **duckduckgo** - Web search capabilities
- **ref-tools** - Reference and documentation tools

### Specialized Servers
- **playwright** - Browser automation and testing
- **n8n** - Workflow automation (requires N8N_API_KEY, N8N_BASE_URL)
- **webflow** - Webflow CMS management (requires WEBFLOW_API_TOKEN)

## IDE Configuration

The tool automatically configures the following IDEs:

- **Cursor** - `~/.cursor/mcp.json`
- **Windsurf** - `~/.codeium/windsurf/mcp_config.json`
- **Claude Desktop** - `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Warp** - `~/.warp/mcp_config.json`
- **Claude Code** - Via `claude mcp add` commands

## Commands Reference

### `mcp-init`
Initialize MCP configuration for a project.

Options:
- `-n, --name <name>` - Project name
- `-b, --bundle <bundle>` - Use predefined server bundle
- `-i, --ides <ides>` - Comma-separated list of IDEs
- `--no-interactive` - Skip interactive prompts

### `mcp-add <servers...>`
Add MCP servers to the current project.

Options:
- `-e, --env <env>` - Environment variables as key=value pairs

### `mcp-remove <servers...>`
Remove MCP servers from the current project.

### `mcp-list`
List configured servers and project information.

Options:
- `-a, --available` - Show all available servers
- `-b, --bundles` - Show available server bundles

### `mcp-sync`
Synchronize IDE configurations with current project setup.

Options:
- `-i, --ides <ides>` - Comma-separated list of IDEs to sync

### `mcp-migrate`
Migrate from global to project-specific MCP setup.

Options:
- `--from-global` - Migrate from existing global configuration

## Best Practices

1. **Start with a bundle** - Use predefined bundles for quick setup
2. **Keep API keys secure** - Use the `.env` file and add it to `.gitignore`
3. **Version control configs** - Commit `.mcp/` directory (except `.env`) to share with team
4. **Regular syncing** - Run `mcp-sync` after adding new IDEs or changing configurations
5. **Environment-specific configs** - Use different configurations for development/staging/production

## Migration from Global Setup

If you have existing global MCP configurations, use the migration tool:

```bash
cd your-project
mcp-migrate --from-global
```

This will:
1. Detect your current global configurations
2. Create project-specific configurations
3. Generate IDE configs with the same servers
4. Create environment variable templates

## Troubleshooting

### "Project not initialized" error
Run `mcp-init` in your project directory first.

### IDE not detecting servers
1. Restart your IDE after configuration
2. Check that the IDE config directory exists
3. Run `mcp-sync` to regenerate configurations

### Environment variables not working
1. Copy `.mcp/.env` to your project root
2. Fill in actual API key values
3. Run `mcp-sync` to update configurations

### Claude Code servers not appearing
1. Ensure Claude Code CLI is installed: `npm install -g @anthropic-ai/claude-cli`
2. Check server status: `claude mcp list`
3. Run the setup script: `./.mcp/claude-code-setup.sh`

## Contributing

This tool is part of the MCP Tools ecosystem. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.