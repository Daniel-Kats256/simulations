const DatabaseHelper = require('../utils/databaseHelper');
const { Simulation, User } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

async function runDiagnostics() {
  console.log('🔍 Starting Cybersecurity Simulation Diagnostics...\n');
  
  try {
    // 1. Check database health
    console.log('1️⃣ Checking database health...');
    const dbHealthy = await DatabaseHelper.checkDatabaseHealth();
    if (!dbHealthy) {
      console.log('❌ Database is not healthy. Exiting diagnostics.');
      return;
    }
    console.log('✅ Database is healthy\n');
    
    // 2. Get simulation statistics
    console.log('2️⃣ Getting simulation statistics...');
    const stats = await DatabaseHelper.getSimulationStats();
    if (stats) {
      console.log(`📊 Total simulations: ${stats.total}`);
      console.log(`✅ Completed: ${stats.completed}`);
      console.log(`❌ Failed: ${stats.failed}`);
      console.log(`🔄 Running: ${stats.running}`);
      console.log(`📈 Success rate: ${stats.successRate}%\n`);
    }
    
    // 3. Validate simulation data
    console.log('3️⃣ Validating simulation data integrity...');
    const issues = await DatabaseHelper.validateSimulationData();
    if (issues.length > 0) {
      console.log(`⚠️ Found ${issues.length} data integrity issues\n`);
    } else {
      console.log('✅ All simulation data is valid\n');
    }
    
    // 4. Check for recent simulations
    console.log('4️⃣ Checking recent simulations...');
    const recentSimulations = await Simulation.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    if (recentSimulations.length === 0) {
      console.log('📭 No simulations found in database\n');
    } else {
      console.log(`📋 Found ${recentSimulations.length} recent simulations:\n`);
      recentSimulations.forEach((sim, index) => {
        const simData = sim.toJSON();
        console.log(`${index + 1}. ${simData.simulationName} (${simData.simulationType})`);
        console.log(`   Status: ${simData.status}`);
        console.log(`   Created: ${new Date(simData.createdAt).toLocaleString()}`);
        console.log(`   Result: ${simData.result ? 'Available' : 'None'}`);
        console.log('');
      });
    }
    
    // 5. Check for stuck simulations
    console.log('5️⃣ Checking for stuck simulations...');
    const stuckSimulations = await Simulation.findAll({
      where: {
        status: 'running',
        updatedAt: {
          [Op.lt]: new Date(Date.now() - 5 * 60 * 1000) // Older than 5 minutes
        }
      }
    });
    
    if (stuckSimulations.length > 0) {
      console.log(`⚠️ Found ${stuckSimulations.length} potentially stuck simulations:\n`);
      stuckSimulations.forEach((sim, index) => {
        const simData = sim.toJSON();
        console.log(`${index + 1}. ${simData.simulationName} (${simData.simulationType})`);
        console.log(`   Started: ${new Date(simData.createdAt).toLocaleString()}`);
        console.log(`   Last update: ${new Date(simData.updatedAt).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('✅ No stuck simulations found\n');
    }
    
    // 6. Check result data quality
    console.log('6️⃣ Analyzing result data quality...');
    const allSimulations = await Simulation.findAll();
    let validResults = 0;
    let invalidResults = 0;
    let missingResults = 0;
    
    allSimulations.forEach(sim => {
      const simData = sim.toJSON();
      if (!simData.result) {
        missingResults++;
      } else {
        try {
          JSON.parse(simData.result);
          validResults++;
        } catch (e) {
          invalidResults++;
        }
      }
    });
    
    console.log(`📊 Result data analysis:`);
    console.log(`   Valid results: ${validResults}`);
    console.log(`   Invalid results: ${invalidResults}`);
    console.log(`   Missing results: ${missingResults}`);
    console.log(`   Total simulations: ${allSimulations.length}\n`);
    
    // 7. Provide recommendations
    console.log('7️⃣ Recommendations:');
    
    if (issues.length > 0) {
      console.log('🔧 Run data cleanup to fix integrity issues');
    }
    
    if (stuckSimulations.length > 0) {
      console.log('🔄 Consider resetting stuck simulations');
    }
    
    if (invalidResults > 0) {
      console.log('📝 Fix invalid result data');
    }
    
    if (stats && stats.total === 0) {
      console.log('🚀 No simulations found. Try launching a new simulation.');
    }
    
    if (stats && stats.successRate < 50) {
      console.log('⚠️ Low success rate detected. Check simulation logic.');
    }
    
    console.log('\n✅ Diagnostics completed successfully!');
    
  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
  }
}

// Run diagnostics if this script is executed directly
if (require.main === module) {
  runDiagnostics()
    .then(() => {
      console.log('\n🎯 Diagnostic script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Diagnostic script failed:', error);
      process.exit(1);
    });
}

module.exports = { runDiagnostics };