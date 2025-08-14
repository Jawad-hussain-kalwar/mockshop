#!/usr/bin/env node

/**
 * Mock Shop API Testing Setup Script
 * 
 * This script helps set up the testing environment and validates everything is ready
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestingSetup {
  constructor() {
    this.steps = [
      { name: 'Check Node.js version', fn: this.checkNodeVersion },
      { name: 'Check if server is running', fn: this.checkServer },
      { name: 'Install Newman CLI', fn: this.installNewman },
      { name: 'Validate test files', fn: this.validateTestFiles },
      { name: 'Run health check', fn: this.runHealthCheck },
      { name: 'Run sample test', fn: this.runSampleTest }
    ];
  }

  async checkNodeVersion() {
    return new Promise((resolve, reject) => {
      exec('node --version', (error, stdout) => {
        if (error) {
          reject(new Error('Node.js is not installed'));
        } else {
          const version = stdout.trim();
          const majorVersion = parseInt(version.substring(1).split('.')[0]);
          
          if (majorVersion < 14) {
            reject(new Error(`Node.js version ${version} is too old. Please upgrade to v14 or higher.`));
          } else {
            console.log(`✅ Node.js ${version} is compatible`);
            resolve();
          }
        }
      });
    });
  }

  async checkServer() {
    return new Promise((resolve, reject) => {
      const http = require('http');
      
      const req = http.get('http://localhost:3000', (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Mock Shop server is running');
          resolve();
        } else {
          reject(new Error(`Server responded with status ${res.statusCode}`));
        }
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Server is not running on http://localhost:3000'));
      });

      req.on('error', () => {
        reject(new Error('Server is not running. Please start it with: npm run dev'));
      });
    });
  }

  async installNewman() {
    return new Promise((resolve, reject) => {
      exec('newman --version', (error) => {
        if (error) {
          console.log('📦 Installing Newman CLI...');
          exec('npm install -g newman newman-reporter-html', (installError, stdout, stderr) => {
            if (installError) {
              reject(new Error('Failed to install Newman. Please install manually: npm install -g newman newman-reporter-html'));
            } else {
              console.log('✅ Newman CLI installed successfully');
              resolve();
            }
          });
        } else {
          console.log('✅ Newman CLI is already installed');
          resolve();
        }
      });
    });
  }

  async validateTestFiles() {
    const requiredFiles = [
      'Mock-Shop-API-Tests.postman_collection.json',
      'Mock-Shop-Environment.postman_environment.json',
      'run-api-tests.js',
      'health-check.js'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    // Validate JSON files
    try {
      const collection = JSON.parse(fs.readFileSync(path.join(__dirname, 'Mock-Shop-API-Tests.postman_collection.json')));
      const environment = JSON.parse(fs.readFileSync(path.join(__dirname, 'Mock-Shop-Environment.postman_environment.json')));
      
      if (!collection.info || !collection.item) {
        throw new Error('Invalid collection file format');
      }
      
      if (!environment.values) {
        throw new Error('Invalid environment file format');
      }
      
      console.log('✅ All test files are valid');
    } catch (error) {
      throw new Error(`Test file validation failed: ${error.message}`);
    }
  }

  async runHealthCheck() {
    return new Promise((resolve, reject) => {
      exec('node health-check.js', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error('Health check failed. Please check server status.'));
        } else {
          console.log('✅ Health check passed');
          resolve();
        }
      });
    });
  }

  async runSampleTest() {
    return new Promise((resolve, reject) => {
      console.log('🧪 Running sample API test...');
      
      exec('node run-api-tests.js smoke --iterations 1', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
          console.log('⚠️  Sample test had some failures, but setup is complete');
          console.log('You can investigate issues by running: node run-api-tests.js smoke');
          resolve();
        } else {
          console.log('✅ Sample test passed successfully');
          resolve();
        }
      });
    });
  }

  async runSetup() {
    console.log('🚀 Mock Shop API Testing Setup');
    console.log('=' .repeat(50));

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      console.log(`\n${i + 1}. ${step.name}...`);
      
      try {
        await step.fn.call(this);
      } catch (error) {
        console.error(`❌ ${step.name} failed: ${error.message}`);
        
        if (step.name === 'Check if server is running') {
          console.log('\n💡 To start the server:');
          console.log('   cd mock-shop');
          console.log('   npm run dev');
        }
        
        if (step.name === 'Install Newman CLI') {
          console.log('\n💡 Manual installation:');
          console.log('   npm install -g newman newman-reporter-html');
        }
        
        process.exit(1);
      }
    }

    this.printSuccessMessage();
  }

  printSuccessMessage() {
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Setup completed successfully!');
    console.log('=' .repeat(50));
    
    console.log('\n📋 Available Commands:');
    console.log('   npm run test:api           - Run smoke tests');
    console.log('   npm run test:api:full      - Run full test suite');
    console.log('   npm run test:api:security  - Run security tests');
    console.log('   npm run health-check       - Check API health');
    
    console.log('\n🔧 Advanced Commands:');
    console.log('   cd postman && node run-api-tests.js --help');
    console.log('   cd postman && node run-api-tests.js smoke');
    console.log('   cd postman && node run-api-tests.js full --iterations 3');
    
    console.log('\n📊 Test Reports:');
    console.log('   Reports will be saved to: postman/reports/');
    
    console.log('\n📚 Documentation:');
    console.log('   README.md         - Complete testing guide');
    console.log('   TEST-CHECKLIST.md - Testing checklist');
    
    console.log('\n🚀 You\'re ready to start testing!');
  }
}

async function main() {
  const setup = new TestingSetup();
  
  try {
    await setup.runSetup();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { TestingSetup };