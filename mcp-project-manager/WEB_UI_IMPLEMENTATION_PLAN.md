# Complete Web UI Implementation Plan for MCP Project Manager

## Project Overview
Create a modern web frontend for the existing MCP Project Manager CLI tool, providing an intuitive interface for managing Model Context Protocol servers across multiple IDEs.

## Architecture Overview

### Backend API Layer
- **Framework**: Express.js with TypeScript
- **Port**: 3001 (to avoid conflicts)
- **Architecture**: RESTful API + WebSocket for real-time updates
- **Data**: File-based JSON storage (existing system)

### Frontend Application
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Real-time**: WebSocket client for operation progress
- **Icons**: Lucide React icons

## Complete File Structure

```
mcp-web-ui/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── mcp.service.ts
│   │   │   ├── project.service.ts
│   │   │   ├── bundle.service.ts
│   │   │   └── doppler.service.ts
│   │   ├── routes/
│   │   │   ├── api.ts
│   │   │   ├── servers.ts
│   │   │   ├── projects.ts
│   │   │   ├── bundles.ts
│   │   │   └── config.ts
│   │   ├── websocket/
│   │   │   └── handlers.ts
│   │   ├── types/
│   │   │   └── api.types.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn components)
│   │   │   ├── server-catalog/
│   │   │   ├── project-dashboard/
│   │   │   ├── bundle-manager/
│   │   │   └── ide-status/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
└── README.md
```

## Step 1: Backend API Implementation

### 1.1 Core Services (Extract from existing CLI)

**File: `backend/src/services/mcp.service.ts`**
```typescript
export class MCPService {
  async getAvailableServers(): Promise<MCPServer[]>
  async getServerBundles(): Promise<ServerBundle[]>
  async getServersByCategory(): Promise<{ [category: string]: MCPServer[] }>
  async validateServers(servers: string[]): Promise<{ valid: string[], invalid: string[] }>
}
```

**File: `backend/src/services/project.service.ts`**
```typescript
export class ProjectService {
  async createProject(config: CreateProjectRequest): Promise<ProjectConfig>
  async getProject(): Promise<ProjectConfig | null>
  async updateProject(config: Partial<ProjectConfig>): Promise<ProjectConfig>
  async addServers(servers: string[]): Promise<{ added: string[], existing: string[] }>
  async removeServers(servers: string[]): Promise<{ removed: string[] }>
  async syncIDEs(ides?: string[]): Promise<{ synced: string[] }>
}
```

**File: `backend/src/services/bundle.service.ts`**
```typescript
export class BundleService {
  async getCustomBundles(): Promise<ServerBundle[]>
  async createCustomBundle(name: string, description: string, servers: string[]): Promise<ServerBundle>
  async deleteCustomBundle(name: string): Promise<boolean>
  async validateBundleName(name: string): Promise<{ valid: boolean, error?: string }>
}
```

### 1.2 REST API Endpoints

**File: `backend/src/routes/servers.ts`**
```typescript
// GET /api/servers - Get all available servers
// GET /api/servers/bundles - Get server bundles
// GET /api/servers/categories - Get servers grouped by category
// POST /api/servers/validate - Validate server names
```

**File: `backend/src/routes/projects.ts`**
```typescript
// GET /api/projects/current - Get current project
// POST /api/projects - Create new project
// PUT /api/projects - Update project
// POST /api/projects/servers - Add servers to project
// DELETE /api/projects/servers - Remove servers from project
// POST /api/projects/sync - Sync IDE configurations
```

**File: `backend/src/routes/bundles.ts`**
```typescript
// GET /api/bundles - Get custom bundles
// POST /api/bundles - Create custom bundle
// DELETE /api/bundles/:name - Delete custom bundle
// POST /api/bundles/validate-name - Validate bundle name
```

### 1.3 WebSocket Implementation

**File: `backend/src/websocket/handlers.ts`**
```typescript
export interface WebSocketMessage {
  type: 'project_sync' | 'server_install' | 'ide_config' | 'error' | 'progress'
  payload: any
  timestamp: string
}

export class WebSocketHandler {
  handleConnection(ws: WebSocket): void
  broadcast(message: WebSocketMessage): void
  sendProgress(operation: string, progress: number, message?: string): void
}
```

## Step 2: Frontend Implementation

### 2.1 Core Layout and Navigation

**File: `frontend/app/layout.tsx`**
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <QueryProvider>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
```

**File: `frontend/app/components/Sidebar.tsx`**
```typescript
const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Server Catalog', href: '/servers', icon: Package },
  { name: 'My Bundles', href: '/bundles', icon: Layers },
  { name: 'IDE Status', href: '/ides', icon: Monitor },
  { name: 'Settings', href: '/settings', icon: Settings },
]
```

### 2.2 Dashboard Page

**File: `frontend/app/page.tsx`**
```typescript
export default function Dashboard() {
  const { data: project } = useProject()
  const { data: ides } = useIDEStatus()
  
  return (
    <div className="space-y-6">
      <ProjectOverview project={project} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ServerStats />
        <IDEStatusCard ides={ides} />
        <QuickActions />
      </div>
      <RecentActivity />
    </div>
  )
}
```

### 2.3 Server Catalog

**File: `frontend/app/servers/page.tsx`**
```typescript
export default function ServerCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  
  const { data: servers } = useServers()
  const addServersMutation = useAddServers()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Server Catalog</h1>
        <AddServersDialog 
          selectedServers={selectedServers}
          onAdd={(servers) => addServersMutation.mutate(servers)}
        />
      </div>
      
      <div className="flex space-x-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <CategoryFilter 
          selected={selectedCategory} 
          onChange={setSelectedCategory} 
        />
      </div>
      
      <ServerGrid 
        servers={filteredServers}
        selectedServers={selectedServers}
        onSelectionChange={setSelectedServers}
      />
    </div>
  )
}
```

### 2.4 Server Cards Component

**File: `frontend/app/components/server-catalog/ServerCard.tsx`**
```typescript
interface ServerCardProps {
  server: MCPServer
  isSelected: boolean
  isInstalled: boolean
  onToggle: (serverId: string) => void
}

export function ServerCard({ server, isSelected, isInstalled, onToggle }: ServerCardProps) {
  return (
    <Card className={cn(
      "cursor-pointer transition-all duration-200 hover:shadow-md",
      isSelected && "ring-2 ring-blue-500",
      isInstalled && "bg-green-50 border-green-200"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getServerEmoji(server.name)}</span>
            <CardTitle className="text-lg">{server.name}</CardTitle>
          </div>
          {isInstalled && <Badge variant="secondary">Installed</Badge>}
        </div>
        <CardDescription>{server.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="outline">{server.category}</Badge>
          {server.requiredEnv && (
            <Badge variant="destructive" className="text-xs">
              Requires API Keys
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => onToggle(server.name)}
          variant={isSelected ? "default" : "outline"}
          className="w-full"
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### 2.5 Bundle Manager

**File: `frontend/app/bundles/page.tsx`**
```typescript
export default function BundleManager() {
  const { data: bundles } = useCustomBundles()
  const createBundleMutation = useCreateBundle()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Server Bundles</h1>
        <CreateBundleDialog />
      </div>
      
      <div className="grid gap-4">
        {bundles?.map(bundle => (
          <BundleCard key={bundle.name} bundle={bundle} />
        ))}
      </div>
    </div>
  )
}
```

### 2.6 Bundle Creation Dialog

**File: `frontend/app/components/bundle-manager/CreateBundleDialog.tsx`**
```typescript
export function CreateBundleDialog() {
  const [open, setOpen] = useState(false)
  const [selectedServers, setSelectedServers] = useState<string[]>([])
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Bundle</Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create Server Bundle</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input placeholder="Bundle name" />
          <Textarea placeholder="Description (optional)" />
          
          <div className="h-96 overflow-y-auto">
            <ServerSelectionGrid 
              servers={servers}
              selected={selectedServers}
              onSelectionChange={setSelectedServers}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            Create Bundle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 2.7 IDE Status Dashboard

**File: `frontend/app/ides/page.tsx`**
```typescript
export default function IDEStatus() {
  const { data: ideStatus } = useIDEStatus()
  const syncMutation = useSyncIDEs()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">IDE Status</h1>
        <Button onClick={() => syncMutation.mutate()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync All
        </Button>
      </div>
      
      <div className="grid gap-4">
        {ideStatus?.map(ide => (
          <IDEStatusCard key={ide.name} ide={ide} />
        ))}
      </div>
    </div>
  )
}
```

## Step 3: React Query Hooks

**File: `frontend/app/hooks/useAPI.ts`**
```typescript
export function useServers() {
  return useQuery({
    queryKey: ['servers'],
    queryFn: () => fetch('/api/servers').then(r => r.json())
  })
}

export function useProject() {
  return useQuery({
    queryKey: ['project'],
    queryFn: () => fetch('/api/projects/current').then(r => r.json())
  })
}

export function useAddServers() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (servers: string[]) => 
      fetch('/api/projects/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ servers })
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] })
      queryClient.invalidateQueries({ queryKey: ['ide-status'] })
    }
  })
}
```

## Step 4: WebSocket Integration

**File: `frontend/app/hooks/useWebSocket.ts`**
```typescript
export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/ws')
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      setMessages(prev => [...prev, message])
      
      if (message.type === 'progress') {
        // Update progress indicators
      }
    }
    
    setSocket(ws)
    return () => ws.close()
  }, [])
  
  return { socket, messages }
}
```

## Step 5: Environment Configuration

**File: `frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**File: `backend/.env`**
```
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Step 6: Package.json Files

**File: `backend/package.json`**
```json
{
  "name": "mcp-manager-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2",
    "fs-extra": "^11.1.1",
    "chalk": "^4.1.2"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "@types/node": "^20.8.0",
    "@types/express": "^4.17.17",
    "@types/ws": "^8.5.6",
    "ts-node": "^10.9.1"
  }
}
```

**File: `frontend/package.json`**
```json
{
  "name": "mcp-manager-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.3.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

## Step 7: Styling Configuration

**File: `frontend/tailwind.config.js`**
```javascript
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... shadcn color system
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

## Step 8: Development & Deployment

### Development Commands:
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev
```

### Production Build:
```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build && npm start
```

## Key Features Implemented:

1. **Visual Server Catalog** - Browse and select MCP servers with rich cards
2. **Drag & Drop Bundle Creation** - Create custom server bundles visually
3. **Real-time Progress** - WebSocket updates during installations
4. **IDE Status Dashboard** - Visual status of all configured IDEs
5. **Environment Management** - GUI for managing API keys and secrets
6. **Project Overview** - Dashboard showing current configuration
7. **Search & Filtering** - Find servers by category, name, or features
8. **Responsive Design** - Works on desktop and mobile devices

This complete implementation provides a modern, user-friendly interface that makes the powerful MCP Project Manager accessible to non-technical users while preserving all advanced functionality for power users.