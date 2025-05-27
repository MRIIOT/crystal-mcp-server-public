#!/usr/bin/env node

/**
 * Test script for Crystal MCP Server Smart Protocol Matching
 */

async function testSmartMatching() {
  console.log("🔮 Testing Smart Protocol Matching\n");
  
  // Simulate the available protocol files from our directory
  const availableFiles = [
    'CRYSTALLIZATION_PROTOCOL_2.0.txt',
    'CRYSTALLIZATION_PROTOCOL_2.1_with_compression.txt', 
    'CRYSTALLIZATION_TEMPORAL_3.0.cp'
  ];
  
  console.log("📁 Available protocol files:");
  availableFiles.forEach(file => console.log(`  - ${file}`));
  console.log();
  
  // Test queries
  const testQueries = [
    "temporal crystallization 3.0",
    "temporal 3.0", 
    "3.0 temporal",
    "compression 2.1",
    "2.1 compression",
    "basic 2.0",
    "protocol 2.0",
    "crystallization 2.0",
    "nonexistent 9.9"
  ];
  
  function calculateMatchScore(queryWords, filename) {
    let score = 0;
    const normalizedFilename = filename.toLowerCase().replace(/[_.-]/g, ' ');
    const filenameWords = normalizedFilename.split(/\s+/);
    
    // Word matching
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
    
    // Version matching
    const versionRegex = /\d+\.?\d*/g;
    const queryVersions = queryWords.filter(word => versionRegex.test(word));
    const filenameVersions = normalizedFilename.match(versionRegex) || [];
    
    for (const queryVersion of queryVersions) {
      for (const filenameVersion of filenameVersions) {
        if (queryVersion === filenameVersion) {
          score += 0.8; // Version exact match
        }
      }
    }
    
    return queryWords.length > 0 ? score / queryWords.length : 0;
  }
  
  function findBestMatch(query, files) {
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const scores = files.map(filename => ({
      filename,
      score: calculateMatchScore(queryWords, filename)
    }));
    
    scores.sort((a, b) => b.score - a.score);
    
    const bestMatch = scores[0];
    const threshold = 0.3;
    
    return {
      match: bestMatch.score >= threshold ? bestMatch.filename : null,
      score: bestMatch.score,
      allScores: scores
    };
  }
  
  console.log("🎯 Testing matching queries:\n");
  
  testQueries.forEach(query => {
    console.log(`Query: "${query}"`);
    const result = findBestMatch(query, availableFiles);
    
    if (result.match) {
      console.log(`  ✅ Match: ${result.match}`);
      console.log(`  📊 Score: ${result.score.toFixed(2)}`);
    } else {
      console.log(`  ❌ No match found (best score: ${result.score.toFixed(2)})`);
    }
    
    // Show detailed scores for debugging
    console.log(`  📈 All scores:`);
    result.allScores.forEach(({ filename, score }) => {
      const indicator = score >= 0.3 ? '✓' : '✗';
      console.log(`    ${indicator} ${filename}: ${score.toFixed(2)}`);
    });
    
    console.log();
  });
  
  console.log("🎉 Smart Protocol Matching Examples:");
  console.log("  • 'temporal crystallization 3.0' → CRYSTALLIZATION_TEMPORAL_3.0.cp");
  console.log("  • 'temporal 3.0' → CRYSTALLIZATION_TEMPORAL_3.0.cp");  
  console.log("  • 'compression 2.1' → CRYSTALLIZATION_PROTOCOL_2.1_with_compression.txt");
  console.log("  • 'basic 2.0' → CRYSTALLIZATION_PROTOCOL_2.0.txt");
}

testSmartMatching().catch(console.error);
