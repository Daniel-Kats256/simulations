const express = require('express');
const { Simulation, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate mock PDF report
const generatePDFReport = async (simulations) => {
  // In a real application, you would use a PDF library like PDFKit, jsPDF, or Puppeteer
  // For now, we'll return a simple text-based "PDF" content
  const reportContent = `CYBERSECURITY SIMULATION REPORT
=================================

Generated: ${new Date().toISOString()}
Total Simulations: ${simulations.length}

SIMULATION DETAILS:
${simulations.map((sim, index) => `
${index + 1}. ${sim.simulationName}
   Type: ${sim.simulationType}
   Status: ${sim.status}
   Launched By: ${sim.Launcher?.username || `User ${sim.launchedBy}`}
   Created: ${new Date(sim.createdAt).toLocaleString()}
   ${sim.result ? `Result: ${typeof sim.result === 'string' ? sim.result.substring(0, 100) + '...' : 'Completed'}` : 'No results yet'}
`).join('')}

END OF REPORT`;

  return Buffer.from(reportContent, 'utf8');
};

// Generate mock Excel report
const generateExcelReport = async (simulations) => {
  // In a real application, you would use a library like ExcelJS or xlsx
  // For now, we'll return CSV format which Excel can open
  const headers = 'ID,Name,Type,Status,Launched By,Created,Updated,Result\n';
  const rows = simulations.map(sim => {
    const result = sim.result ? 
      (typeof sim.result === 'string' ? sim.result.replace(/,/g, ';').substring(0, 50) + '...' : 'Completed') : 
      'Pending';
    
    return `${sim.id},"${sim.simulationName}","${sim.simulationType}","${sim.status}","${sim.Launcher?.username || `User ${sim.launchedBy}`}","${new Date(sim.createdAt).toISOString()}","${sim.updatedAt ? new Date(sim.updatedAt).toISOString() : ''}","${result}"`;
  }).join('\n');

  return Buffer.from(headers + rows, 'utf8');
};

// Download PDF report
router.get('/download/pdf', authenticateToken, async (req, res) => {
  try {
    let simulations;
    
    // Get simulations based on user role
    if (req.user.role === 'admin') {
      simulations = await Simulation.findAll({
        include: [{
          model: User,
          as: 'Launcher',
          attributes: ['id', 'name', 'username']
        }],
        order: [['createdAt', 'DESC']]
      });
    } else {
      simulations = await Simulation.findAll({
        where: { launchedBy: req.user.id },
        include: [{
          model: User,
          as: 'Launcher',
          attributes: ['id', 'name', 'username']
        }],
        order: [['createdAt', 'DESC']]
      });
    }

    const pdfBuffer = await generatePDFReport(simulations);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="simulation-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ message: 'Failed to generate PDF report', error: error.message });
  }
});

// Download Excel report
router.get('/download/xlsx', authenticateToken, async (req, res) => {
  try {
    let simulations;
    
    // Get simulations based on user role
    if (req.user.role === 'admin') {
      simulations = await Simulation.findAll({
        include: [{
          model: User,
          as: 'Launcher',
          attributes: ['id', 'name', 'username']
        }],
        order: [['createdAt', 'DESC']]
      });
    } else {
      simulations = await Simulation.findAll({
        where: { launchedBy: req.user.id },
        include: [{
          model: User,
          as: 'Launcher',
          attributes: ['id', 'name', 'username']
        }],
        order: [['createdAt', 'DESC']]
      });
    }

    const excelBuffer = await generateExcelReport(simulations);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="simulation-report-${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({ message: 'Failed to generate Excel report', error: error.message });
  }
});

module.exports = router;