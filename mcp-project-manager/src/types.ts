export interface MCPServer {
  name: string;
  package: string;
  version: string;
  description: string;
  category: 'core' | 'integration' | 'specialized';
  requiredEnv?: string[];
  optionalEnv?: string[];
}

export interface MCPConfig {
  mcpServers: {
    [key: string]: {
      command: string;
      args: string[];
      env?: { [key: string]: string };
    };
  };
}

export interface ProjectConfig {
  name: string;
  servers: string[];
  ides: string[];
  envVars: { [key: string]: string };
  created: string;
  updated: string;
}

export interface IDEConfig {
  name: string;
  configPath: string;
  configFormat: 'json' | 'yaml' | 'txt';
  templateName: string;
  supportsProjectConfig: boolean;
}

export interface ServerBundle {
  name: string;
  description: string;
  servers: string[];
  category: string;
  custom?: boolean;
  created?: string;
}

export interface CustomBundleConfig {
  bundles: ServerBundle[];
  lastUpdated: string;
}

export type CommandAction = 'init' | 'add' | 'remove' | 'list' | 'sync' | 'migrate' | 'wizard';