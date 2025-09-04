import fs from 'fs-extra';
import path from 'path';
// Removed unused os import
import { execSync } from 'child_process';
import { ProjectConfig, IDEConfig } from './types.js';
import { IDE_CONFIGS, PROJECT_CONFIG_DIR, MCP_SERVERS } from './constants.js';
import { TemplateManager } from './template-manager.js';
import { DopplerService } from './doppler-service.js';
import chalk from 'chalk';

export class IDEManager {
  private templateManager: TemplateManager;
  private dopplerService: DopplerService;

  constructor() {
    this.templateManager = new TemplateManager();
    this.dopplerService = new DopplerService();
  }

  async detectInstalledIDEs(): Promise<string[]> {
    const installedIDEs: string[] = [];

    for (const ide of IDE_CONFIGS) {
      const isInstalled = await this.isIDEInstalled(ide);
      if (isInstalled) {
        installedIDEs.push(ide.name);
      }
    }

    return installedIDEs;
  }

  async detectGlobalConfigs(): Promise<{ [ide: string]: string[] }> {
    const globalConfigs: { [ide: string]: string[] } = {};

    for (const ide of IDE_CONFIGS) {
      if (ide.name === 'claude-code') {
        // Handle Claude Code CLI separately
        try {
          const output = execSync('claude mcp list', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
          const servers = output
            .split('\n')
            .filter(line => line.includes(':'))
            .map(line => line.split(':')[0].trim())
            .filter(name => name.length > 0);
          
          if (servers.length > 0) {
            globalConfigs[ide.name] = servers;
          }
        } catch {
          // Claude CLI not available or no servers configured
        }
      } else {
        // Handle file-based configs
        if (await fs.pathExists(ide.configPath)) {
          try {
            const config = await fs.readJson(ide.configPath);
            if (config.mcpServers) {
              globalConfigs[ide.name] = Object.keys(config.mcpServers);
            }
          } catch {
            // Invalid or unreadable config
          }
        }
      }
    }

    return globalConfigs;
  }

  async generateConfigs(config: ProjectConfig, envVars?: { [key: string]: string }, dopplerConfig?: { project: string; config: string }, dryRun?: boolean): Promise<void> {
    // Ensure templates exist
    await this.templateManager.createTemplates();

    // Load environment variables from project .env if not provided
    if (!envVars) {
      envVars = await this.loadProjectEnv();
    }

    // If Doppler is configured, load secrets from there
    if (dopplerConfig) {
      const dopplerSecrets = await this.loadDopplerSecrets(config, dopplerConfig);
      envVars = { ...envVars, ...dopplerSecrets };
    }

    // Generate project-local configurations
    await this.generateProjectConfigs(config, envVars, dryRun);

    // Generate user-global configurations for supported IDEs
    await this.generateUserConfigs(config, envVars, dryRun);
  }

  private async generateProjectConfigs(config: ProjectConfig, envVars: { [key: string]: string }, dryRun?: boolean): Promise<void> {
    const projectConfigDir = path.join(process.cwd(), PROJECT_CONFIG_DIR);
    await fs.ensureDir(projectConfigDir);

    for (const ideName of config.ides) {
      const ide = IDE_CONFIGS.find(i => i.name === ideName);
      if (!ide || !ide.supportsProjectConfig) continue;

      try {
        if (ide.name === 'claude-code') {
          // Generate Claude Code script
          const scriptContent = await this.templateManager.generateConfig(ide.templateName, config, envVars);
          const scriptPath = path.join(projectConfigDir, `${ide.name}-setup.sh`);
          
          if (dryRun) {
            console.log(chalk.blue(`📋 Would create project config: ${scriptPath}`));
            console.log(chalk.gray('Content preview:'));
            console.log(chalk.gray(scriptContent.split('\n').slice(0, 5).join('\n') + '...'));
          } else {
            await fs.writeFile(scriptPath, scriptContent);
            // Make script executable
            await fs.chmod(scriptPath, 0o755);
            console.log(chalk.green(`✅ Generated project config for ${ide.name}`));
          }
        } else {
          // Generate JSON config
          const mcpConfig = await this.templateManager.generateMCPConfig(config, envVars);
          const configPath = path.join(projectConfigDir, `${ide.name}.json`);
          
          if (dryRun) {
            console.log(chalk.blue(`📋 Would create project config: ${configPath}`));
            console.log(chalk.gray('Config preview:'));
            console.log(chalk.gray(JSON.stringify(mcpConfig, null, 2).split('\n').slice(0, 10).join('\n') + '...'));
          } else {
            await fs.writeJson(configPath, mcpConfig, { spaces: 2 });
            console.log(chalk.green(`✅ Generated project config for ${ide.name}`));
          }
        }
      } catch (error) {
        if (dryRun) {
          console.warn(chalk.yellow(`⚠️  Would fail to generate project config for ${ide.name}: ${error}`));
        } else {
          console.warn(chalk.yellow(`⚠️  Failed to generate project config for ${ide.name}: ${error}`));
        }
      }
    }
  }

  private async generateUserConfigs(config: ProjectConfig, envVars: { [key: string]: string }, dryRun?: boolean): Promise<void> {
    for (const ideName of config.ides) {
      const ide = IDE_CONFIGS.find(i => i.name === ideName);
      if (!ide) continue;

      try {
        if (ide.name === 'claude-code') {
          // Handle Claude Code CLI separately
          await this.configureClaudeCode(config, envVars, dryRun);
        } else {
          // Handle file-based configs
          await this.configureFileBasedIDE(ide, config, envVars, dryRun);
        }
      } catch (error) {
        const prefix = dryRun ? 'Would fail to configure' : 'Failed to configure';
        console.warn(chalk.yellow(`⚠️  ${prefix} ${ide.name}: ${error}`));
      }
    }
  }

  private async configureClaudeCode(config: ProjectConfig, envVars: { [key: string]: string }, dryRun?: boolean): Promise<void> {
    try {
      if (dryRun) {
        console.log(chalk.blue('📋 Would check Claude CLI availability'));
      } else {
        // Check if claude CLI is available
        execSync('claude --version', { stdio: 'ignore' });
      }

      for (const serverName of config.servers) {
        const server = MCP_SERVERS.find(s => s.name === serverName);
        if (!server) continue;

        let command = `claude mcp add --scope user ${serverName} npx ${server.package}@${server.version}`;

        // Add environment variables if available
        if (server.requiredEnv && envVars) {
          for (const envKey of server.requiredEnv) {
            if (envVars[envKey]) {
              command += ` -e ${envKey}="${envVars[envKey]}"`;
            }
          }
        }

        if (dryRun) {
          console.log(chalk.blue(`📋 Would run: ${command}`));
        } else {
          try {
            execSync(command, { stdio: 'ignore' });
          } catch {
            // Server might already exist, try to update
            try {
              execSync(`claude mcp remove ${serverName}`, { stdio: 'ignore' });
              execSync(command, { stdio: 'ignore' });
            } catch {
              console.warn(chalk.yellow(`⚠️  Could not configure Claude Code server: ${serverName}`));
            }
          }
        }
      }

      if (dryRun) {
        console.log(chalk.blue('📋 Would configure Claude Code CLI'));
      } else {
        console.log(chalk.green('✅ Configured Claude Code CLI'));
      }
    } catch {
      if (dryRun) {
        console.log(chalk.blue('📋 Claude Code CLI not available (dry-run check)'));
      } else {
        console.warn(chalk.yellow('⚠️  Claude Code CLI not available'));
      }
    }
  }

  private async configureFileBasedIDE(ide: IDEConfig, config: ProjectConfig, envVars: { [key: string]: string }, dryRun?: boolean): Promise<void> {
    if (dryRun) {
      console.log(chalk.blue(`📋 Would ensure directory: ${path.dirname(ide.configPath)}`));
    } else {
      await fs.ensureDir(path.dirname(ide.configPath));
    }

    // Generate the MCP configuration
    const mcpConfig = await this.templateManager.generateMCPConfig(config, envVars);

    // Check if config already exists and merge
    let existingConfig: any = {};
    const configExists = await fs.pathExists(ide.configPath);
    
    if (configExists) {
      try {
        existingConfig = await fs.readJson(ide.configPath);
        if (dryRun) {
          console.log(chalk.blue(`📋 Found existing config at: ${ide.configPath}`));
        }
      } catch {
        // If existing config is invalid, start fresh
        existingConfig = {};
        if (dryRun) {
          console.log(chalk.yellow(`📋 Existing config at ${ide.configPath} is invalid, would start fresh`));
        }
      }
    } else if (dryRun) {
      console.log(chalk.blue(`📋 No existing config found, would create new: ${ide.configPath}`));
    }

    // Merge configurations
    const mergedConfig = {
      ...existingConfig,
      mcpServers: {
        ...existingConfig.mcpServers,
        ...mcpConfig.mcpServers
      }
    };

    if (dryRun) {
      console.log(chalk.blue(`📋 Would ${configExists ? 'update' : 'create'} config: ${ide.configPath}`));
      console.log(chalk.gray('Config preview:'));
      console.log(chalk.gray(JSON.stringify(mergedConfig, null, 2).split('\n').slice(0, 10).join('\n') + '...'));
    } else {
      await fs.writeJson(ide.configPath, mergedConfig, { spaces: 2 });
      console.log(chalk.green(`✅ Configured ${ide.name}`));
    }
  }

  private async isIDEInstalled(ide: IDEConfig): Promise<boolean> {
    switch (ide.name) {
      case 'cursor':
        return fs.pathExists('/Applications/Cursor.app');
      
      case 'windsurf':
        return fs.pathExists('/Applications/Windsurf.app');
      
      case 'claude-desktop':
        return fs.pathExists('/Applications/Claude.app');
      
      case 'warp':
        return fs.pathExists('/Applications/Warp.app');
      
      case 'claude-code':
        try {
          execSync('claude --version', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      
      default:
        return false;
    }
  }

  private async loadProjectEnv(): Promise<{ [key: string]: string }> {
    const envPath = path.join(process.cwd(), PROJECT_CONFIG_DIR, '.env');
    
    if (!await fs.pathExists(envPath)) {
      return {};
    }

    try {
      const envContent = await fs.readFile(envPath, 'utf8');
      const envVars: { [key: string]: string } = {};

      envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      });

      return envVars;
    } catch {
      return {};
    }
  }

  private async loadDopplerSecrets(config: ProjectConfig, dopplerConfig: { project: string; config: string }): Promise<{ [key: string]: string }> {
    console.log(chalk.blue('🔐 Loading secrets from Doppler...'));

    // Collect all required environment variables from servers
    const requiredEnvVars: string[] = [];
    
    config.servers.forEach(serverName => {
      const server = MCP_SERVERS.find(s => s.name === serverName);
      if (server?.requiredEnv) {
        requiredEnvVars.push(...server.requiredEnv);
      }
      if (server?.optionalEnv) {
        requiredEnvVars.push(...server.optionalEnv);
      }
    });

    if (requiredEnvVars.length === 0) {
      return {};
    }

    try {
      const secrets = await this.dopplerService.getSecrets(
        dopplerConfig.project,
        dopplerConfig.config,
        [...new Set(requiredEnvVars)] // Remove duplicates
      );

      const foundSecrets = Object.keys(secrets).length;
      console.log(chalk.green(`✅ Loaded ${foundSecrets} secrets from Doppler`));
      
      if (foundSecrets < requiredEnvVars.length) {
        const missingSecrets = requiredEnvVars.filter(key => !secrets[key]);
        console.log(chalk.yellow(`⚠️  Missing secrets: ${missingSecrets.join(', ')}`));
      }

      return secrets;
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Failed to load Doppler secrets:'), error);
      return {};
    }
  }
}