#!/usr/bin/env node

/**
 * Mock Shop API Health Check
 * 
 * Quick health check script to verify the API is running and accessible
 */

const http = require('http');
const https = require('https');

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  timeout: 5000
};

class HealthChecker {
  async checkEndpoint(url, expectedStatus = 200) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, (res) => {
        const success = res.statusCode === expectedStatus;
        resolve({
          url,
          status: res.statusCode,
          success,
          message: success ? 'OK' : `Expected ${expectedStatus}, got ${res.statusCode}`
        });
      });

      req.setTimeout(CONFIG.timeout, () => {
        req.destroy();
        reject(new Error(`Timeout after ${CONFIG.timeout}ms`));
      });

      req.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runHealthChecks() {
    console.log('🏥 Mock Shop API Health Check');
    console.log('=' .repeat(40));

    const checks = [
      { name: 'Main Application', url: CONFIG.baseUrl, status: 200 },
      { name: 'Products API', url: `${CONFIG.apiUrl}/products`, status: 200 },
      { name: 'Auth API (Unauthenticated)', url: `${CONFIG.apiUrl}/user/profile`, status: 401 },
      { name: 'Admin API (Unauthenticated)', url: `${CONFIG.apiUrl}/admin/dashboard`, status: 401 },
      { name: 'Non-existent Endpoint', url: `${CONFIG.apiUrl}/non-existent`, status: 404 }
    ];

    const results = [];
    
    for (const check of checks) {
      try {
        console.log(`🔍 Checking ${check.name}...`);
        const result = await this.checkEndpoint(check.url, check.status);
        
        if (result.success) {
          console.log(`✅ ${check.name}: ${result.message}`);
        } else {
          console.log(`❌ ${check.name}: ${result.message}`);
        }
        
        results.push({ ...check, ...result });
      } catch (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
        results.push({ 
          ...check, 
          success: false, 
          error: error.message,
          message: error.message 
        });
      }
    }

    return results;
  }

  printSummary(results) {
    console.log('\n' + '=' .repeat(40));
    console.log('📊 Health Check Summary');
    console.log('=' .repeat(40));

    const passed = results.filter(r => r.success).length;
    const total = results.length;
    const failed = total - passed;

    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);

    if (failed > 0) {
      console.log('\n❌ Failed Checks:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   • ${r.name}: ${r.message || r.error}`);
      });
    }

    const healthScore = Math.round((passed / total) * 100);
    console.log(`\n🏥 Health Score: ${healthScore}%`);

    if (healthScore >= 80) {
      console.log('🎉 API is healthy and ready for testing!');
    } else if (healthScore >= 60) {
      console.log('⚠️  API has some issues but basic functionality works');
    } else {
      console.log('🚨 API has significant issues - check server status');
    }

    return healthScore >= 60;
  }
}

async function main() {
  const checker = new HealthChecker();
  
  try {
    const results = await checker.runHealthChecks();
    const isHealthy = checker.printSummary(results);
    
    process.exit(isHealthy ? 0 : 1);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HealthChecker };