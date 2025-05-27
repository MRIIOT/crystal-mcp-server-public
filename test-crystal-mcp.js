#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

/**
 * Test client specifically for Crystal MCP Server functionality
 */
async function testCrystalMCP() {
  console.log("🔮 Testing Crystal MCP Server...\n");

  let serverProcess;

  try {
    // Start the MCP server process
    console.log("🚀 Starting Crystal MCP Server...");
    serverProcess = spawn("npm", ["run", "mcp:dev"], {
      stdio: ["pipe", "pipe", "inherit"],
      shell: true
    });

    // Give server time to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create client and connect via stdio
    const client = new Client({
      name: "crystal-mcp-test-client",
      version: "1.0.0"
    });

    const transport = new StdioClientTransport({
      reader: serverProcess.stdout,
      writer: serverProcess.stdin
    });

    await client.connect(transport);
    console.log("✅ Connected to Crystal MCP Server");

    // Test 1: List available tools
    console.log("\n📋 Testing tool listing...");
    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} crystal tools:`);
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description || 'No description'}`);
    });

    // Test 2: Test smart protocol matching
    console.log("\n🎯 Testing smart protocol matching...");
    console.log("Query: 'temporal crystal spec'");
    
    const protocolResult = await client.callTool({
      name: "import_crystal_spec",
      arguments: { spec_query: "temporal crystal spec" }
    });
    
    console.log("Protocol import result:");
    console.log(protocolResult.content[0].text);

    // Test 3: Test another smart query
    console.log("\n🧪 Testing another smart query...");
    console.log("Query: 'compression 2.1'");
    
    const compressionResult = await client.callTool({
      name: "import_crystal_spec", 
      arguments: { spec_query: "compression 2.1" }
    });
    
    console.log("Compression protocol result:");
    console.log(compressionResult.content[0].text);

    // Test 4: List crystals
    console.log("\n📦 Testing crystal listing...");
    const crystalList = await client.callTool({
      name: "list_crystals",
      arguments: {}
    });
    
    console.log("Available crystals:");
    console.log(crystalList.content[0].text);

    // Test 5: Export crystal test (with manual content)
    console.log("\n💎 Testing crystal export...");
    const exportResult = await client.callTool({
      name: "export_crystal",
      arguments: { 
        title: "Test Crystal",
        manual_content: "This is a test crystal created during MCP server testing.",
        spec_version: "3.0"
      }
    });
    
    console.log("Crystal export result:");
    console.log(exportResult.content[0].text);

    console.log("\n✅ All Crystal MCP tests completed successfully!");

  } catch (error) {
    console.error("❌ Crystal MCP test failed:", error);
    
    if (error.message?.includes('Invalid arguments')) {
      console.log("\n💡 Note: This might indicate the server needs to be restarted to pick up the new smart matching functionality.");
    }
    
  } finally {
    // Cleanup
    if (serverProcess) {
      console.log("\n🛑 Stopping server...");
      serverProcess.kill();
    }
  }
}

// Run if executed directly
testCrystalMCP().catch(console.error);
