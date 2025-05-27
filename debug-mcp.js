#!/usr/bin/env node

// Simple test to debug MCP server initialization
import { spawn } from 'child_process';

console.log('Starting MCP server for debugging...');

const server = spawn('node', ['dist-mcp/mcp-server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

server.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('STDERR:', data.toString());
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

// Send initialize message
const initMessage = {
  jsonrpc: "2.0",
  id: 0,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "debug-client",
      version: "1.0.0"
    }
  }
};

setTimeout(() => {
  console.log('Sending initialize message...');
  server.stdin.write(JSON.stringify(initMessage) + '\n');
}, 100);

setTimeout(() => {
  console.log('Stopping server...');
  server.kill();
}, 2000);
