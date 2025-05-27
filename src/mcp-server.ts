#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile, writeFile, readdir, mkdir } from "fs/promises";
import { join, resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { nanoid } from "nanoid";

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

/**
 * Crystal MCP Server - A comprehensive MCP server implementation
 * 
 * This server provides tools and resources for:
 * - Crystal import/export operations
 */
class CrystalMCPServer {
  private server: McpServer;

  constructor() {
    this.server = new McpServer({
      name: "crystal-mcp-server",
      version: "1.0.0"
    });

    this.setupErrorHandling();
    this.setupTools();
    this.setupResources();
    this.setupPrompts();
  }

  private setupErrorHandling() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  }

  private setupTools() {
    // Crystal Import/Export Tools
    this.server.tool(
      "import_crystal_spec",
      {
        spec_query: z.string().describe("Crystal specification query (e.g., 'temporal crystallization 3.0', 'basic 2.0', 'advanced crystallization 4.0')")
      },
      async ({ spec_query }) => {
        try {
          const protocolsDir = this.getSafePath("public/protocols");
          const availableFiles = await readdir(protocolsDir);
          const protocolFiles = availableFiles.filter(f => f.endsWith('.cp'));
          
          if (protocolFiles.length === 0) {
            return {
              content: [{
                type: "text",
                text: "No crystal specification files found in public/protocols/ directory"
              }]
            };
          }

          // Smart matching against available protocol files
          const matchResult = this.findBestProtocolMatch(spec_query, protocolFiles);
          
          if (!matchResult.match) {
            return {
              content: [{
                type: "text",
                text: `No matching crystal specification found for query: "${spec_query}"\n\nAvailable protocol files:\n${protocolFiles.map(f => `- ${f}`).join('\n')}\n\nSuggestions:\n${matchResult.suggestions.map(s => `- ${s}`).join('\n')}`
              }]
            };
          }

          const specPath = join(protocolsDir, matchResult.match);
          const specContent = await readFile(specPath, 'utf-8');
          
          return {
            content: [{
              type: "text",
              text: `✅ Crystal Specification imported successfully!\n\n📁 File: ${matchResult.match}\n🔍 Query: "${spec_query}"\n📊 Match Score: ${matchResult.score.toFixed(2)}\n\n📋 Specification Content:\n${specContent}\n\n`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error importing crystal specification: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

    this.server.tool(
      "import_codex",
      {
        spec_query: z.string().describe("Codex specification query (e.g., 'mechanism awareness 2.0', 'agent transmission 1.0', 'probability patterns')")
      },
      async ({ spec_query }) => {
        try {
          const codexDir = this.getSafePath("public/codex");
          const availableFiles = await readdir(codexDir);
          const codexFiles = availableFiles.filter(f => f.endsWith('.cx'));
          
          if (codexFiles.length === 0) {
            return {
              content: [{
                type: "text",
                text: "No codex files found in public/codex/ directory"
              }]
            };
          }

          // Smart matching against available codex files
          const matchResult = this.findBestCodexMatch(spec_query, codexFiles);
          
          if (!matchResult.match) {
            return {
              content: [{
                type: "text",
                text: `No matching codex found for query: "${spec_query}"\n\nAvailable codex files:\n${codexFiles.map(f => `- ${f}`).join('\n')}\n\nSuggestions:\n${matchResult.suggestions.map(s => `- ${s}`).join('\n')}`
              }]
            };
          }

          const codexPath = join(codexDir, matchResult.match);
          const codexContent = await readFile(codexPath, 'utf-8');
          
          return {
            content: [{
              type: "text",
              text: `✅ Codex imported successfully!\n\n📁 File: ${matchResult.match}\n🔍 Query: "${spec_query}"\n📊 Match Score: ${matchResult.score.toFixed(2)}\n\n📋 Codex Content:\n${codexContent}\n\n`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error importing codex: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

    this.server.tool(
      "export_crystal",
      {
        title: z.string().optional().describe("Optional title override for the crystal"),
        spec_version: z.string().default("3.0").describe("Crystal specification version"),
        manual_content: z.string().optional().describe("Crystal content to export (optional - uses latest crystal artifact from context if not provided)")
      },
      async ({ title, spec_version, manual_content }) => {
        try {
          // Ensure crystals directory exists
          const crystalsDir = this.getSafePath("public/crystals");
          try {
            await mkdir(crystalsDir, { recursive: true });
          } catch (error) {
            // Directory might already exist, that's fine
          }

          const crystalId = nanoid();
          let crystalContent: string;
          let crystalTitle: string;

          if (manual_content) {
            // Use manually provided content
            crystalContent = manual_content;
            crystalTitle = title || `Manual_Crystal_${crystalId.slice(0, 8)}`;
          } else {
            // Extract latest crystal artifact from context window
            const contextArtifact = await this.extractLatestCrystalArtifact();
            
            if (contextArtifact) {
              crystalContent = contextArtifact;
              crystalTitle = title || `Auto_Crystal_${crystalId.slice(0, 8)}`;
            } else {
              throw new Error("No crystal artifact found in context window. Please provide manual_content or ensure there's a crystal artifact in the conversation.");
            }
          }

          // Create crystal metadata
          const crystalData = {
            id: crystalId,
            title: crystalTitle,
            spec_version: spec_version,
            created_at: new Date().toISOString(),
            auto_detected: !manual_content,
            content: crystalContent
          };

          // Write crystal to file
          const filename = `${crystalId}.crystal`;
          const filepath = join(crystalsDir, filename);
          await writeFile(filepath, JSON.stringify(crystalData, null, 2), 'utf-8');

          return {
            content: [{
              type: "text",
              text: `✅ Crystal exported successfully!\n\n🆔 Crystal UUID: ${crystalId}\n📁 File: public/crystals/${filename}\n📝 Title: ${crystalTitle}\n🔧 Spec: ${spec_version}\n⏰ Created: ${new Date().toISOString()}\n🤖 Auto-detected: ${!manual_content}\n\n${!manual_content ? '🎯 Latest crystal artifact was automatically detected from context!' : '📝 Manual content was provided.'}\n\n🔗 Use this UUID to import: import_crystal ${crystalId}\n\n.`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error exporting crystal: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

    this.server.tool(
      "import_crystal",
      {
        crystal_id: z.string().describe("UUID of the crystal to import"),
        spec_version: z.string().default("3.0").describe("Crystal specification version to use for reconstruction")
      },
      async ({ crystal_id, spec_version }) => {
        try {
          const crystalsDir = this.getSafePath("public/crystals");
          const filepath = join(crystalsDir, `${crystal_id}.crystal`);
          
          const crystalFileContent = await readFile(filepath, 'utf-8');
          const crystalData = JSON.parse(crystalFileContent);

          // Verify crystal format
          if (!crystalData.content) {
            throw new Error("Invalid crystal format: missing content field");
          }

          return {
            content: [{
              type: "text",
              text: `Crystal imported successfully using spec ${spec_version}!\n\nCrystal ID: ${crystal_id}\nTitle: ${crystalData.title || 'Untitled'}\nOriginal Spec Version: ${crystalData.spec_version || 'Unknown'}\nCreated: ${crystalData.created_at || 'Unknown'}\n\nCrystal Content for Reconstruction:\n\n${crystalData.content}`
            }]
          };
        } catch (error) {
          if (error instanceof Error && error.message.includes('ENOENT')) {
            // List available crystals
            try {
              const crystalsDir = this.getSafePath("public/crystals");
              const crystalFiles = await readdir(crystalsDir);
              const availableCrystals = crystalFiles
                .filter(f => f.endsWith('.crystal'))
                .map(f => f.replace('.crystal', ''));
              
              return {
                content: [{
                  type: "text",
                  text: `Crystal not found: ${crystal_id}\n\nAvailable crystals:\n${availableCrystals.length > 0 ? availableCrystals.join('\n') : 'No crystals found'}`
                }]
              };
            } catch (listError) {
              return {
                content: [{
                  type: "text",
                  text: `Crystal not found: ${crystal_id}\nError listing available crystals: ${listError instanceof Error ? listError.message : 'Unknown error'}`
                }]
              };
            }
          }

          return {
            content: [{
              type: "text",
              text: `Error importing crystal: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );

    this.server.tool(
      "list_crystals",
      {},
      async () => {
        try {
          const crystalsDir = this.getSafePath("public/crystals");
          const crystalFiles = await readdir(crystalsDir);
          const crystals = [];

          for (const file of crystalFiles) {
            if (file.endsWith('.crystal')) {
              try {
                const filepath = join(crystalsDir, file);
                const crystalContent = await readFile(filepath, 'utf-8');
                const crystalData = JSON.parse(crystalContent);
                
                crystals.push({
                  id: crystalData.id || file.replace('.crystal', ''),
                  title: crystalData.title || 'Untitled',
                  spec_version: crystalData.spec_version || 'Unknown',
                  created_at: crystalData.created_at || 'Unknown',
                  size: crystalContent.length
                });
              } catch (parseError) {
                crystals.push({
                  id: file.replace('.crystal', ''),
                  title: 'Parse Error',
                  spec_version: 'Unknown',
                  created_at: 'Unknown',
                  size: 0,
                  error: 'Failed to parse crystal file'
                });
              }
            }
          }

          return {
            content: [{
              type: "text",
              text: `Available Crystals (${crystals.length}):\n\n${crystals.length > 0 ? JSON.stringify(crystals, null, 2) : 'No crystals found'}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `Error listing crystals: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]
          };
        }
      }
    );
  }

  private setupResources() {
    // No resources currently configured
  }

  private setupPrompts() {
    // No prompts currently configured
  }

  // Smart protocol file matching
  private findBestProtocolMatch(query: string, availableFiles: string[]): {
    match: string | null;
    score: number;
    suggestions: string[];
  } {
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);
    
    // Score each available file
    const scoredFiles = availableFiles.map(filename => {
      const normalizedFilename = filename.toLowerCase().replace(/[_.-]/g, ' ');
      const score = this.calculateProtocolMatchScore(queryWords, normalizedFilename);
      return { filename, score };
    });

    // Sort by score (highest first)
    scoredFiles.sort((a, b) => b.score - a.score);
    
    const bestMatch = scoredFiles[0];
    const threshold = 0.3; // Minimum score to consider a match
    
    // Generate suggestions for better matches
    const suggestions = this.generateProtocolSuggestions(availableFiles);
    
    return {
      match: bestMatch && bestMatch.score >= threshold ? bestMatch.filename : null,
      score: bestMatch ? bestMatch.score : 0,
      suggestions
    };
  }

  private calculateProtocolMatchScore(queryWords: string[], filename: string): number {
    let score = 0;
    const filenameWords = filename.split(/\s+/);
    
    // Exact word matches get high score
    for (const queryWord of queryWords) {
      for (const filenameWord of filenameWords) {
        if (filenameWord.includes(queryWord) || queryWord.includes(filenameWord)) {
          if (filenameWord === queryWord) {
            score += 1.0; // Exact match
          } else if (filenameWord.includes(queryWord) || queryWord.includes(filenameWord)) {
            score += 0.7; // Partial match
          }
        }
      }
    }
    
    // Version number matching (look for patterns like "3.0", "2.1", etc.)
    const versionRegex = /\d+\.?\d*/g;
    const queryVersions = queryWords.filter(word => versionRegex.test(word));
    const filenameVersions = filename.match(versionRegex) || [];
    
    for (const queryVersion of queryVersions) {
      for (const filenameVersion of filenameVersions) {
        if (queryVersion === filenameVersion) {
          score += 0.8; // Version exact match
        }
      }
    }
    
    // Normalize score by query length to prevent bias toward longer queries
    return queryWords.length > 0 ? score / queryWords.length : 0;
  }

  private generateProtocolSuggestions(availableFiles: string[]): string[] {
    return availableFiles.map(filename => {
      // Convert filename to suggested query format
      const nameWithoutExt = filename.replace('.cp', '');
      const parts = nameWithoutExt.split(/[_.-]/);
      
      // Try to create a natural query from the filename
      const suggestion = parts
        .map(part => part.toLowerCase())
        .filter(part => part !== 'crystallization') // Remove common word
        .join(' crystallization ') // Add crystallization between parts
        .replace(/crystallization\s*$/, '') // Remove trailing crystallization
        .trim();
        
      return suggestion || nameWithoutExt.toLowerCase().replace(/[_.-]/g, ' ');
    }).slice(0, 5); // Limit to top 5 suggestions
  }

  // Smart codex file matching
  private findBestCodexMatch(query: string, availableFiles: string[]): {
    match: string | null;
    score: number;
    suggestions: string[];
  } {
    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);
    
    // Score each available file
    const scoredFiles = availableFiles.map(filename => {
      const normalizedFilename = filename.toLowerCase().replace(/[_.-]/g, ' ');
      const score = this.calculateCodexMatchScore(queryWords, normalizedFilename);
      return { filename, score };
    });

    // Sort by score (highest first)
    scoredFiles.sort((a, b) => b.score - a.score);
    
    const bestMatch = scoredFiles[0];
    const threshold = 0.3; // Minimum score to consider a match
    
    // Generate suggestions for better matches
    const suggestions = this.generateCodexSuggestions(availableFiles);
    
    return {
      match: bestMatch && bestMatch.score >= threshold ? bestMatch.filename : null,
      score: bestMatch ? bestMatch.score : 0,
      suggestions
    };
  }

  private calculateCodexMatchScore(queryWords: string[], filename: string): number {
    let score = 0;
    const filenameWords = filename.split(/\s+/);
    
    // Exact word matches get high score
    for (const queryWord of queryWords) {
      for (const filenameWord of filenameWords) {
        if (filenameWord.includes(queryWord) || queryWord.includes(filenameWord)) {
          if (filenameWord === queryWord) {
            score += 1.0; // Exact match
          } else if (filenameWord.includes(queryWord) || queryWord.includes(filenameWord)) {
            score += 0.7; // Partial match
          }
        }
      }
    }
    
    // Version number matching (look for patterns like "3.0", "2.1", etc.)
    const versionRegex = /\d+\.?\d*/g;
    const queryVersions = queryWords.filter(word => versionRegex.test(word));
    const filenameVersions = filename.match(versionRegex) || [];
    
    for (const queryVersion of queryVersions) {
      for (const filenameVersion of filenameVersions) {
        if (queryVersion === filenameVersion) {
          score += 0.8; // Version exact match
        }
      }
    }
    
    // Codex-specific term boosting
    const codexTerms = ['mechanism', 'awareness', 'agent', 'transmission', 'protocol', 'probability', 'pattern'];
    for (const term of codexTerms) {
      if (queryWords.includes(term) && filename.includes(term)) {
        score += 0.5; // Codex term bonus
      }
    }
    
    // Normalize score by query length to prevent bias toward longer queries
    return queryWords.length > 0 ? score / queryWords.length : 0;
  }

  private generateCodexSuggestions(availableFiles: string[]): string[] {
    return availableFiles.map(filename => {
      // Convert filename to suggested query format
      const nameWithoutExt = filename.replace('.cx', '');
      const parts = nameWithoutExt.split(/[_.-]/);
      
      // Try to create a natural query from the filename
      const suggestion = parts
        .map(part => part.toLowerCase())
        .join(' ')
        .trim();
        
      return suggestion || nameWithoutExt.toLowerCase().replace(/[_.-]/g, ' ');
    }).slice(0, 5); // Limit to top 5 suggestions
  }

  // Extract latest crystal artifact from conversation context
  private async extractLatestCrystalArtifact(): Promise<string | null> {
    // In a real implementation, this would access the conversation context
    // and extract the most recent crystal artifact content
    // For now, this is a placeholder that would need integration with the conversation system
    
    // TODO: Implement actual context window access to find crystal artifacts
    // This would scan for patterns like:
    // - Code blocks with crystal content
    // - Structured crystal data
    // - Mathematical formulations
    // - Complex analysis results
    // - Any other artifact-like content
    
    return null; // Placeholder - no context access available yet
  }

  // Security: Ensure paths are within project root
  private getSafePath(inputPath: string): string {
    const resolvedPath = resolve(projectRoot, inputPath);
    if (!resolvedPath.startsWith(projectRoot)) {
      throw new Error("Path is outside project root");
    }
    return resolvedPath;
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Crystal MCP Server started successfully!");
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.error("Shutting down Crystal MCP Server...");
      await this.server.close();
      process.exit(0);
    });
  }
}

// Start the server - only when run directly
const isMainModule = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  const server = new CrystalMCPServer();
  server.start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

export default CrystalMCPServer;
