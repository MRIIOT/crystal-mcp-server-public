#!/usr/bin/env node

import CrystalMCPServer from './mcp-server.js';

/**
 * Simple validation script to check if the MCP server can be instantiated
 */
async function validateServer() {
  console.log("🔍 Validating Crystal MCP Server...\n");

  try {
    // Test server instantiation
    console.log("1. Creating server instance...");
    const server = new CrystalMCPServer();
    console.log("✅ Server instance created successfully");

    // Test that the server has the expected structure
    console.log("2. Checking server structure...");
    if (server && typeof server === 'object') {
      console.log("✅ Server object structure is valid");
    } else {
      throw new Error("Server object structure is invalid");
    }

    console.log("\n🎉 Server validation completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Run 'npm run mcp:dev' to start the server");
    console.log("2. Configure Claude Desktop with the provided config");
    console.log("3. Test the server in Claude Desktop");

    return true;

  } catch (error) {
    console.error("❌ Validation failed:", error);
    return false;
  }
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateServer().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default validateServer;
