import { execSync } from 'child_process';
import chalk from 'chalk';

export interface DopplerConfig {
  project: string;
  config: string;
  available: boolean;
}

export class DopplerService {
  private isAvailable: boolean | null = null;

  async isDopplerInstalled(): Promise<boolean> {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    try {
      execSync('doppler --version', { stdio: 'ignore' });
      this.isAvailable = true;
      return true;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  async checkDopplerAuth(): Promise<boolean> {
    if (!await this.isDopplerInstalled()) {
      return false;
    }

    try {
      execSync('doppler auth status', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  async getDopplerProjects(): Promise<string[]> {
    if (!await this.isDopplerInstalled()) {
      return [];
    }

    try {
      const output = execSync('doppler projects list --json', { encoding: 'utf8' });
      const projects = JSON.parse(output);
      return projects.map((p: any) => p.name);
    } catch (error) {
      console.warn('Failed to list Doppler projects:', error);
      return [];
    }
  }

  async getDopplerConfigs(project: string): Promise<string[]> {
    if (!await this.isDopplerInstalled()) {
      return [];
    }

    try {
      const output = execSync(`doppler configs list --project "${project}" --json`, { encoding: 'utf8' });
      const configs = JSON.parse(output);
      return configs.map((c: any) => c.name);
    } catch (error) {
      console.warn(`Failed to list configs for project ${project}:`, error);
      return [];
    }
  }

  async getSecrets(project: string, config: string, keys: string[]): Promise<{ [key: string]: string }> {
    if (!await this.isDopplerInstalled()) {
      return {};
    }

    const secrets: { [key: string]: string } = {};

    for (const key of keys) {
      try {
        const value = execSync(
          `doppler secrets get ${key} --project "${project}" --config "${config}" --plain`,
          { encoding: 'utf8' }
        ).trim();
        
        if (value && value !== '') {
          secrets[key] = value;
        }
      } catch {
        // Secret doesn't exist or access denied - skip silently
      }
    }

    return secrets;
  }

  async setSecret(project: string, config: string, key: string, value: string): Promise<boolean> {
    if (!await this.isDopplerInstalled()) {
      return false;
    }

    try {
      execSync(
        `doppler secrets set "${key}=${value}" --project "${project}" --config "${config}"`,
        { stdio: 'ignore' }
      );
      return true;
    } catch {
      return false;
    }
  }

  async setupDopplerProject(): Promise<DopplerConfig | null> {
    if (!await this.isDopplerInstalled()) {
      console.log(chalk.red('❌ Doppler CLI not found'));
      console.log(chalk.blue('💡 Install it from: https://docs.doppler.com/docs/install-cli'));
      return null;
    }

    if (!await this.checkDopplerAuth()) {
      console.log(chalk.red('❌ Doppler not authenticated'));
      console.log(chalk.blue('💡 Run:'), chalk.cyan('doppler login'));
      return null;
    }

    const projects = await this.getDopplerProjects();
    
    if (projects.length === 0) {
      console.log(chalk.yellow('⚠️  No Doppler projects found'));
      console.log(chalk.blue('💡 Create one at: https://dashboard.doppler.com'));
      return null;
    }

    console.log(chalk.green('✅ Doppler is available and authenticated'));
    return { project: '', config: '', available: true };
  }

  getDopplerInstructions(): string[] {
    return [
      '1. Install Doppler CLI: https://docs.doppler.com/docs/install-cli',
      '2. Login to Doppler: doppler login',
      '3. Create a project: https://dashboard.doppler.com',
      '4. Run setup again with --doppler flag'
    ];
  }

  async promptDopplerSetup(): Promise<DopplerConfig | null> {
    const inquirer = await import('inquirer');
    
    const projects = await this.getDopplerProjects();
    
    if (projects.length === 0) {
      return null;
    }

    const { selectedProject } = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'selectedProject',
        message: 'Select Doppler project:',
        choices: projects
      }
    ]);

    const configs = await this.getDopplerConfigs(selectedProject);
    
    if (configs.length === 0) {
      console.log(chalk.yellow(`⚠️  No configs found for project ${selectedProject}`));
      return null;
    }

    const { selectedConfig } = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'selectedConfig',
        message: 'Select Doppler config:',
        choices: configs
      }
    ]);

    return {
      project: selectedProject,
      config: selectedConfig,
      available: true
    };
  }
}