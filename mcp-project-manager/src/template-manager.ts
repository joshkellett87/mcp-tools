import fs from 'fs-extra';
import path from 'path';
import Mustache from 'mustache';
import { ProjectConfig, MCPConfig } from './types.js';
import { MCP_SERVERS } from './constants.js';

export class TemplateManager {
  private templatesDir: string;

  constructor() {
    this.templatesDir = path.join(__dirname, 'templates');
  }

  async generateConfig(templateName: string, config: ProjectConfig, envVars?: { [key: string]: string }): Promise<string> {
    const templatePath = path.join(this.templatesDir, templateName);
    
    if (!await fs.pathExists(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const template = await fs.readFile(templatePath, 'utf8');
    const data = this.buildTemplateData(config, envVars);

    return Mustache.render(template, data);
  }

  async generateMCPConfig(config: ProjectConfig, envVars?: { [key: string]: string }): Promise<MCPConfig> {
    const mcpConfig: MCPConfig = {
      mcpServers: {}
    };

    config.servers.forEach(serverName => {
      const server = MCP_SERVERS.find(s => s.name === serverName);
      if (!server) {
        console.warn(`Warning: Unknown server ${serverName}`);
        return;
      }

      const serverConfig: any = {
        command: 'npx',
        args: [`${server.package}@${server.version}`]
      };

      // Add environment variables if required and available
      if (server.requiredEnv && envVars) {
        const env: { [key: string]: string } = {};
        let hasAllRequired = true;

        server.requiredEnv.forEach(envKey => {
          if (envVars[envKey]) {
            env[envKey] = envVars[envKey];
          } else {
            hasAllRequired = false;
          }
        });

        if (hasAllRequired && Object.keys(env).length > 0) {
          serverConfig.env = env;
        }
      }

      mcpConfig.mcpServers[serverName] = serverConfig;
    });

    return mcpConfig;
  }

  private buildTemplateData(config: ProjectConfig, envVars?: { [key: string]: string }) {
    const servers = config.servers.map(serverName => {
      const server = MCP_SERVERS.find(s => s.name === serverName);
      return {
        name: serverName,
        package: server?.package,
        version: server?.version,
        description: server?.description,
        hasEnv: server?.requiredEnv && server.requiredEnv.length > 0,
        requiredEnv: server?.requiredEnv || [],
        envVars: server?.requiredEnv?.reduce((acc, envKey) => {
          if (envVars?.[envKey]) {
            acc[envKey] = envVars[envKey];
          }
          return acc;
        }, {} as { [key: string]: string }) || {}
      };
    });

    return {
      projectName: config.name,
      servers,
      ides: config.ides,
      created: config.created,
      updated: config.updated,
      hasEnvVars: servers.some(s => s.hasEnv),
      envVars: envVars || {}
    };
  }

  async createTemplates(): Promise<void> {
    await fs.ensureDir(this.templatesDir);

    // Cursor template
    await this.createCursorTemplate();
    
    // Windsurf template
    await this.createWindsurfTemplate();
    
    // Claude Desktop template
    await this.createClaudeDesktopTemplate();
    
    // Warp template
    await this.createWarpTemplate();
    
    // Claude Code template
    await this.createClaudeCodeTemplate();
  }

  private async createCursorTemplate(): Promise<void> {
    const template = `{
  "mcpServers": {
{{#servers}}
    "{{name}}": {
      "command": "npx",
      "args": ["{{package}}@{{version}}"]{{#hasEnv}},
      "env": {
{{#requiredEnv}}
        "{{.}}": "{{#envVars}}{{.}}{{/envVars}}{{^envVars}}{{#../../envVars}}{{.}}{{/../../envVars}}{{/envVars}}"{{#unless @last}},{{/unless}}
{{/requiredEnv}}
      }{{/hasEnv}}
    }{{#unless @last}},{{/unless}}
{{/servers}}
  }
}`;

    await fs.writeFile(path.join(this.templatesDir, 'cursor.json'), template);
  }

  private async createWindsurfTemplate(): Promise<void> {
    const template = `{
  "mcpServers": {
{{#servers}}
    "{{name}}": {
      "command": "npx",
      "args": ["{{package}}@{{version}}"]{{#hasEnv}},
      "env": {
{{#requiredEnv}}
        "{{.}}": "{{#envVars}}{{.}}{{/envVars}}{{^envVars}}{{#../../envVars}}{{.}}{{/../../envVars}}{{/envVars}}"{{#unless @last}},{{/unless}}
{{/requiredEnv}}
      }{{/hasEnv}}
    }{{#unless @last}},{{/unless}}
{{/servers}}
  }
}`;

    await fs.writeFile(path.join(this.templatesDir, 'windsurf.json'), template);
  }

  private async createClaudeDesktopTemplate(): Promise<void> {
    const template = `{
  "mcpServers": {
{{#servers}}
    "{{name}}": {
      "command": "npx",
      "args": ["{{package}}@{{version}}"]{{#hasEnv}},
      "env": {
{{#requiredEnv}}
        "{{.}}": "{{#envVars}}{{.}}{{/envVars}}{{^envVars}}{{#../../envVars}}{{.}}{{/../../envVars}}{{/envVars}}"{{#unless @last}},{{/unless}}
{{/requiredEnv}}
      }{{/hasEnv}}
    }{{#unless @last}},{{/unless}}
{{/servers}}
  }
}`;

    await fs.writeFile(path.join(this.templatesDir, 'claude-desktop.json'), template);
  }

  private async createWarpTemplate(): Promise<void> {
    const template = `{
  "mcpServers": {
{{#servers}}
    "{{name}}": {
      "command": "npx",
      "args": ["{{package}}@{{version}}"]{{#hasEnv}},
      "env": {
{{#requiredEnv}}
        "{{.}}": "{{#envVars}}{{.}}{{/envVars}}{{^envVars}}{{#../../envVars}}{{.}}{{/../../envVars}}{{/envVars}}"{{#unless @last}},{{/unless}}
{{/requiredEnv}}
      }{{/hasEnv}}
    }{{#unless @last}},{{/unless}}
{{/servers}}
  }
}`;

    await fs.writeFile(path.join(this.templatesDir, 'warp.json'), template);
  }

  private async createClaudeCodeTemplate(): Promise<void> {
    const template = `# Claude Code MCP Configuration
# Run these commands to configure MCP servers for this project

{{#servers}}
claude mcp add --scope user {{name}} npx {{package}}@{{version}}{{#hasEnv}} {{#requiredEnv}}-e {{.}}="{{#envVars}}{{.}}{{/envVars}}{{^envVars}}{{#../../envVars}}{{.}}{{/../../envVars}}{{/envVars}}"{{/requiredEnv}}{{/hasEnv}}
{{/servers}}

# To remove servers:
{{#servers}}
# claude mcp remove {{name}}
{{/servers}}`;

    await fs.writeFile(path.join(this.templatesDir, 'claude-code.txt'), template);
  }
}