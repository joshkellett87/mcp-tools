import { MCPServer, IDEConfig, ServerBundle } from './types.js';
import path from 'path';
import os from 'os';

export const MCP_SERVERS: MCPServer[] = [
  {
    name: 'filesystem',
    package: '@modelcontextprotocol/server-filesystem',
    version: '2025.8.21',
    description: 'File system operations and management',
    category: 'core'
  },
  {
    name: 'sequential-thinking',
    package: '@modelcontextprotocol/server-sequential-thinking',
    version: '2025.7.1',
    description: 'Advanced reasoning and problem-solving capabilities',
    category: 'core'
  },
  {
    name: 'github',
    package: '@modelcontextprotocol/server-github',
    version: '2025.4.8',
    description: 'GitHub integration for repositories and issues',
    category: 'integration',
    requiredEnv: ['GITHUB_TOKEN']
  },
  {
    name: 'duckduckgo',
    package: 'duckduckgo-mcp-server',
    version: '0.1.2',
    description: 'Web search capabilities via DuckDuckGo',
    category: 'integration'
  },
  {
    name: 'context7',
    package: '@upstash/context7-mcp',
    version: 'latest',
    description: 'Up-to-date code documentation and examples for LLMs',
    category: 'integration'
  },
  {
    name: 'playwright',
    package: '@playwright/mcp',
    version: '0.0.36',
    description: 'Browser automation and web testing',
    category: 'specialized'
  },
  {
    name: 'n8n',
    package: 'n8n-mcp',
    version: '2.10.6',
    description: 'Workflow automation platform',
    category: 'specialized',
    requiredEnv: ['N8N_API_KEY', 'N8N_BASE_URL']
  },
  {
    name: 'webflow',
    package: 'webflow-mcp-server',
    version: '0.7.0',
    description: 'Webflow CMS and site management',
    category: 'specialized',
    requiredEnv: ['WEBFLOW_API_TOKEN']
  },
  {
    name: 'crawl4ai-rag',
    package: 'mcp-crawl4ai-rag',
    version: 'latest',
    description: 'Web crawling and RAG with vector database storage',
    category: 'specialized',
    requiredEnv: ['OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
    optionalEnv: ['NEO4J_URI', 'NEO4J_USERNAME', 'NEO4J_PASSWORD']
  }
];

export const IDE_CONFIGS: IDEConfig[] = [
  {
    name: 'cursor',
    configPath: path.join(os.homedir(), '.cursor', 'mcp.json'),
    configFormat: 'json',
    templateName: 'cursor.json',
    supportsProjectConfig: true
  },
  {
    name: 'windsurf',
    configPath: path.join(os.homedir(), '.codeium', 'windsurf', 'mcp_config.json'),
    configFormat: 'json',
    templateName: 'windsurf.json',
    supportsProjectConfig: true
  },
  {
    name: 'claude-desktop',
    configPath: path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
    configFormat: 'json',
    templateName: 'claude-desktop.json',
    supportsProjectConfig: false
  },
  {
    name: 'claude-code',
    configPath: '',
    configFormat: 'txt',
    templateName: 'claude-code.txt',
    supportsProjectConfig: true
  },
  {
    name: 'warp',
    configPath: path.join(os.homedir(), '.warp', 'mcp_config.json'),
    configFormat: 'json',
    templateName: 'warp.json',
    supportsProjectConfig: true
  }
];

export const SERVER_BUNDLES: ServerBundle[] = [
  {
    name: 'essential',
    description: 'Core servers for basic functionality',
    servers: ['filesystem', 'sequential-thinking'],
    category: 'core'
  },
  {
    name: 'web-dev',
    description: 'Web development with GitHub, search, documentation, and browser automation',
    servers: ['filesystem', 'sequential-thinking', 'github', 'duckduckgo', 'context7', 'playwright'],
    category: 'development'
  },
  {
    name: 'automation',
    description: 'Workflow automation and integration tools',
    servers: ['filesystem', 'sequential-thinking', 'n8n', 'webflow'],
    category: 'automation'
  },
  {
    name: 'research',
    description: 'Research and documentation tools',
    servers: ['filesystem', 'sequential-thinking', 'duckduckgo', 'context7', 'github'],
    category: 'research'
  },
  {
    name: 'ai-rag',
    description: 'AI development with documentation and RAG capabilities',
    servers: ['filesystem', 'sequential-thinking', 'context7', 'crawl4ai-rag', 'github'],
    category: 'ai'
  },
  {
    name: 'full',
    description: 'All available MCP servers',
    servers: ['filesystem', 'sequential-thinking', 'github', 'duckduckgo', 'context7', 'playwright', 'n8n', 'webflow', 'crawl4ai-rag'],
    category: 'comprehensive'
  }
];

export const PROJECT_CONFIG_DIR = '.mcp';
export const PROJECT_CONFIG_FILE = 'config.json';
export const PROJECT_ENV_FILE = '.env';