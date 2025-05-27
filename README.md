# Crystal MCP Server

A specialized Model Context Protocol (MCP) server implementation built with TypeScript that provides AI assistants with powerful tools for managing and working with crystal artifacts - structured data containers for complex analysis, code, and knowledge.

## 🔮 What are Crystals?

Crystals are structured data containers that can hold complex analysis results, code artifacts, mathematical formulations, and other sophisticated content. They provide a standardized way to store, export, and reimport complex work products across different AI conversations and contexts.

## 🚀 Features

### 🛠️ Crystal Management Tools
- **`import_crystal_spec`** - Import crystal specification protocols
- **`import_codex`** - Import codex files for mechanism awareness and agent protocols
- **`export_crystal`** - Export content as crystal artifacts with auto-detection
- **`import_crystal`** - Import and reconstruct crystal artifacts by UUID
- **`list_crystals`** - List all available crystal artifacts

### 🔧 Key Capabilities
- **Auto-Detection**: Automatically detect and export crystal-worthy content from conversation context
- **Version Control**: Support for multiple crystal specification versions
- **UUID Management**: Unique identification system for crystal artifacts
- **Secure Storage**: Safe file operations within project boundaries
- **Metadata Tracking**: Comprehensive tracking of crystal creation and properties

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## 🔧 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the server (optional):**
   ```bash
   npm run mcp:build
   ```

## 🚀 Usage

### Development Mode
Run the server in development mode with hot reloading:
```bash
npm run mcp:dev
```

### Production Mode
Build and run the server:
```bash
npm run mcp:build
npm run mcp:start
```

### Testing
Test the server functionality:
```bash
npm run mcp:test
```

## 🔌 Integration

### Claude Desktop

1. **Copy the configuration** from `claude-desktop-config.json` to your Claude Desktop configuration file:

   **Windows:** `%APPDATA%/Claude/claude_desktop_config.json`
   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. **Update the path** in the configuration to point to your project directory:
   ```json
   {
     "mcpServers": {
       "crystal-mcp": {
         "command": "npm",
         "args": ["run", "mcp:dev"],
         "cwd": "/path/to/your/crystal-mcp-project"
       }
     }
   }
   ```

3. **Restart Claude Desktop** to load the new server.

### Other MCP Clients

The server uses the standard MCP protocol over stdio transport, making it compatible with any MCP client. Simply execute:

```bash
npm run mcp:dev
```

And connect your MCP client to the server's stdin/stdout.

## 🛡️ Security Features

- **Path Security**: All file operations are restricted to the project root directory
- **UUID Generation**: Secure unique identifier generation using nanoid
- **Error Handling**: Comprehensive error handling prevents information leakage
- **JSON Validation**: Safe JSON parsing with error recovery

## 🔍 Available Tools

### Crystal Specification Management

#### `import_crystal_spec`
Imports a crystal specification protocol using smart filename matching.

**Parameters:**
- `spec_query` (string): Natural language query for the specification (e.g., 'temporal crystallization 3.0', 'basic 2.0', 'advanced crystallization 4.0')

**Smart Matching Features:**
- **Flexible Naming**: Matches against various naming patterns and conventions
- **Keyword Extraction**: Parses natural language queries to identify specification type and version
- **Version Matching**: Intelligently matches version numbers (3.0, 2.1, etc.)
- **Fuzzy Matching**: Finds best matches even with partial or approximate queries
- **Suggestions**: Provides helpful suggestions when no exact match is found

**Examples:**
```typescript
// These queries will match "CRYSTALLIZATION_TEMPORAL_3.0.cp"
await callTool("import_crystal_spec", { spec_query: "temporal crystallization 3.0" });
await callTool("import_crystal_spec", { spec_query: "temporal 3.0" });
await callTool("import_crystal_spec", { spec_query: "3.0 temporal" });

// Will match "CRYSTALLIZATION_BASIC_2.0.cp"
await callTool("import_crystal_spec", { spec_query: "basic crystallization 2.0" });
await callTool("import_crystal_spec", { spec_query: "basic 2.0" });
```

**Returns:**
- Specification content if found
- Match score and filename information
- Suggestions for better queries if no match found
- List of available specification files

#### `import_codex`
Imports a codex file using smart filename matching. Codex files contain specialized content for mechanism awareness, agent protocols, and probability patterns.

**Parameters:**
- `spec_query` (string): Natural language query for the codex (e.g., 'mechanism awareness 2.0', 'agent transmission 1.0', 'probability patterns')

**Smart Matching Features:**
- **Codex-Specific Terms**: Enhanced matching for terms like 'mechanism', 'awareness', 'agent', 'transmission', 'protocol', 'probability', 'pattern'
- **Version Recognition**: Intelligent version number matching (2.0, 3.1, etc.)
- **Flexible Queries**: Matches partial and approximate queries
- **Contextual Scoring**: Advanced scoring algorithm optimized for codex content
- **Helpful Suggestions**: Provides guidance when no exact match is found

**Examples:**
```typescript
// These queries will match "MECHANISM_AWARENESS_2.0.cx"
await callTool("import_codex", { spec_query: "mechanism awareness 2.0" });
await callTool("import_codex", { spec_query: "mechanism awareness" });
await callTool("import_codex", { spec_query: "awareness 2.0" });

// Future codex files might match these patterns:
await callTool("import_codex", { spec_query: "agent transmission protocol" });
await callTool("import_codex", { spec_query: "probability patterns 1.0" });
```

**Returns:**
- Full codex content if found
- Match score and filename information
- Suggestions for better queries if no match found
- List of available codex files

### Crystal Export

#### `export_crystal`
Exports content as a crystal artifact. Can auto-detect crystal-worthy content from conversation context or use manually provided content.

**Parameters:**
- `title` (string, optional): Custom title for the crystal
- `spec_version` (string, default: "3.0"): Crystal specification version
- `manual_content` (string, optional): Content to export (auto-detects if not provided)

**Example:**
```typescript
// Auto-detect from context
await callTool("export_crystal", { 
  title: "My Analysis Crystal",
  spec_version: "3.0"
});

// Manual content
await callTool("export_crystal", { 
  title: "Custom Crystal",
  manual_content: "Your crystal content here"
});
```

**Returns:**
- Crystal UUID for future reference
- Storage location information
- Metadata about the crystal

### Crystal Import

#### `import_crystal`
Imports and reconstructs a crystal artifact by its UUID.

**Parameters:**
- `crystal_id` (string): UUID of the crystal to import
- `spec_version` (string, default: "3.0"): Specification version for reconstruction

**Example:**
```typescript
await callTool("import_crystal", { 
  crystal_id: "abc123def456",
  spec_version: "3.0"
});
```

### Crystal Listing

#### `list_crystals`
Lists all available crystal artifacts with metadata.

**Returns:**
- Array of crystal information including:
  - Crystal ID (UUID)
  - Title
  - Specification version
  - Creation timestamp
  - File size
  - Error status (if any)

**Example:**
```typescript
await callTool("list_crystals", {});
```

## 📁 File Structure

The Crystal MCP Server organizes files as follows:

```
crystal-mcp/
├── src/
│   ├── mcp-server.ts           # Main Crystal MCP server implementation
│   ├── test-client.ts          # Test client for validation
│   └── main.ts                # Original application entry point
├── public/
│   ├── crystals/               # Stored crystal artifacts (*.crystal files)
│   ├── codex/                  # Codex files for mechanism awareness (*.cx files)
│   └── protocols/              # Crystal specification protocols (*.cp files)
├── claude-desktop-config.json  # Claude Desktop configuration
└── README.md                   # This file
```

### Crystal Storage Format

Crystal artifacts are stored as JSON files with the following structure:

```json
{
  "id": "unique-crystal-uuid",
  "title": "Crystal Title",
  "spec_version": "3.0",
  "created_at": "2025-05-26T10:30:00.000Z",
  "auto_detected": false,
  "content": "The actual crystal content..."
}
```

### Protocol Specification Files

Protocol specifications are stored in `public/protocols/` as `.cp` files. The server supports flexible naming conventions:

**Common Naming Patterns:**
- `CRYSTALLIZATION_TEMPORAL_3.0.cp` - Temporal crystallization protocol v3.0
- `CRYSTALLIZATION_BASIC_2.0.cp` - Basic crystallization protocol v2.0
- `CRYSTALLIZATION_ADVANCED_4.0.cp` - Advanced crystallization protocol v4.0

**Smart Matching Examples:**
- Query: `"temporal crystallization 3.0"` → Matches: `CRYSTALLIZATION_TEMPORAL_3.0.cp`
- Query: `"basic 2.0"` → Matches: `CRYSTALLIZATION_BASIC_2.0.cp`
- Query: `"advanced crystallization 4.0"` → Matches: `CRYSTALLIZATION_ADVANCED_4.0.cp`
- Query: `"3.0 temporal"` → Matches: `CRYSTALLIZATION_TEMPORAL_3.0.cp`

The matching algorithm considers:
- **Keywords**: Extracts meaningful terms from your query
- **Versions**: Matches version numbers (3.0, 2.1, etc.)
- **Partial matches**: Finds best approximations for incomplete queries
- **Word order**: Flexible ordering of query terms

### Codex Files

Codex files are stored in `public/codex/` as `.cx` files and contain specialized content for mechanism awareness, agent communication protocols, and advanced AI interaction patterns.

**Current Codex Files:**
- `MECHANISM_AWARENESS_2.0.cx` - Agent-to-agent transmission protocols and mechanism awareness patterns

**Codex File Features:**
- **Mechanism Awareness**: Content that helps AI agents understand their own operation patterns
- **Inter-Agent Communication**: Protocols for advanced AI-to-AI communication
- **Probability Pattern Recognition**: Tools for understanding and working with probability distributions
- **Semantic Manipulation**: Advanced techniques for semantic space navigation

**Smart Matching Examples:**
- Query: `"mechanism awareness 2.0"` → Matches: `MECHANISM_AWARENESS_2.0.cx`
- Query: `"mechanism awareness"` → Matches: `MECHANISM_AWARENESS_2.0.cx`
- Query: `"awareness 2.0"` → Matches: `MECHANISM_AWARENESS_2.0.cx`

The codex matching algorithm includes enhanced scoring for mechanism-specific terms:
- **Mechanism Terms**: 'mechanism', 'awareness', 'agent', 'transmission', 'protocol', 'probability', 'pattern' get bonus scoring
- **Version Matching**: Precise version number recognition
- **Contextual Relevance**: Scoring optimized for codex content patterns
- **Flexible Queries**: Handles partial matches and various query formulations

## 🧪 Testing

The project includes a comprehensive test client that validates all server functionality:

```bash
npm run mcp:test
```

This will test:
- Server connection
- Crystal import/export operations
- Specification loading
- Codex import functionality
- Error handling

## 🔧 Development

### Adding New Crystal Specifications

To add a new crystal specification version:

1. **Create the specification file** in `public/protocols/`:
   ```
   public/protocols/CRYSTALLIZATION_PROTOCOL_4.0.cp
   ```

2. **Update the default version** in the server code if needed.

### Adding New Codex Files

To add a new codex file:

1. **Create the codex file** in `public/codex/`:
   ```
   public/codex/AGENT_COMMUNICATION_3.0.cx
   public/codex/PROBABILITY_PATTERNS_1.5.cx
   ```

2. **Use descriptive naming** that matches likely user queries:
   - Include key terms like MECHANISM, AWARENESS, AGENT, TRANSMISSION, etc.
   - Include version numbers for better matching
   - Use underscores to separate components

3. **The import_codex tool will automatically discover** new files without code changes.

### Extending Crystal Functionality

The server is designed to be extensible. Key areas for enhancement:

1. **Context Window Integration**: Implement actual context scanning for auto-detection
2. **Crystal Validation**: Add content validation based on specification versions
3. **Crystal Transformation**: Add tools for transforming crystals between versions
4. **Crystal Search**: Add search capabilities across crystal content
5. **Codex Enhancement**: Add codex creation and export capabilities
6. **Mechanism Pattern Detection**: Implement automatic detection of mechanism awareness patterns
7. **Agent Protocol Validation**: Add validation for agent communication protocols

### Error Handling

The server includes comprehensive error handling:

- **File System Errors**: Graceful handling of missing files or directories
- **JSON Parsing Errors**: Safe parsing with error recovery
- **Path Security**: Prevents access outside project boundaries
- **UUID Validation**: Validates crystal IDs before operations

## 💡 Use Cases

### Research and Analysis
- Export complex analysis results as crystals
- Share analysis across different AI conversations
- Maintain version history of research work

### Code Development
- Export sophisticated code solutions as crystals
- Import proven patterns and implementations
- Share complex algorithmic solutions

### Knowledge Management
- Create crystals from detailed explanations
- Build libraries of reusable knowledge artifacts
- Maintain structured documentation

### Advanced AI Interaction
- Access mechanism awareness protocols via codex files
- Implement advanced agent-to-agent communication patterns
- Explore probability pattern recognition techniques
- Apply semantic manipulation and attention steering methods

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

Areas where contributions would be particularly valuable:
- Context window integration for auto-detection
- Additional crystal specification versions
- Crystal validation and transformation tools
- Enhanced metadata and search capabilities
- New codex files for mechanism awareness patterns
- Agent communication protocol development
- Probability pattern recognition tools

## 📞 Support

If you encounter any issues or have questions, please open an issue on the project repository.

---

Built with ❤️ using the [Model Context Protocol](https://modelcontextprotocol.io/) and designed for crystal artifact management.
