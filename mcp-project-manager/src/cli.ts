#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { ProjectManager } from './project-manager.js';
import { SetupWizard } from './wizard.js';
// Removed unused CommandAction import

const program = new Command();
const projectManager = new ProjectManager();

program
  .name('mcp-project-manager')
  .description('Project-specific MCP server management for multiple IDEs')
  .version('1.0.0');

// Setup wizard command (default when no args)
program
  .command('wizard')
  .description('Launch the interactive setup wizard (beginner-friendly)')
  .option('--dry-run', 'Show what would be configured without making changes')
  .action(async (options) => {
    try {
      const wizard = new SetupWizard();
      await wizard.runWizard(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Get command name from process.argv[1] filename
const getCommandFromFilename = (): string | null => {
  const filename = process.argv[1];
  if (filename.includes('mcp-setup')) return 'wizard';
  if (filename.includes('mcp-init')) return 'init';
  if (filename.includes('mcp-add')) return 'add';
  if (filename.includes('mcp-select')) return 'select';
  if (filename.includes('mcp-remove')) return 'remove';
  if (filename.includes('mcp-list')) return 'list';
  if (filename.includes('mcp-sync')) return 'sync';
  return null;
};

program
  .command('init')
  .description('Initialize MCP configuration for a new project')
  .option('-n, --name <name>', 'Project name')
  .option('-b, --bundle <bundle>', 'Use predefined server bundle')
  .option('-i, --ides <ides>', 'Comma-separated list of IDEs to configure')
  .option('--no-interactive', 'Skip interactive prompts')
  .option('--dry-run', 'Show what would be created/updated without making changes')
  .action(async (options) => {
    try {
      await projectManager.initProject(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('add <servers...>')
  .description('Add MCP servers to current project')
  .option('-e, --env <env>', 'Environment variables as key=value pairs')
  .option('--dry-run', 'Show what would be added/updated without making changes')
  .action(async (servers, options) => {
    try {
      await projectManager.addServers(servers, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('select')
  .description('Interactively select MCP servers to add to current project')
  .option('-s, --save <name>', 'Save selection as a custom bundle')
  .action(async (options) => {
    try {
      await projectManager.interactiveServerSelection(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('remove <servers...>')
  .description('Remove MCP servers from current project')
  .action(async (servers) => {
    try {
      await projectManager.removeServers(servers);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List configured MCP servers for current project')
  .option('-a, --available', 'Show all available servers')
  .option('-b, --bundles', 'Show available server bundles')
  .action(async (options) => {
    try {
      await projectManager.listServers(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('sync')
  .description('Synchronize IDE configurations with current project setup')
  .option('-i, --ides <ides>', 'Comma-separated list of IDEs to sync')
  .option('--dry-run', 'Show what configurations would be updated without making changes')
  .action(async (options) => {
    try {
      await projectManager.syncConfigs(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('migrate')
  .description('Migrate from global MCP setup to project-specific setup')
  .option('--from-global', 'Migrate from existing global configuration')
  .action(async (options) => {
    try {
      await projectManager.migrateFromGlobal(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Handle direct command execution via symlinks
const directCommand = getCommandFromFilename();
if (directCommand) {
  if (directCommand === 'wizard') {
    // Run wizard directly
    (async () => {
      try {
        const wizard = new SetupWizard();
        await wizard.runWizard();
      } catch (error) {
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    })();
  } else {
    const args = process.argv.slice(2);
    process.argv = ['node', 'mcp', directCommand, ...args];
    program.parse();
  }
} else {
  program.parse();
}