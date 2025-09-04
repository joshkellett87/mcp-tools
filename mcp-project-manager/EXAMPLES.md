# MCP Project Manager - Usage Examples

## Basic Project Setup

### Web Development Project
```bash
# Create a new web development project
mkdir my-web-app && cd my-web-app
mcp-init --bundle web-dev --ides cursor,windsurf

# This sets up:
# - filesystem, sequential-thinking (core)
# - github, duckduckgo, playwright (web-dev specific)
# - Configurations for Cursor and Windsurf
```

### Research Project
```bash
# Set up a research-focused project
mkdir research-project && cd research-project
mcp-init --bundle research

# Interactive selection will show:
# - filesystem, sequential-thinking (core)
# - duckduckgo, ref-tools, github (research tools)
```

### Custom Server Selection
```bash
# Start a project with custom server selection
mkdir custom-project && cd custom-project
mcp-init

# Follow the interactive prompts to:
# 1. Choose selection method (bundle/individual/essential)
# 2. Select specific servers if choosing individual
# 3. Choose IDEs to configure
```

## Managing Servers

### Adding Servers to Existing Project
```bash
# Add automation capabilities to existing project
mcp-add n8n webflow

# Add browser automation
mcp-add playwright
```

### Removing Unnecessary Servers
```bash
# Remove servers you no longer need
mcp-remove webflow n8n

# Check what's configured
mcp-list
```

### Environment Variables
```bash
# After adding servers that require API keys
ls .mcp/
# Shows: .env (template with required variables)

# Copy template to project root and fill in values
cp .mcp/.env .env
vim .env  # Add your actual API keys

# Sync configurations to apply environment variables
mcp-sync
```

## IDE Configuration

### Multi-IDE Setup
```bash
# Configure for multiple IDEs at once
mcp-init --bundle web-dev --ides cursor,windsurf,warp

# Add new IDE to existing project
mcp-sync --ides claude-code
```

### IDE-Specific Configurations
Each IDE gets its own configuration file in `.mcp/`:

- `cursor.json` - For Cursor IDE
- `windsurf.json` - For Windsurf
- `claude-desktop.json` - For Claude Desktop
- `warp.json` - For Warp terminal
- `claude-code-setup.sh` - Script for Claude Code CLI

## Team Collaboration

### Sharing Project Configuration
```bash
# In your project
mcp-init --bundle web-dev

# Add .mcp/ to version control (except .env)
echo ".mcp/.env" >> .gitignore
git add .mcp/
git commit -m "Add MCP configuration"

# Team members can then:
git clone your-repo
cd your-repo
cp .mcp/.env .env  # Copy and fill in their API keys
mcp-sync  # Apply configuration to their IDEs
```

### Environment-Specific Configurations
```bash
# Development environment
cp .mcp/.env .env.development
# Fill with dev API keys

# Production environment  
cp .mcp/.env .env.production
# Fill with prod API keys

# Use different env files as needed
```

## Migration from Global Setup

### Full Migration
```bash
# In existing project with global MCP setup
mcp-migrate --from-global

# This will:
# 1. Detect current global configurations
# 2. Create project-specific versions
# 3. Generate IDE configs
# 4. Create environment templates
```

### Selective Migration
```bash
# Start fresh but reference global setup
mcp-list --available  # See what's available
mcp-init  # Choose servers individually

# Or create custom bundle based on global setup
mcp-add github duckduckgo playwright  # Add servers you had globally
```

## Advanced Usage

### Custom Server Bundles
You can extend the available bundles by modifying the constants:

```typescript
// In your fork/extension
export const CUSTOM_BUNDLES: ServerBundle[] = [
  {
    name: 'data-science',
    description: 'Data science and analysis tools',
    servers: ['filesystem', 'sequential-thinking', 'github', 'duckduckgo'],
    category: 'specialized'
  }
];
```

### Project Templates
Create project templates that include MCP configuration:

```bash
# Create a template directory
mkdir project-templates/web-app-template

# Set up MCP configuration
cd project-templates/web-app-template
mcp-init --bundle web-dev --no-interactive

# Add other template files
echo "# Web App Template" > README.md
# Add package.json, etc.

# Use template for new projects
cp -r project-templates/web-app-template new-project
cd new-project
mcp-sync  # Apply to your IDEs
```

### Scripted Setup
```bash
#!/bin/bash
# setup-new-project.sh

PROJECT_NAME=$1
PROJECT_TYPE=${2:-web-dev}

mkdir "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize with specified bundle
mcp-init --bundle "$PROJECT_TYPE" --no-interactive

# Copy environment template
cp .mcp/.env .env

echo "Project $PROJECT_NAME created with $PROJECT_TYPE MCP configuration"
echo "Edit .env to add your API keys, then run 'mcp-sync'"
```

## Troubleshooting Examples

### Fixing IDE Detection Issues
```bash
# Check which IDEs are detected
mcp-list

# If an IDE isn't detected, ensure it's installed:
ls /Applications/Cursor.app     # Check Cursor
ls /Applications/Windsurf.app   # Check Windsurf
claude --version                # Check Claude Code CLI

# Force sync for specific IDE
mcp-sync --ides cursor
```

### Environment Variable Issues
```bash
# Check current configuration
cat .mcp/config.json

# Verify environment variables are loaded
cat .env

# Regenerate configurations with current environment
mcp-sync

# Test specific server configuration
cat .mcp/cursor.json | jq '.mcpServers.github'
```

### Server Installation Issues
```bash
# Check if servers are installed globally (from old setup)
npm list -g --depth=0 | grep mcp

# Check project package.json
cat package.json | jq '.devDependencies'

# Force refresh configurations
mcp-sync
```

## Best Practices Examples

### 1. Start Small, Grow As Needed
```bash
# Begin with essentials
mcp-init --bundle essential

# Add servers as you need them
mcp-add github      # When you need Git integration
mcp-add playwright  # When you need browser testing
```

### 2. Environment-Specific Configuration
```bash
# Use different API keys per environment
echo "GITHUB_TOKEN=dev_token_here" > .env.dev
echo "GITHUB_TOKEN=prod_token_here" > .env.prod

# Switch environments by copying appropriate .env
cp .env.dev .env  # For development
mcp-sync
```

### 3. Team Onboarding
```bash
# Create team onboarding script
cat > onboard.sh << 'EOF'
#!/bin/bash
echo "Setting up MCP for new team member..."

# Copy environment template
cp .mcp/.env .env
echo "Please edit .env with your API keys"

# Configure IDEs
mcp-sync

echo "MCP setup complete! Check your IDE for new capabilities."
EOF

chmod +x onboard.sh
```

This examples file shows practical usage patterns for the MCP Project Manager across different scenarios and team setups.