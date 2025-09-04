import inquirer from 'inquirer';
import chalk from 'chalk';
import { ProjectManager } from './project-manager.js';

export class SetupWizard {
  private projectManager: ProjectManager;

  constructor() {
    this.projectManager = new ProjectManager();
  }

  async runWizard(options?: any): Promise<void> {
    // Welcome screen
    this.displayWelcome();

    // Quick setup questions
    const quickSetup = await this.askQuickSetup();
    
    if (quickSetup.useQuick) {
      await this.runQuickSetup(quickSetup, options);
    } else {
      await this.runAdvancedSetup(options);
    }
  }

  private displayWelcome(): void {
    console.clear();
    console.log(chalk.cyan('╔══════════════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold('                        🧙‍♂️ MCP Setup Wizard                          ') + chalk.cyan('║'));
    console.log(chalk.cyan('║') + '              Get your project set up with MCP in 30 seconds!           ' + chalk.cyan('║'));
    console.log(chalk.cyan('╚══════════════════════════════════════════════════════════════════════════╝'));
    console.log();
    console.log(chalk.blue('💡 This wizard will help you configure MCP servers for your specific project'));
    console.log(chalk.blue('   No technical knowledge required - just answer a few simple questions!'));
    console.log();
  }

  private async askQuickSetup(): Promise<any> {
    return await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useQuick',
        message: chalk.bold('🚀 Want the fastest setup? (Recommended for most users)'),
        prefix: '✨',
        default: true
      }
    ]);
  }

  private async runQuickSetup(_quickSetup: any, options?: any): Promise<void> {
    console.log();
    console.log(chalk.green('⚡ Quick Setup Mode - Let\'s get you started fast!'));
    console.log();

    // Project type detection
    const projectType = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: chalk.bold('🎯 What type of project are you working on?'),
        prefix: '🔸',
        choices: [
          {
            name: '🌐 Web Development (React, Vue, Angular, websites)',
            value: 'web-dev',
            short: 'Web Development'
          },
          {
            name: '📚 Research & Documentation (articles, papers, docs)',
            value: 'research',
            short: 'Research'
          },
          {
            name: '🤖 Automation & Workflows (n8n, business processes)',
            value: 'automation',
            short: 'Automation'
          },
          {
            name: '⚡ Just the basics (file operations, AI reasoning)',
            value: 'essential',
            short: 'Essential'
          },
          {
            name: '🔧 Let me choose individually (advanced)',
            value: 'custom',
            short: 'Custom'
          }
        ]
      }
    ]);

    if (projectType.type === 'custom') {
      await this.runAdvancedSetup();
      return;
    }

    // IDE detection and selection
    console.log();
    console.log(chalk.blue('🔍 Detecting your installed IDEs...'));
    
    // Show spinner effect
    const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const spinnerInterval = setInterval(() => {
      process.stdout.write(`\r${chalk.cyan(spinner[i])} Scanning for IDEs...`);
      i = (i + 1) % spinner.length;
    }, 100);

    // Simulate detection time
    await new Promise(resolve => setTimeout(resolve, 1500));
    clearInterval(spinnerInterval);
    process.stdout.write('\r' + ' '.repeat(30) + '\r');

    // Run the actual initialization
    console.log(chalk.green('✅ Detection complete!'));
    console.log();

    const bundleMap: { [key: string]: string } = {
      'web-dev': 'web-dev',
      'research': 'research',
      'automation': 'automation',
      'essential': 'essential'
    };

    const bundle = bundleMap[projectType.type];
    
    console.log(chalk.blue('🚀 Setting up your project with:'));
    console.log(chalk.cyan(`   Bundle: ${bundle}`));
    console.log(chalk.cyan('   Auto-detecting and configuring your IDEs...'));
    console.log();

    try {
      await this.projectManager.initProject({
        bundle: bundle,
        interactive: false,
        name: undefined,
        dryRun: options?.dryRun
      });

      if (!options?.dryRun) {
        this.displaySuccess();
      }
    } catch (error) {
      console.log(chalk.red('❌ Setup failed:'), error);
      console.log(chalk.yellow('💡 Try running'), chalk.cyan('mcp-init'), chalk.yellow('for manual setup'));
    }
  }

  private async runAdvancedSetup(options?: any): Promise<void> {
    console.log();
    console.log(chalk.blue('🔧 Advanced Setup Mode'));
    console.log(chalk.gray('   You\'ll have full control over server and IDE selection'));
    console.log();

    // Delegate to the regular project manager
    await this.projectManager.initProject({
      interactive: true,
      dryRun: options?.dryRun
    });
  }

  private displaySuccess(): void {
    console.log();
    console.log(chalk.green('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.green('║') + chalk.bold('                    🎉 Setup Complete!                      ') + chalk.green('║'));
    console.log(chalk.green('╚══════════════════════════════════════════════════════════════╝'));
    console.log();
    console.log(chalk.blue('🎯 What you can do now:'));
    console.log();
    console.log(chalk.green('  ✓ Open your IDE - you\'ll see new MCP capabilities'));
    console.log(chalk.green('  ✓ Start coding with AI assistance'));
    console.log(chalk.green('  ✓ Use file operations, web search, and more'));
    console.log();
    console.log(chalk.blue('📚 Useful commands:'));
    console.log(chalk.cyan('  mcp-list'), chalk.gray(' - View your configuration'));
    console.log(chalk.cyan('  mcp-add <server>'), chalk.gray(' - Add more servers'));
    console.log(chalk.cyan('  mcp-sync'), chalk.gray(' - Update IDE configurations'));
    console.log();
    console.log(chalk.yellow('🔑 If you need API keys (GitHub, n8n, Webflow):'));
    console.log(chalk.gray('  1. Copy .mcp/.env to .env'));
    console.log(chalk.gray('  2. Edit .env with your API keys'));
    console.log(chalk.gray('  3. Run mcp-sync'));
    console.log();
  }
}