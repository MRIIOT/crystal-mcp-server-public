#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

/**
 * Simple test client to verify MCP server functionality
 */
async function testMCPServer() {
  console.log("🧪 Testing Crystal MCP Server...\n");

  try {
    // Start the MCP server process
    const serverProcess = spawn("npm", ["run", "mcp:dev"], {
      stdio: ["pipe", "pipe", "inherit"],
      shell: true
    });

    // Create client and connect via stdio
    const client = new Client({
      name: "crystal-mcp-test-client",
      version: "1.0.0"
    });

    const transport = new StdioClientTransport({
      reader: serverProcess.stdout!,
      writer: serverProcess.stdin!
    });

    await client.connect(transport);
    console.log("✅ Connected to MCP server");

    // Test 1: List available tools
    console.log("\n📋 Testing tool listing...");
    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} tools:`);
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description || 'No description'}`);
    });

    // Test 2: Test a simple tool (calculate)
    console.log("\n🧮 Testing calculate tool...");
    const calcResult = await client.callTool({
      name: "calculate",
      arguments: { expression: "2 + 2 * 3" }
    });
    console.log("Calculation result:", calcResult.content[0]);

    // Test 3: Test file reading tool
    console.log("\n📖 Testing read_file tool...");
    const fileResult = await client.callTool({
      name: "read_file",
      arguments: { path: "package.json" }
    });
    console.log("File read result (first 100 chars):", 
      fileResult.content[0].text?.substring(0, 100) + "..."
    );

    // Test 4: List available resources
    console.log("\n📦 Testing resource listing...");
    const resources = await client.listResources();
    console.log(`Found ${resources.resources.length} resources:`);
    resources.resources.forEach(resource => {
      console.log(`  - ${resource.name}: ${resource.description || 'No description'}`);
    });

    // Test 5: List available prompts
    console.log("\n💬 Testing prompt listing...");
    const prompts = await client.listPrompts();
    console.log(`Found ${prompts.prompts.length} prompts:`);
    prompts.prompts.forEach(prompt => {
      console.log(`  - ${prompt.name}: ${prompt.description || 'No description'}`);
    });

    console.log("\n✅ All tests completed successfully!");

    // Cleanup
    serverProcess.kill();
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testMCPServer().catch(console.error);
}
