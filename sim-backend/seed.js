const bcrypt = require('bcrypt');
const { User, Simulation, sequelize } = require('./models');

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      username: 'admin',
      password: adminPassword,
      role: 'admin'
    });
    console.log('✅ Admin user created');

    // Create analyst user
    const analystPassword = await bcrypt.hash('analyst123', 10);
    const analyst = await User.create({
      name: 'Security Analyst',
      username: 'analyst',
      password: analystPassword,
      role: 'analyst'
    });
    console.log('✅ Analyst user created');

    // Create viewer user
    const viewerPassword = await bcrypt.hash('viewer123', 10);
    const viewer = await User.create({
      name: 'Viewer User',
      username: 'viewer',
      password: viewerPassword,
      role: 'viewer'
    });
    console.log('✅ Viewer user created');

    // Create sample simulations
    const sampleSimulations = [
      {
        simulationName: 'Production DDoS Test',
        simulationType: 'DDoS',
        config: {
          threatType: 'DDoS',
          cloudRegion: 'us-east-1',
          severity: 'high'
        },
        launchedBy: admin.id,
        status: 'completed',
        result: JSON.stringify({
          simulationType: 'DDoS',
          success: true,
          metrics: {
            requestsPerSecond: 8500,
            targetResponseTime: 250,
            successfulBlocks: 85,
            duration: 3
          },
          timestamp: new Date().toISOString(),
          message: 'DDoS simulation completed successfully'
        })
      },
      {
        simulationName: 'Malware Detection Test',
        simulationType: 'Malware',
        config: {
          threatType: 'Malware',
          cloudRegion: 'us-west-2',
          severity: 'medium'
        },
        launchedBy: analyst.id,
        status: 'completed',
        result: JSON.stringify({
          simulationType: 'Malware',
          success: true,
          metrics: {
            detectionRate: 95,
            filesScanned: 35000,
            threatsFound: 3,
            quarantined: 2
          },
          timestamp: new Date().toISOString(),
          message: 'Malware simulation completed successfully'
        })
      },
      {
        simulationName: 'Phishing Campaign Test',
        simulationType: 'Phishing',
        config: {
          threatType: 'Phishing',
          cloudRegion: 'eu-west-1',
          severity: 'low'
        },
        launchedBy: admin.id,
        status: 'completed',
        result: JSON.stringify({
          simulationType: 'Phishing',
          success: false,
          metrics: {
            emailsSent: 75,
            clickRate: 8,
            credentialsHarvested: 2,
            detected: true
          },
          timestamp: new Date().toISOString(),
          message: 'Phishing simulation failed - countermeasures effective'
        })
      },
      {
        simulationName: 'SQL Injection Assessment',
        simulationType: 'SQL Injection',
        config: {
          threatType: 'SQL Injection',
          cloudRegion: 'eu-central-1',
          severity: 'medium'
        },
        launchedBy: viewer.id,
        status: 'completed',
        result: JSON.stringify({
          simulationType: 'SQL Injection',
          success: false,
          metrics: {
            queriesAttempted: 15,
            successful: 0,
            dataExfiltrated: 0,
            blocked: true
          },
          timestamp: new Date().toISOString(),
          message: 'SQL Injection simulation failed - countermeasures effective'
        })
      },
      {
        simulationName: 'Ransomware Simulation',
        simulationType: 'Ransomware',
        config: {
          threatType: 'Ransomware',
          cloudRegion: 'ap-southeast-1',
          severity: 'high'
        },
        launchedBy: viewer.id,
        status: 'completed',
        result: JSON.stringify({
          simulationType: 'Ransomware',
          success: false,
          metrics: {
            filesEncrypted: 0,
            encryptionTime: 0,
            detectionTime: 2,
            recoveryPossible: true
          },
          timestamp: new Date().toISOString(),
          message: 'Ransomware simulation failed - countermeasures effective'
        })
      }
    ];

    for (const sim of sampleSimulations) {
      await Simulation.create(sim);
    }
    console.log('✅ Sample simulations created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin / admin123');
    console.log('Analyst: analyst / analyst123');
    console.log('Viewer: viewer / viewer123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();