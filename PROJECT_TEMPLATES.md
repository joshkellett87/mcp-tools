# 📋 Project Templates for MCP Setup

**Pre-configured MCP setups for common project types**

This file contains ready-to-use templates that provide instant MCP configuration for different project scenarios. Each template includes specific servers, IDE configurations, and environment setup.

## 🎯 How to Use Templates

1. **Copy the command** for your project type
2. **Replace placeholders** (project name, IDE preferences)
3. **Run the command** in your desired directory
4. **Follow the environment setup** if needed

---

## 🌐 Web Development Templates

### React/Next.js Web App
```bash
# Full web development stack with browser testing
mkdir my-react-app && cd my-react-app
mcp-init --bundle web-dev --name "My React App" --ides cursor,windsurf --no-interactive

# Creates: filesystem, sequential-thinking, github, duckduckgo, playwright
# Perfect for: React, Next.js, Vue, Angular projects
```

**Includes capabilities for:**
- 📁 File management and project structure
- 🧠 Code reasoning and problem-solving
- 🐙 GitHub repository integration
- 🔍 Web search for documentation
- 🎭 Browser automation and testing

### Simple Website/Portfolio
```bash
# Minimal setup for basic web projects
mkdir my-portfolio && cd my-portfolio
mcp-init --bundle essential --name "My Portfolio" --ides cursor --no-interactive

# Creates: filesystem, sequential-thinking
# Perfect for: Static sites, portfolios, simple HTML/CSS projects
```

**Includes capabilities for:**
- 📁 Basic file operations
- 🧠 Code assistance and reasoning

---

## 📚 Research & Documentation Templates

### Academic Research Project
```bash
# Research with documentation and GitHub integration
mkdir research-project && cd research-project
mcp-init --bundle research --name "Research Project" --ides cursor,claude-desktop --no-interactive

# Creates: filesystem, sequential-thinking, duckduckgo, ref-tools, github
# Perfect for: Academic research, documentation projects, literature reviews
```

**Includes capabilities for:**
- 📁 File and document management
- 🧠 Advanced reasoning for analysis
- 🔍 Web search for research
- 📖 Reference and documentation tools
- 🐙 GitHub for collaboration and version control

### Technical Writing Project
```bash
# Documentation-focused setup
mkdir tech-docs && cd tech-docs
mcp-init --name "Technical Documentation" --ides cursor,windsurf --no-interactive
# Then interactively select: filesystem, sequential-thinking, ref-tools, duckduckgo

# Perfect for: Technical documentation, API docs, user guides
```

**Includes capabilities for:**
- 📁 Document file management
- 🧠 Writing assistance and structure
- 📖 Reference management
- 🔍 Research capabilities

---

## 🤖 Automation & Integration Templates

### Workflow Automation Project
```bash
# Business automation with n8n and Webflow
mkdir automation-project && cd automation-project
mcp-init --bundle automation --name "Automation Hub" --ides cursor,warp --no-interactive

# Creates: filesystem, sequential-thinking, n8n, webflow
# Perfect for: Business process automation, CMS management, workflow tools
```

**Requires environment setup:**
```bash
# After running the above, set up API keys
cp .mcp/.env .env
# Edit .env to add:
# N8N_API_KEY=your_n8n_key
# N8N_BASE_URL=https://your-n8n-instance.com
# WEBFLOW_API_TOKEN=your_webflow_token
mcp-sync
```

### Data Processing Pipeline
```bash
# Custom setup for data work
mkdir data-pipeline && cd data-pipeline
mcp-init --name "Data Pipeline" --ides cursor,claude-code --no-interactive
# Then interactively select: filesystem, sequential-thinking, github, duckduckgo

# Perfect for: Data processing, ETL pipelines, analysis scripts
```

---

## 🏢 Team & Enterprise Templates

### Team Development Project
```bash
# Full-featured team setup
mkdir team-project && cd team-project
mcp-init --bundle web-dev --name "Team Project" --ides cursor,windsurf,claude-code --no-interactive

# Setup for team collaboration
echo ".mcp/.env" >> .gitignore
git init
git add .mcp/ .gitignore
git commit -m "Initial MCP configuration"

# Team members then run:
# git clone <repo>
# cp .mcp/.env .env (and fill in their API keys)
# mcp-sync
```

### Client Project Template
```bash
# Professional client work setup
mkdir client-project && cd client-project
mcp-init --bundle full --name "Client Project" --ides cursor,windsurf --no-interactive

# Creates: All available servers for maximum flexibility
# Perfect for: Client work where requirements may change
```

---

## 🎓 Learning & Tutorial Templates

### Coding Tutorial/Course
```bash
# Educational content creation
mkdir coding-course && cd coding-course
mcp-init --bundle research --name "Coding Course" --ides cursor,claude-desktop --no-interactive

# Perfect for: Creating tutorials, course content, educational materials
```

### Practice/Playground Project
```bash
# Minimal setup for experimentation
mkdir playground && cd playground
mcp-init --bundle essential --name "Playground" --ides cursor --no-interactive

# Perfect for: Learning new technologies, quick experiments, prototypes
```

---

## 🔧 Specialized Templates

### API Development
```bash
# Backend API development
mkdir api-project && cd api-project
mcp-init --name "API Project" --ides cursor,warp --no-interactive
# Select: filesystem, sequential-thinking, github, duckduckgo, playwright

# Perfect for: REST APIs, GraphQL, microservices
```

### Mobile App Development
```bash
# React Native or mobile development
mkdir mobile-app && cd mobile-app
mcp-init --bundle web-dev --name "Mobile App" --ides cursor,windsurf --no-interactive

# Perfect for: React Native, Flutter, mobile development
```

### DevOps/Infrastructure
```bash
# Infrastructure and deployment
mkdir devops-project && cd devops-project
mcp-init --name "DevOps Project" --ides cursor,warp,claude-code --no-interactive
# Select: filesystem, sequential-thinking, github

# Perfect for: Docker, Kubernetes, CI/CD, infrastructure as code
```

---

## 🔄 Migration Templates

### From Global MCP Setup
```bash
# Convert existing project with global MCP
cd existing-project
mcp-migrate --from-global

# This automatically detects your global setup and creates project-specific configs
```

### Upgrade Existing Project
```bash
# Add MCP to existing project
cd existing-project
mcp-init --bundle web-dev --ides cursor,windsurf

# Adds MCP configuration to existing codebase
```

---

## 🎨 Custom Template Creation

### Create Your Own Template

1. **Set up a reference project:**
```bash
mkdir template-project && cd template-project
mcp-init --bundle web-dev --ides cursor,windsurf
# Customize as needed
```

2. **Save as template:**
```bash
# Copy your configured .mcp/ directory
cp -r .mcp/ ~/my-mcp-templates/web-dev-template/
```

3. **Use your template:**
```bash
# For new projects
mkdir new-project && cd new-project
cp -r ~/my-mcp-templates/web-dev-template/.mcp/ .
mcp-sync
```

---

## 📊 Template Comparison

| Template | Servers | Best For | Complexity |
|----------|---------|----------|------------|
| **Simple Website** | 2 servers | Static sites, portfolios | ⭐ Beginner |
| **Web Development** | 5 servers | React, Vue, full-stack | ⭐⭐ Intermediate |
| **Research Project** | 5 servers | Academic, documentation | ⭐⭐ Intermediate |
| **Automation** | 4 servers | Business processes | ⭐⭐⭐ Advanced |
| **Team Project** | 5+ servers | Collaborative development | ⭐⭐⭐ Advanced |
| **Full Setup** | 8 servers | Maximum flexibility | ⭐⭐⭐⭐ Expert |

---

## 💡 Template Selection Guide

**New to MCP?** Start with **Simple Website** or **Essential** template

**Building a web app?** Use **React/Next.js Web App** template

**Academic work?** Use **Academic Research Project** template

**Team collaboration?** Use **Team Development Project** template

**Not sure?** Use **Interactive setup** with `mcp-init` (no bundle specified)

**Need everything?** Use **Client Project Template** with full bundle

These templates eliminate the guesswork and provide instant, production-ready MCP configurations for any project type.