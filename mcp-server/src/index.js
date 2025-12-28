import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from 'http';
import { robotTools, handleToolCall } from './tools.js';

const PORT = process.env.MCP_PORT || 3001;

// Create MCP server
const server = new McpServer({
  name: 'schematica-mcp',
  version: '1.0.0'
});

// Register all robot tools
server.tool(
  'list_robots',
  robotTools.list_robots.description,
  robotTools.list_robots.inputSchema,
  async (params) => handleToolCall('list_robots', params)
);

server.tool(
  'get_robot',
  robotTools.get_robot.description,
  robotTools.get_robot.inputSchema,
  async (params) => handleToolCall('get_robot', params)
);

server.tool(
  'create_robot',
  robotTools.create_robot.description,
  robotTools.create_robot.inputSchema,
  async (params) => handleToolCall('create_robot', params)
);

server.tool(
  'update_robot',
  robotTools.update_robot.description,
  robotTools.update_robot.inputSchema,
  async (params) => handleToolCall('update_robot', params)
);

server.tool(
  'delete_robot',
  robotTools.delete_robot.description,
  robotTools.delete_robot.inputSchema,
  async (params) => handleToolCall('delete_robot', params)
);

server.tool(
  'schedule_maintenance',
  robotTools.schedule_maintenance.description,
  robotTools.schedule_maintenance.inputSchema,
  async (params) => handleToolCall('schedule_maintenance', params)
);

// Create HTTP server with streamable transport
const httpServer = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', server: 'schematica-mcp' }));
    return;
  }

  // MCP endpoint
  if (req.url === '/mcp' && req.method === 'POST') {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined // No session tracking for simplicity
    });

    res.on('close', () => {
      transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res);
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

httpServer.listen(PORT, () => {
  console.log(`Schematica MCP Server running on http://localhost:${PORT}`);
  console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export { server, httpServer };
