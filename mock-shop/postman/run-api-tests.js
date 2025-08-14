#!/usr/bin/env node

/**
 * Mock Shop API Test Runner
 * 
 * This script runs comprehensive API tests for the Mock Shop application.
 * It can be run with different test suites and generates detailed reports.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  collectionFile: path.join(__dirname, 'Mock-Shop-API-Tests.postman_collection.json'),
  environmentFile: path.join(__dirname, 'Mock-Shop-Environment.postman_environment.json'),
  reportDir: path.join(__dirname, 'reports'),
  timeout: 30000, // 30 seconds
  iterations: 1,
  delay: 100 // 100ms delay between requests
};

// Test suites
const TEST_SUITES = {
  smoke: {
    name: 'Smoke Tests',
    description: 'Basic functionality tests',
    folders: ['Authentication Tests', 'Product Tests']
  },
  full: {
    name: 'Full Test Suite',
    description: 'Complete API test coverage',
    folders: [] // Empty means all folders
  },
  security: {
    name: 'Security Tests',
    description: 'Security and validation tests',
    folders: ['Data Validation Tests']
  },
  performance: {
    name: 'Performance Tests',
    description: 'Load and performance tests',
    folders: ['Performance Tests']
  },
  auth: {
    name: 'Authentication Tests',
    description: 'Authentication and authorization tests',
    folders: ['Authentication Tests', 'User Profile Tests']
  },
  admin: {
    name: 'Admin Tests',
    description: 'Admin functionality tests',
    folders: ['Admin Tests']
  }
};

class APITestRunner {
  constructor() {
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(CONFIG.reportDir)) {
      fs.mkdirSync(CONFIG.reportDir, { recursive: true });
    }
  }

  async checkServerHealth() {
    console.log('🔍 Checking server health...');
    
    return new Promise((resolve, reject) => {
      const healthCheck = exec(`curl -f ${CONFIG.baseUrl} || exit 1`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Server is not running or not accessible');
          console.error('Please ensure the Mock Shop server is running on http://localhost:3000');
          reject(new Error('Server health check failed'));
        } else {
          console.log('✅ Server is running and accessible');
          resolve();
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        healthCheck.kill();
        reject(new Error('Server health check timed out'));
      }, 10000);
    });
  }

  async installNewman() {
    console.log('📦 Checking Newman installation...');
    
    return new Promise((resolve, reject) => {
      exec('newman --version', (error) => {
        if (error) {
          console.log('📦 Installing Newman (Postman CLI)...');
          exec('npm install -g newman newman-reporter-html', (installError) => {
            if (installError) {
              console.error('❌ Failed to install Newman');
              console.error('Please install Newman manually: npm install -g newman newman-reporter-html');
              reject(installError);
            } else {
              console.log('✅ Newman installed successfully');
              resolve();
            }
          });
        } else {
          console.log('✅ Newman is already installed');
          resolve();
        }
      });
    });
  }

  generateNewmanCommand(suite, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(CONFIG.reportDir, `${suite}-${timestamp}`);
    
    let command = [
      'newman run',
      `"${CONFIG.collectionFile}"`,
      `--environment "${CONFIG.environmentFile}"`,
      `--timeout-request ${CONFIG.timeout}`,
      `--delay-request ${options.delay || CONFIG.delay}`,
      `--iteration-count ${options.iterations || CONFIG.iterations}`,
      '--color on',
      '--reporter cli,json,html',
      `--reporter-json-export "${reportFile}.json"`,
      `--reporter-html-export "${reportFile}.html"`
    ];

    // Add folder filtering if specified
    if (TEST_SUITES[suite] && TEST_SUITES[suite].folders.length > 0) {
      const folders = TEST_SUITES[suite].folders.map(f => `"${f}"`).join(',');
      command.push(`--folder ${folders}`);
    }

    // Add global variables
    command.push('--global-var "timestamp=' + Date.now() + '"');

    return command.join(' ');
  }

  async runTestSuite(suiteName, options = {}) {
    const suite = TEST_SUITES[suiteName];
    if (!suite) {
      throw new Error(`Unknown test suite: ${suiteName}`);
    }

    console.log(`\n🚀 Running ${suite.name}`);
    console.log(`📝 ${suite.description}`);
    console.log('─'.repeat(50));

    const command = this.generateNewmanCommand(suiteName, options);
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const testProcess = exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        
        console.log('\n📊 Test Results:');
        console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
        
        if (error) {
          console.log('❌ Some tests failed');
          console.log(stdout);
          if (stderr) console.error(stderr);
          resolve({ success: false, duration, output: stdout });
        } else {
          console.log('✅ All tests passed');
          resolve({ success: true, duration, output: stdout });
        }
      });

      testProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      testProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
    });
  }

  async runMultipleSuites(suiteNames, options = {}) {
    const results = [];
    
    for (const suiteName of suiteNames) {
      try {
        const result = await this.runTestSuite(suiteName, options);
        results.push({ suite: suiteName, ...result });
        
        // Add delay between suites if specified
        if (options.suitDelay && suiteNames.indexOf(suiteName) < suiteNames.length - 1) {
          console.log(`⏳ Waiting ${options.suitDelay}ms before next suite...`);
          await new Promise(resolve => setTimeout(resolve, options.suitDelay));
        }
      } catch (error) {
        console.error(`❌ Failed to run suite ${suiteName}:`, error.message);
        results.push({ suite: suiteName, success: false, error: error.message });
      }
    }

    return results;
  }

  printSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    
    const totalSuites = results.length;
    const passedSuites = results.filter(r => r.success).length;
    const failedSuites = totalSuites - passedSuites;
    
    console.log(`📊 Total Suites: ${totalSuites}`);
    console.log(`✅ Passed: ${passedSuites}`);
    console.log(`❌ Failed: ${failedSuites}`);
    
    if (failedSuites > 0) {
      console.log('\n❌ Failed Suites:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   • ${r.suite}: ${r.error || 'Test failures'}`);
      });
    }
    
    const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
    console.log(`\n⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    
    console.log(`\n📁 Reports saved to: ${CONFIG.reportDir}`);
    console.log('='.repeat(60));
  }

  printUsage() {
    console.log(`
🧪 Mock Shop API Test Runner

Usage: node run-api-tests.js [suite] [options]

Test Suites:
${Object.entries(TEST_SUITES).map(([key, suite]) => 
  `  ${key.padEnd(12)} - ${suite.description}`
).join('\n')}

Options:
  --iterations <n>    Number of iterations (default: 1)
  --delay <ms>        Delay between requests (default: 100ms)
  --suite-delay <ms>  Delay between test suites (default: 0ms)
  --help              Show this help message

Examples:
  node run-api-tests.js smoke
  node run-api-tests.js full --iterations 3
  node run-api-tests.js auth security --delay 500
  node run-api-tests.js performance --iterations 5 --delay 0

Reports are saved to: ${CONFIG.reportDir}
    `);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    new APITestRunner().printUsage();
    return;
  }

  // Parse arguments
  const suiteArgs = args.filter(arg => !arg.startsWith('--'));
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations') options.iterations = parseInt(args[i + 1]);
    if (args[i] === '--delay') options.delay = parseInt(args[i + 1]);
    if (args[i] === '--suite-delay') options.suitDelay = parseInt(args[i + 1]);
  }

  // Default to smoke tests if no suite specified
  const suitesToRun = suiteArgs.length > 0 ? suiteArgs : ['smoke'];
  
  // Validate suites
  const invalidSuites = suitesToRun.filter(suite => !TEST_SUITES[suite]);
  if (invalidSuites.length > 0) {
    console.error(`❌ Invalid test suites: ${invalidSuites.join(', ')}`);
    console.error(`Available suites: ${Object.keys(TEST_SUITES).join(', ')}`);
    process.exit(1);
  }

  const runner = new APITestRunner();
  
  try {
    // Pre-flight checks
    await runner.checkServerHealth();
    await runner.installNewman();
    
    // Run tests
    console.log(`\n🎯 Running test suites: ${suitesToRun.join(', ')}`);
    const results = await runner.runMultipleSuites(suitesToRun, options);
    
    // Print summary
    runner.printSummary(results);
    
    // Exit with appropriate code
    const hasFailures = results.some(r => !r.success);
    process.exit(hasFailures ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { APITestRunner, TEST_SUITES, CONFIG };