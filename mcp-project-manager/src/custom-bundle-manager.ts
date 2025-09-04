import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { ServerBundle, CustomBundleConfig } from './types.js';
import { MCP_SERVERS } from './constants.js';

export class CustomBundleManager {
  private configDir: string;
  private configFile: string;

  constructor() {
    this.configDir = path.join(os.homedir(), '.mcp-project-manager');
    this.configFile = path.join(this.configDir, 'custom-bundles.json');
  }

  async loadCustomBundles(): Promise<ServerBundle[]> {
    try {
      if (!await fs.pathExists(this.configFile)) {
        return [];
      }

      const config: CustomBundleConfig = await fs.readJson(this.configFile);
      return config.bundles || [];
    } catch (error) {
      console.warn('Failed to load custom bundles:', error);
      return [];
    }
  }

  async saveCustomBundle(name: string, description: string, servers: string[]): Promise<void> {
    // Validate servers exist
    const invalidServers = servers.filter(server => 
      !MCP_SERVERS.some(s => s.name === server)
    );

    if (invalidServers.length > 0) {
      throw new Error(`Unknown servers: ${invalidServers.join(', ')}`);
    }

    await fs.ensureDir(this.configDir);

    const bundles = await this.loadCustomBundles();
    
    // Remove existing bundle with same name
    const filteredBundles = bundles.filter(b => b.name !== name);

    const newBundle: ServerBundle = {
      name,
      description,
      servers,
      category: 'custom',
      custom: true,
      created: new Date().toISOString()
    };

    filteredBundles.push(newBundle);

    const config: CustomBundleConfig = {
      bundles: filteredBundles,
      lastUpdated: new Date().toISOString()
    };

    await fs.writeJson(this.configFile, config, { spaces: 2 });
  }

  async removeCustomBundle(name: string): Promise<boolean> {
    const bundles = await this.loadCustomBundles();
    const initialLength = bundles.length;
    
    const filteredBundles = bundles.filter(b => b.name !== name);

    if (filteredBundles.length === initialLength) {
      return false; // Bundle not found
    }

    const config: CustomBundleConfig = {
      bundles: filteredBundles,
      lastUpdated: new Date().toISOString()
    };

    await fs.writeJson(this.configFile, config, { spaces: 2 });
    return true;
  }

  async getCustomBundle(name: string): Promise<ServerBundle | null> {
    const bundles = await this.loadCustomBundles();
    return bundles.find(b => b.name === name) || null;
  }

  async listCustomBundles(): Promise<ServerBundle[]> {
    return this.loadCustomBundles();
  }

  validateBundleName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Bundle name cannot be empty' };
    }

    if (name.includes(' ')) {
      return { valid: false, error: 'Bundle name cannot contain spaces' };
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
      return { valid: false, error: 'Bundle name can only contain letters, numbers, hyphens, and underscores' };
    }

    // Check if name conflicts with built-in bundles
    const builtInBundles = ['essential', 'web-dev', 'automation', 'research', 'ai-rag', 'full'];
    if (builtInBundles.includes(name)) {
      return { valid: false, error: 'Bundle name conflicts with built-in bundle' };
    }

    return { valid: true };
  }
}