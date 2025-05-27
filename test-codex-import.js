#!/usr/bin/env node

import { readdir } from 'fs/promises';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, ".");

/**
 * Test the codex matching logic that mirrors the MCP server implementation
 */

// Smart codex file matching (replicated from server)
function findBestCodexMatch(query, availableFiles) {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);
  
  // Score each available file
  const scoredFiles = availableFiles.map(filename => {
    const normalizedFilename = filename.toLowerCase().replace(/[_.-]/g, ' ');
    const score = calculateCodexMatchScore(queryWords, normalizedFilename);
    return { filename, score };
  });

  // Sort by score (highest first)
  scoredFiles.sort((a, b) => b.score - a.score);
  
  const bestMatch = scoredFiles[0];
  const threshold = 0.3; // Minimum score to consider a match
  
  // Generate suggestions for better matches
  const suggestions = generateCodexSuggestions(availableFiles);
  
  return {
    match: bestMatch && bestMatch.score >= threshold ? bestMatch.filename : null,
    score: bestMatch ? bestMatch.score : 0,
    suggestions,
    allScores: scoredFiles
  };
}

function calculateCodexMatchScore(queryWords, filename) {
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

function generateCodexSuggestions(availableFiles) {
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

// Test function
async function testCodexImport() {
  console.log('🔮 Testing Codex Import Functionality\n');

  try {
    // Get available codex files
    const codexDir = join(projectRoot, 'public/codex');
    const availableFiles = await readdir(codexDir);
    const codexFiles = availableFiles.filter(f => f.endsWith('.cx'));

    console.log('📁 Available codex files:');
    codexFiles.forEach(file => console.log(`  - ${file}`));
    console.log('');

    // Test queries
    const testQueries = [
      'mechanism awareness 2.0',
      'mechanism awareness',
      'awareness 2.0',
      'agent transmission',
      'transmission protocol',
      'probability patterns',
      'nonexistent query'
    ];

    console.log('🎯 Testing matching queries:\n');

    for (const query of testQueries) {
      const result = findBestCodexMatch(query, codexFiles);
      
      console.log(`Query: "${query}"`);
      if (result.match) {
        console.log(`  ✅ Match: ${result.match}`);
        console.log(`  📊 Score: ${result.score.toFixed(2)}`);
      } else {
        console.log(`  ❌ No match found (best score: ${result.score.toFixed(2)})`);
      }
      
      console.log(`  📈 All scores:`);
      result.allScores.forEach(({ filename, score }) => {
        const indicator = score >= 0.3 ? '✓' : '✗';
        console.log(`    ${indicator} ${filename}: ${score.toFixed(2)}`);
      });
      console.log('');
    }

    console.log('🎉 Codex Import Examples:');
    testQueries.slice(0, -1).forEach(query => {
      const result = findBestCodexMatch(query, codexFiles);
      if (result.match) {
        console.log(`  • '${query}' → ${result.match}`);
      }
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCodexImport();
