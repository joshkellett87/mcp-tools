import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { 
  ProjectConfig
} from './types.js';
import { 
  MCP_SERVERS, 
  IDE_CONFIGS, 
  SERVER_BUNDLES, 
  PROJECT_CONFIG_DIR, 
  PROJECT_CONFIG_FILE 
} from './constants.js';
import { IDEManager } from './ide-manager.js';
import { CustomBundleManager } from './custom-bundle-manager.js';

export class ProjectManager {
  private ideManager: IDEManager;
  private customBundleManager: CustomBundleManager;

  constructor() {
    this.ideManager = new IDEManager();
    this.customBundleManager = new CustomBundleManager();
  }

  async initProject(options: any): Promise<void> {
    // Welcome banner
    console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold('                    🚀 MCP Project Manager                   ') + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '            Project-specific MCP server setup            ' + chalk.cyan('║'));
    console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════╝'));
    console.log();

    // Check if already initialized (skip prompt in dry-run mode)
    if (await this.isProjectInitialized()) {
      if (options.dryRun) {
        console.log(chalk.blue('📋 MCP configuration already exists - would overwrite in non-dry-run mode'));
      } else {
        console.log(chalk.yellow('⚠️  MCP configuration already exists in this project'));
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: chalk.bold('Do you want to overwrite the existing configuration?'),
            default: false,
            prefix: '🤔'
          }
        ]);
        
        if (!overwrite) {
          console.log(chalk.yellow('👋 Setup cancelled. Your existing configuration is safe!'));
          return;
        }
      }
      console.log();
    }

    let projectName = options.name;
    let serverBundle = options.bundle;
    let selectedServers: string[] = [];
    let selectedIDEs: string[] = [];

    if (options.interactive !== false) {
      // Interactive project setup
      const responses = await this.promptProjectSetup(projectName, serverBundle);
      projectName = responses.projectName;
      serverBundle = responses.serverBundle;
      selectedServers = responses.selectedServers;
      selectedIDEs = responses.selectedIDEs;
    } else {
      // Non-interactive mode
      projectName = projectName || path.basename(process.cwd());
      selectedIDEs = options.ides ? options.ides.split(',') : ['cursor'];
      
      if (serverBundle) {
        const bundle = SERVER_BUNDLES.find(b => b.name === serverBundle);
        if (bundle) {
          selectedServers = bundle.servers;
        } else {
          throw new Error(`Unknown server bundle: ${serverBundle}`);
        }
      } else {
        selectedServers = ['filesystem', 'sequential-thinking'];
      }
    }

    // Validate selected servers and IDEs
    const validServers = this.validateServers(selectedServers);
    const validIDEs = this.validateIDEs(selectedIDEs);

    // Create project configuration
    const config: ProjectConfig = {
      name: projectName,
      servers: validServers,
      ides: validIDEs,
      envVars: {},
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // Save configuration
    if (options.dryRun) {
      console.log(chalk.blue('📋 Would save project config to:'), chalk.cyan(`./${PROJECT_CONFIG_DIR}/${PROJECT_CONFIG_FILE}`));
      console.log(chalk.gray('Config preview:'));
      console.log(chalk.gray(JSON.stringify(config, null, 2).split('\n').slice(0, 10).join('\n') + '...'));
    } else {
      await this.saveProjectConfig(config);
    }

    // Generate IDE configurations
    await this.ideManager.generateConfigs(config, undefined, undefined, options.dryRun);

    // Create environment template
    if (options.dryRun) {
      const serversWithEnv = this.getServersRequiringEnv(validServers);
      if (serversWithEnv.length > 0) {
        console.log(chalk.blue('📋 Would create environment template for:'), serversWithEnv.join(', '));
      }
    } else {
      await this.createEnvironmentTemplate(validServers);
    }

    // Success summary with visual elements
    console.log();
    if (options.dryRun) {
      console.log(chalk.blue('╔══════════════════════════════════════════════════════════════╗'));
      console.log(chalk.blue('║') + chalk.bold('                  📋 Dry Run Complete!                      ') + chalk.blue('║'));
      console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝'));
      console.log();
      console.log(chalk.blue('👁️  This was a preview! To actually create these files, run without --dry-run'));
    } else {
      console.log(chalk.green('╔══════════════════════════════════════════════════════════════╗'));
      console.log(chalk.green('║') + chalk.bold('                   ✅ Setup Complete!                       ') + chalk.green('║'));
      console.log(chalk.green('╚══════════════════════════════════════════════════════════════╝'));
    }
    console.log();
    
    console.log(chalk.blue('📁 Configuration location:'), chalk.cyan(`./${PROJECT_CONFIG_DIR}/`));
    console.log(chalk.blue('🛠️  IDEs configured:'), chalk.cyan(validIDEs.map(ide => `${ide}`).join(', ')));
    console.log(chalk.blue('📦 Servers configured:'), chalk.cyan(validServers.length.toString()), chalk.gray(`(${validServers.join(', ')})`));
    
    const serversWithEnv = this.getServersRequiringEnv(validServers);
    if (serversWithEnv.length > 0) {
      console.log();
      console.log(chalk.yellow('🔑 Next Steps - Environment Variables Required:'));
      console.log(chalk.yellow('   1. Copy template:'), chalk.gray('cp .mcp/.env .env'));
      console.log(chalk.yellow('   2. Edit .env with your API keys'));
      console.log(chalk.yellow('   3. Apply changes:'), chalk.gray('mcp-sync'));
      console.log();
      console.log(chalk.blue('   Required API keys:'));
      serversWithEnv.forEach(server => {
        const serverDef = MCP_SERVERS.find(s => s.name === server);
        if (serverDef?.requiredEnv) {
          console.log(chalk.gray(`   • ${server}: ${serverDef.requiredEnv.join(', ')}`));
        }
      });
    } else {
      console.log();
      console.log(chalk.green('🎉 Ready to use! No additional setup required.'));
      console.log(chalk.blue('💡 Restart your IDEs to see the new MCP capabilities.'));
    }
    
    console.log();
    console.log(chalk.dim('────────────────────────────────────────────────────────────────'));
    console.log(chalk.blue('📚 Need help?'), chalk.gray('Run'), chalk.cyan('mcp-list'), chalk.gray('to see your configuration'));
    console.log(chalk.blue('🔄 Add more servers:'), chalk.gray('Use'), chalk.cyan('mcp-add <server-names>'));
    console.log(chalk.dim('────────────────────────────────────────────────────────────────'));
  }

  async addServers(servers: string[], options: any): Promise<void> {
    console.log(chalk.blue('➕ Adding MCP servers to project...\n'));

    const config = await this.loadProjectConfig();
    if (!config) {
      console.log(chalk.red('❌ Project not initialized'));
      console.log(chalk.yellow('💡 Run'), chalk.cyan('mcp-init'), chalk.yellow('first to set up your project'));
      return;
    }

    const validServers = this.validateServers(servers);
    const newServers = validServers.filter(s => !config.servers.includes(s));
    const alreadyConfigured = servers.filter(s => config.servers.includes(s));
    
    if (alreadyConfigured.length > 0) {
      console.log(chalk.yellow('⚠️  Already configured:'), alreadyConfigured.map((s: string) => `${this.getServerEmoji(s)} ${s}`).join(', '));
    }

    if (newServers.length === 0) {
      console.log(chalk.blue('ℹ️  No new servers to add'));
      return;
    }

    console.log(chalk.green('✅ Adding new servers:'));
    newServers.forEach(server => {
      console.log(chalk.green(`   ${this.getServerEmoji(server)} ${server}`));
    });

    if (options.dryRun) {
      console.log(chalk.blue('📋 Would add servers to project config:'), newServers.join(', '));
    } else {
      config.servers.push(...newServers);
      config.updated = new Date().toISOString();
      await this.saveProjectConfig(config);
    }

    await this.ideManager.generateConfigs(config, undefined, undefined, options.dryRun);

    console.log();
    if (options.dryRun) {
      console.log(chalk.blue('📋 Would add servers successfully!'));
    } else {
      console.log(chalk.green('🎉 Servers added successfully!'));
    }
    console.log(chalk.blue('💡 Restart your IDEs to see the new capabilities'));
  }

  async removeServers(servers: string[], options?: any): Promise<void> {
    const config = await this.loadProjectConfig();
    if (!config) {
      throw new Error('Project not initialized. Run "mcp-init" first.');
    }

    const removedServers = servers.filter(s => config.servers.includes(s));
    
    if (removedServers.length === 0) {
      console.log(chalk.yellow('None of the specified servers were configured.'));
      return;
    }

    if (options?.dryRun) {
      console.log(chalk.blue('📋 Would remove servers from project config:'), removedServers.join(', '));
    } else {
      config.servers = config.servers.filter(s => !servers.includes(s));
      config.updated = new Date().toISOString();
      await this.saveProjectConfig(config);
      console.log(chalk.green('✅ Servers removed successfully:'), removedServers.join(', '));
    }

    await this.ideManager.generateConfigs(config, undefined, undefined, options?.dryRun);
  }

  async listServers(options: any): Promise<void> {
    if (options.bundles) {
      this.displayServerBundles();
      return;
    }

    if (options.available) {
      this.displayAvailableServers();
      return;
    }

    const config = await this.loadProjectConfig();
    if (!config) {
      console.log(chalk.yellow('Project not initialized. Run "mcp-init" first.'));
      console.log(chalk.blue('Use --available to see all available servers.'));
      return;
    }

    this.displayProjectServers(config);
  }

  async interactiveServerSelection(options: any): Promise<void> {
    console.log(chalk.blue('🔧 Interactive MCP Server Selection\n'));
    console.log(chalk.gray('   Choose from all available MCP servers'));
    
    const config = await this.loadProjectConfig();
    if (!config) {
      console.log(chalk.red('❌ Project not initialized'));
      console.log(chalk.yellow('💡 Run'), chalk.cyan('mcp-init'), chalk.yellow('first to set up your project'));
      return;
    }

    console.log(chalk.blue(`\n📋 Current project: ${config.name}`));
    if (config.servers.length > 0) {
      console.log(chalk.gray('   Currently configured:'), config.servers.map(s => `${this.getServerEmoji(s)} ${s}`).join(', '));
    }
    console.log();
    
    const serverChoices = this.groupServersByCategory();
    const { servers } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'servers',
        message: chalk.bold('Select MCP servers to add:'),
        prefix: '🔸',
        choices: serverChoices,
        validate: (input: string[]) => {
          if (input.length === 0) {
            return chalk.red('Please select at least one server.');
          }
          return true;
        }
      }
    ]);

    const newServers = servers.filter((s: string) => !config.servers.includes(s));
    const alreadyConfigured = servers.filter((s: string) => config.servers.includes(s));
    
    if (alreadyConfigured.length > 0) {
      console.log(chalk.yellow('⚠️  Already configured:'), alreadyConfigured.map((s: string) => `${this.getServerEmoji(s)} ${s}`).join(', '));
    }

    if (newServers.length === 0) {
      console.log(chalk.blue('ℹ️  No new servers to add'));
      return;
    }

    // If save option is provided, save as custom bundle
    if (options.save) {
      const bundleName = options.save;
      const validation = this.customBundleManager.validateBundleName(bundleName);
      
      if (!validation.valid) {
        console.log(chalk.red(`❌ Invalid bundle name: ${validation.error}`));
        return;
      }

      await this.customBundleManager.saveCustomBundle(
        bundleName,
        `Custom server selection created on ${new Date().toLocaleDateString()}`,
        servers
      );
      console.log(chalk.green(`✅ Saved as custom bundle: ${bundleName}`));
    }

    // Add servers to project
    config.servers.push(...newServers);
    config.updated = new Date().toISOString();

    await this.saveProjectConfig(config);
    await this.ideManager.generateConfigs(config);

    console.log();
    console.log(chalk.green('✅ Added servers:'), newServers.map((s: string) => `${this.getServerEmoji(s)} ${s}`).join(', '));
    
    // Check for environment variables
    const serversWithEnv = this.getServersRequiringEnv(newServers);
    if (serversWithEnv.length > 0) {
      console.log();
      console.log(chalk.yellow('⚠️  Some servers require environment variables:'));
      console.log(chalk.yellow('   1. Check'), chalk.cyan('.mcp/env'), chalk.yellow('for template'));
      console.log(chalk.yellow('   2. Set up your API keys'));
      console.log(chalk.yellow('   3. Apply changes:'), chalk.gray('mcp-sync'));
    } else {
      console.log(chalk.blue('💡 Restart your IDEs to see the new MCP capabilities'));
    }
  }

  async syncConfigs(options: any): Promise<void> {
    const config = await this.loadProjectConfig();
    if (!config) {
      throw new Error('Project not initialized. Run "mcp-init" first.');
    }

    const idesToSync = options.ides ? options.ides.split(',') : config.ides;
    const validIDEs = this.validateIDEs(idesToSync);

    if (options.dryRun) {
      console.log(chalk.blue('📋 Would synchronize IDE configurations:'), validIDEs.join(', '));
    } else {
      config.ides = [...new Set([...config.ides, ...validIDEs])];
      config.updated = new Date().toISOString();
      await this.saveProjectConfig(config);
      console.log(chalk.green('✅ IDE configurations synchronized:'), validIDEs.join(', '));
    }

    await this.ideManager.generateConfigs(config, undefined, undefined, options.dryRun);
  }

  async migrateFromGlobal(_options: any): Promise<void> {
    console.log(chalk.blue('🔄 Migrating from global MCP configuration...\n'));

    const globalConfigs = await this.ideManager.detectGlobalConfigs();
    
    if (Object.keys(globalConfigs).length === 0) {
      console.log(chalk.yellow('No global MCP configurations found.'));
      return;
    }

    console.log(chalk.blue('Found global configurations:'));
    Object.entries(globalConfigs).forEach(([ide, servers]) => {
      console.log(chalk.gray(`  ${ide}: ${servers.join(', ')}`));
    });

    const { migrate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'migrate',
        message: 'Create project-specific configuration from global setup?',
        default: true
      }
    ]);

    if (!migrate) {
      console.log(chalk.yellow('Migration cancelled.'));
      return;
    }

    // Create project config from global setup
    const allServers = [...new Set(Object.values(globalConfigs).flat())];
    const config: ProjectConfig = {
      name: path.basename(process.cwd()),
      servers: this.validateServers(allServers),
      ides: Object.keys(globalConfigs),
      envVars: {},
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    await this.saveProjectConfig(config);
    await this.ideManager.generateConfigs(config);
    await this.createEnvironmentTemplate(config.servers);

    console.log(chalk.green('\n✅ Migration completed successfully!'));
  }

  async saveCustomBundle(name: string, description?: string, servers?: string[]): Promise<void> {
    console.log(chalk.blue('💾 Saving custom server bundle...\n'));

    if (!servers) {
      // Get servers from current project config
      const config = await this.loadProjectConfig();
      if (!config) {
        console.log(chalk.red('❌ No project configuration found'));
        console.log(chalk.yellow('💡 Initialize a project first with'), chalk.cyan('mcp-init'));
        return;
      }
      servers = config.servers;
    }

    if (!description) {
      description = `Custom bundle with ${servers.length} servers`;
    }

    const validation = this.customBundleManager.validateBundleName(name);
    if (!validation.valid) {
      console.log(chalk.red(`❌ Invalid bundle name: ${validation.error}`));
      return;
    }

    await this.customBundleManager.saveCustomBundle(name, description, servers);

    console.log(chalk.green('✅ Custom bundle saved successfully!'));
    console.log(chalk.blue('📦 Bundle name:'), chalk.cyan(name));
    console.log(chalk.blue('📝 Description:'), description);
    console.log(chalk.blue('📋 Servers:'), servers.map(s => `${this.getServerEmoji(s)} ${s}`).join(', '));
  }

  async listCustomBundles(): Promise<void> {
    const customBundles = await this.customBundleManager.loadCustomBundles();

    if (customBundles.length === 0) {
      console.log(chalk.yellow('📦 No custom bundles found'));
      console.log(chalk.blue('💡 Create one with'), chalk.cyan('mcp-init'), chalk.blue('and choose "Create custom server set"'));
      return;
    }

    console.log(chalk.blue('📦 Custom Server Bundles:\n'));

    customBundles.forEach(bundle => {
      console.log(chalk.cyan(`📦 ${bundle.name}`));
      console.log(chalk.gray(`   ${bundle.description}`));
      console.log(chalk.gray(`   Servers: ${bundle.servers.join(', ')}`));
      if (bundle.created) {
        console.log(chalk.gray(`   Created: ${new Date(bundle.created).toLocaleDateString()}`));
      }
      console.log();
    });
  }

  async removeCustomBundle(name: string): Promise<void> {
    console.log(chalk.blue(`🗑️  Removing custom bundle: ${name}\n`));

    const removed = await this.customBundleManager.removeCustomBundle(name);

    if (removed) {
      console.log(chalk.green(`✅ Custom bundle "${name}" removed successfully!`));
    } else {
      console.log(chalk.yellow(`⚠️  Custom bundle "${name}" not found`));
      console.log(chalk.blue('💡 List available bundles with'), chalk.cyan('mcp-bundle list'));
    }
  }

  private async promptProjectSetup(projectName?: string, serverBundle?: string) {
    const questions: any[] = [];

    // Project name with visual styling
    if (!projectName) {
      questions.push({
        type: 'input',
        name: 'projectName',
        message: chalk.bold('📝 What is your project name?'),
        default: path.basename(process.cwd()),
        prefix: '🔸',
        validate: (input: string) => {
          if (input.trim().length === 0) {
            return 'Project name cannot be empty';
          }
          return true;
        }
      });
    }

    // Server selection method with enhanced choices
    questions.push({
      type: 'list',
      name: 'selectionMethod',
      message: chalk.bold('🎯 How would you like to configure MCP servers?'),
      prefix: '🔸',
      choices: [
        { 
          name: '📦 Use a predefined bundle (recommended for most projects)', 
          value: 'bundle',
          short: 'Bundle'
        },
        { 
          name: '🎨 Create a custom server set (save your selection for reuse)', 
          value: 'custom',
          short: 'Custom Set'
        },
        { 
          name: '🔧 Select servers individually (advanced users)', 
          value: 'individual',
          short: 'Individual'
        },
        { 
          name: '⚡ Start with essentials only (minimal setup)', 
          value: 'essential',
          short: 'Essential'
        }
      ]
    });

    const { selectionMethod, ...initialAnswers } = await inquirer.prompt(questions);

    let selectedServers: string[] = [];

    if (selectionMethod === 'bundle') {
      console.log();
      console.log(chalk.blue('📦 Available Server Bundles:'));
      console.log();

      // Load custom bundles and combine with built-in ones
      const customBundles = await this.customBundleManager.loadCustomBundles();
      const allBundles = [...SERVER_BUNDLES, ...customBundles];
      
      const { bundle } = await inquirer.prompt([
        {
          type: 'list',
          name: 'bundle',
          message: chalk.bold('Choose your server bundle:'),
          prefix: '🔸',
          choices: allBundles.map(bundle => ({
            name: `${this.getBundleEmoji(bundle.name)} ${chalk.cyan(bundle.name)} - ${bundle.description}${bundle.custom ? chalk.yellow(' (custom)') : ''}\n   ${chalk.gray(`Servers: ${bundle.servers.join(', ')}`)}`,
            value: bundle.name,
            short: bundle.name
          }))
        }
      ]);

      const selectedBundle = allBundles.find(b => b.name === bundle);
      selectedServers = selectedBundle?.servers || [];
      
      console.log(chalk.green(`✅ Selected bundle: ${bundle}`));
      console.log(chalk.gray(`   Includes: ${selectedServers.join(', ')}`));
    } else if (selectionMethod === 'custom') {
      console.log();
      console.log(chalk.blue('🎨 Create Custom Server Set:'));
      console.log(chalk.gray('   Select servers and save them as a reusable bundle'));
      console.log();

      const serverChoices = this.groupServersByCategory();
      const customSetup = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'servers',
          message: chalk.bold('Select MCP servers for your custom set:'),
          prefix: '🔸',
          choices: serverChoices,
          validate: (input: string[]) => {
            if (input.length === 0) {
              return chalk.red('Please select at least one server.');
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'bundleName',
          message: chalk.bold('💾 Name for your custom bundle:'),
          prefix: '🔸',
          validate: (input: string) => {
            const validation = this.customBundleManager.validateBundleName(input);
            return validation.valid ? true : chalk.red(validation.error || 'Invalid name');
          }
        },
        {
          type: 'input',
          name: 'bundleDescription',
          message: chalk.bold('📝 Description for your custom bundle:'),
          prefix: '🔸',
          default: (answers: any) => `Custom server set with ${answers.servers.length} servers`
        }
      ]);

      selectedServers = customSetup.servers;
      
      // Save the custom bundle
      await this.customBundleManager.saveCustomBundle(
        customSetup.bundleName,
        customSetup.bundleDescription,
        selectedServers
      );

      console.log(chalk.green(`✅ Created custom bundle: ${customSetup.bundleName}`));
      console.log(chalk.green(`✅ Selected ${selectedServers.length} servers: ${selectedServers.join(', ')}`));
    } else if (selectionMethod === 'individual') {
      console.log();
      console.log(chalk.blue('🔧 Individual Server Selection:'));
      console.log(chalk.gray('   Select the specific servers you need for your project'));
      console.log();
      
      const serverChoices = this.groupServersByCategory();
      const { servers } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'servers',
          message: chalk.bold('Select MCP servers:'),
          prefix: '🔸',
          choices: serverChoices,
          validate: (input: string[]) => {
            if (input.length === 0) {
              return chalk.red('Please select at least one server.');
            }
            return true;
          }
        }
      ]);
      selectedServers = servers;
      
      console.log(chalk.green(`✅ Selected ${servers.length} servers: ${servers.join(', ')}`));
    } else {
      selectedServers = ['filesystem', 'sequential-thinking'];
      console.log(chalk.green('✅ Essential servers: filesystem, sequential-thinking'));
    }

    // IDE selection with detection status
    console.log();
    console.log(chalk.blue('🛠️  IDE Configuration:'));
    
    const detectedIDEs = await this.ideManager.detectInstalledIDEs();
    if (detectedIDEs.length > 0) {
      console.log(chalk.green(`   ✅ Detected: ${detectedIDEs.join(', ')}`));
    }
    
    const { selectedIDEs } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedIDEs',
        message: chalk.bold('Select IDEs to configure:'),
        prefix: '🔸',
        choices: IDE_CONFIGS.map(ide => ({
          name: `${this.getIDEEmoji(ide.name)} ${ide.name}${detectedIDEs.includes(ide.name) ? chalk.green(' (detected)') : chalk.gray(' (not detected)')}`,
          value: ide.name,
          checked: detectedIDEs.includes(ide.name)
        })),
        validate: (input: string[]) => {
          if (input.length === 0) {
            return chalk.red('Please select at least one IDE.');
          }
          return true;
        }
      }
    ]);
    
    console.log(chalk.green(`✅ Will configure: ${selectedIDEs.join(', ')}`));

    return {
      projectName: projectName || initialAnswers.projectName,
      serverBundle,
      selectedServers,
      selectedIDEs
    };
  }

  private groupServersByCategory() {
    const categories = ['core', 'integration', 'specialized'];
    const choices: any[] = [];

    categories.forEach(category => {
      const emoji = this.getCategoryEmoji(category);
      choices.push(new inquirer.Separator(chalk.bold(`${emoji} ${category.toUpperCase()} SERVERS`)));
      
      const categoryServers = MCP_SERVERS
        .filter(server => server.category === category)
        .map(server => ({
          name: `${this.getServerEmoji(server.name)} ${chalk.cyan(server.name)} - ${server.description}${server.requiredEnv ? chalk.yellow(' (requires API keys)') : ''}`,
          value: server.name,
          checked: category === 'core'
        }));

      choices.push(...categoryServers);
      choices.push(new inquirer.Separator(' '));
    });

    return choices;
  }

  private getBundleEmoji(bundleName: string): string {
    const emojis: { [key: string]: string } = {
      'essential': '⚡',
      'web-dev': '🌐',
      'automation': '🤖',
      'research': '📚',
      'ai-rag': '🤖',
      'full': '🎯'
    };
    return emojis[bundleName] || '📦';
  }

  private getIDEEmoji(ideName: string): string {
    const emojis: { [key: string]: string } = {
      'cursor': '🔮',
      'windsurf': '🏄',
      'claude-desktop': '🖥️',
      'claude-code': '💻',
      'warp': '🚀'
    };
    return emojis[ideName] || '🛠️';
  }

  private getServerEmoji(serverName: string): string {
    const emojis: { [key: string]: string } = {
      'filesystem': '📁',
      'sequential-thinking': '🧠',
      'github': '🐙',
      'duckduckgo': '🔍',
      'context7': '📚',
      'playwright': '🎭',
      'n8n': '⚡',
      'webflow': '🌊',
      'crawl4ai-rag': '🕷️'
    };
    return emojis[serverName] || '📦';
  }

  private getCategoryEmoji(category: string): string {
    const emojis: { [key: string]: string } = {
      'core': '🎯',
      'integration': '🔗',
      'specialized': '🛠️'
    };
    return emojis[category] || '📦';
  }

  private validateServers(servers: string[]): string[] {
    const validServers = servers.filter(server => 
      MCP_SERVERS.some(s => s.name === server)
    );

    const invalidServers = servers.filter(server => 
      !MCP_SERVERS.some(s => s.name === server)
    );

    if (invalidServers.length > 0) {
      console.warn(chalk.yellow('Warning: Unknown servers ignored:'), invalidServers.join(', '));
    }

    return validServers;
  }

  private validateIDEs(ides: string[]): string[] {
    const validIDEs = ides.filter(ide => 
      IDE_CONFIGS.some(i => i.name === ide)
    );

    const invalidIDEs = ides.filter(ide => 
      !IDE_CONFIGS.some(i => i.name === ide)
    );

    if (invalidIDEs.length > 0) {
      console.warn(chalk.yellow('Warning: Unknown IDEs ignored:'), invalidIDEs.join(', '));
    }

    return validIDEs;
  }

  private async isProjectInitialized(): Promise<boolean> {
    return fs.pathExists(path.join(process.cwd(), PROJECT_CONFIG_DIR, PROJECT_CONFIG_FILE));
  }

  private async loadProjectConfig(): Promise<ProjectConfig | null> {
    const configPath = path.join(process.cwd(), PROJECT_CONFIG_DIR, PROJECT_CONFIG_FILE);
    
    if (!await fs.pathExists(configPath)) {
      return null;
    }

    try {
      return await fs.readJson(configPath);
    } catch (error) {
      throw new Error(`Failed to load project configuration: ${error}`);
    }
  }

  private async saveProjectConfig(config: ProjectConfig): Promise<void> {
    const configDir = path.join(process.cwd(), PROJECT_CONFIG_DIR);
    const configPath = path.join(configDir, PROJECT_CONFIG_FILE);

    await fs.ensureDir(configDir);
    await fs.writeJson(configPath, config, { spaces: 2 });
  }

  private async createEnvironmentTemplate(servers: string[]): Promise<void> {
    const serversWithEnv = this.getServersRequiringEnv(servers);
    
    if (serversWithEnv.length === 0) {
      return;
    }

    const envPath = path.join(process.cwd(), PROJECT_CONFIG_DIR, '.env');
    const envLines: string[] = [
      '# MCP Server Environment Variables',
      '# Copy this file to your project root and fill in the actual values',
      ''
    ];

    serversWithEnv.forEach(serverName => {
      const server = MCP_SERVERS.find(s => s.name === serverName);
      if (server?.requiredEnv) {
        envLines.push(`# ${server.description}`);
        server.requiredEnv.forEach(envVar => {
          envLines.push(`${envVar}=`);
        });
        envLines.push('');
      }
    });

    await fs.writeFile(envPath, envLines.join('\n'));
  }

  private getServersRequiringEnv(servers: string[]): string[] {
    return servers.filter(serverName => {
      const server = MCP_SERVERS.find(s => s.name === serverName);
      return server?.requiredEnv && server.requiredEnv.length > 0;
    });
  }

  private displayAvailableServers(): void {
    console.log(chalk.blue('📦 Available MCP Servers:\n'));

    const categories = ['core', 'integration', 'specialized'];
    categories.forEach(category => {
      console.log(chalk.bold(`${category.toUpperCase()}:`));
      
      const categoryServers = MCP_SERVERS.filter(s => s.category === category);
      categoryServers.forEach(server => {
        const envIndicator = server.requiredEnv ? chalk.yellow(' (requires env)') : '';
        console.log(chalk.gray(`  ${server.name} - ${server.description}${envIndicator}`));
      });
      console.log();
    });
  }

  private displayServerBundles(): void {
    console.log(chalk.blue('📦 Available Server Bundles:\n'));

    SERVER_BUNDLES.forEach(bundle => {
      console.log(chalk.bold(`${bundle.name}:`));
      console.log(chalk.gray(`  ${bundle.description}`));
      console.log(chalk.gray(`  Servers: ${bundle.servers.join(', ')}`));
      console.log();
    });
  }

  private displayProjectServers(config: ProjectConfig): void {
    console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold(`               📦 Project: ${config.name}`) + ' '.repeat(Math.max(0, 32 - config.name.length)) + chalk.cyan('║'));
    console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════╝'));
    console.log();
    
    console.log(chalk.bold('🚀 Configured Servers:'));
    config.servers.forEach(serverName => {
      const server = MCP_SERVERS.find(s => s.name === serverName);
      const emoji = this.getServerEmoji(serverName);
      const envIndicator = server?.requiredEnv ? chalk.yellow(' 🔑') : chalk.green(' ✓');
      console.log(`  ${emoji} ${chalk.cyan(serverName)} - ${server?.description || 'Unknown'}${envIndicator}`);
    });

    console.log(chalk.bold('\n🛠️  Configured IDEs:'));
    config.ides.forEach(ide => {
      const emoji = this.getIDEEmoji(ide);
      console.log(`  ${emoji} ${chalk.cyan(ide)}`);
    });

    console.log();
    console.log(chalk.dim('────────────────────────────────────────────────────────────────'));
    console.log(chalk.blue('📅 Last updated:'), chalk.gray(new Date(config.updated).toLocaleString()));
    console.log(chalk.blue('📊 Total servers:'), chalk.cyan(config.servers.length.toString()));
    console.log(chalk.blue('🎯 IDEs configured:'), chalk.cyan(config.ides.length.toString()));
    console.log(chalk.dim('────────────────────────────────────────────────────────────────'));
  }
}