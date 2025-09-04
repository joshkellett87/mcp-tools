# 🚀 MCP Project Manager - Quick Reference

## One-Time Setup
```bash
# Install the tool
chmod +x ~/Documents/mcp-tools/install-project-manager.sh
~/Documents/mcp-tools/install-project-manager.sh
```

## For Every New Project

### Option 1: Super Easy (Recommended) 🧙‍♂️
```bash
cd your-project
mcp-setup
```
**Just answer 2 questions and you're done!**

### Option 2: Manual Control 🔧
```bash
cd your-project
mcp-init  # Interactive setup with full control
```

## Managing Existing Projects

```bash
# See what's configured
mcp-list

# Add more servers
mcp-add github playwright

# Remove servers
mcp-remove webflow n8n

# Update IDE configurations
mcp-sync

# Add new IDE to existing project
mcp-sync --ides warp
```

## Project Types & Bundles

| Project Type | Command | Includes |
|-------------|---------|----------|
| **Web Development** | `--bundle web-dev` | filesystem, reasoning, GitHub, search, browser automation |
| **Research/Docs** | `--bundle research` | filesystem, reasoning, search, docs, GitHub |
| **Automation** | `--bundle automation` | filesystem, reasoning, n8n, Webflow |
| **Basic/Learning** | `--bundle essential` | filesystem, reasoning only |

## IDE Support

| IDE | Auto-Detected | Configuration |
|-----|---------------|---------------|
| **Cursor** | ✅ Yes | `.mcp/cursor.json` |
| **Windsurf** | ✅ Yes | `.mcp/windsurf.json` |
| **Claude Code** | ✅ Yes | `.mcp/claude-code-setup.sh` |
| **Claude Desktop** | ✅ Yes | `.mcp/claude-desktop.json` |
| **Warp** | ✅ Yes | `.mcp/warp.json` |

## API Keys Setup

Some servers need API keys:

1. **Copy template:** `cp .mcp/.env .env`
2. **Edit .env file with your keys**
3. **Apply changes:** `mcp-sync`

### Required Keys:
- **GitHub:** Get from https://github.com/settings/tokens
- **n8n:** Your n8n API key + base URL
- **Webflow:** Get from https://webflow.com/dashboard/account/apps

## File Structure
```
your-project/
├── .mcp/                    # MCP configuration
│   ├── config.json          # Project settings
│   ├── cursor.json          # IDE configs
│   ├── windsurf.json
│   └── .env                 # API keys template
├── .env                     # Your actual API keys
└── ...your code
```

## Team Collaboration

```bash
# Setup project for team
mcp-setup
git add .mcp/
git commit -m "Add MCP configuration"

# Team members clone and:
git clone your-repo
cd your-repo
cp .mcp/.env .env  # Add their API keys
mcp-sync           # Configure their IDEs
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| IDE not showing MCP | Restart IDE after running `mcp-sync` |
| "Project not initialized" | Run `mcp-setup` or `mcp-init` first |
| Environment variables not working | Check `.env` exists and run `mcp-sync` |
| Command not found | Re-run the installation script |

## Help Commands

- `mcp-list` - Show current configuration
- `mcp-list --available` - Show all possible servers
- `mcp-list --bundles` - Show pre-made bundles

---

**💡 Pro Tip:** Start with `mcp-setup` - it's designed to get you up and running in 30 seconds with zero technical knowledge required!