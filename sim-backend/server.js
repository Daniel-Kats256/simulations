const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database'); 


// Load environment variables
dotenv.config();

// Ensure critical env vars exist
if (
  !process.env.JWT_SECRET ||
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_NAME ||
  !process.env.DB_USER
) {
  console.error('❌ Missing required environment variables. Check your .env file.');
  process.exit(1);
}


const authRoutes = require('./routes/auth');
const simulationRoutes = require('./routes/simulations');
const userRoutes = require('./routes/users');

const app = express();

// === MIDDLEWARES ===
app.use(cors());
app.use(express.json());

// === ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/users', userRoutes);

// === GLOBAL ERROR HANDLER (Optional) ===
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

const PORT = process.env.PORT || 5000;

// === SERVER STARTUP ===
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    await sequelize.sync({ force: false }); // set to `true` only during dev
    console.log('✅ Database synced.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to the database:', err.message);
    process.exit(1);
  }
};

startServer();
