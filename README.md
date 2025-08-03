# Cybersecurity Simulation Platform

A full-stack web application for running and managing cybersecurity attack simulations.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Backend Setup
```bash
cd sim-backend
npm install
npm run seed  # Populates database with sample data
npm start     # Starts server on http://localhost:5000
```

### Frontend Setup
```bash
cd sim-frontend
npm install
npm start     # Starts React app on http://localhost:3000
```

## 🔐 Default Login Credentials

After running the seed script, you can log in with:

- **Admin User**: `admin` / `admin123`
- **Analyst User**: `analyst` / `analyst123`  
- **Viewer User**: `viewer` / `viewer123`

## 🛠️ Features

### Admin Dashboard
- View all simulations across all users
- Manage user accounts (view, edit roles, delete)
- Delete simulations
- Full system overview

### Analyst Dashboard  
- Launch new simulations
- View own simulations
- Monitor simulation results

### Viewer Dashboard
- View own simulations (read-only)
- Monitor simulation status

### Simulation Types
- **DDoS Attack**: Tests system resilience under high traffic
- **Malware Detection**: Tests antivirus and security monitoring
- **Phishing Campaign**: Tests user awareness and email filters
- **Ransomware Attack**: Tests backup systems and recovery
- **SQL Injection**: Tests database security and input validation

## 🔧 Troubleshooting

### Empty Tables Issue - SOLVED ✅

The following issues have been fixed:

1. **API Endpoint Mismatch**: Frontend was calling `/api/admin/users` but backend route was `/api/users`
2. **Missing Configuration Data**: Simulation form now collects threat type, region, and severity
3. **No Seed Data**: Database now populated with sample users and simulations
4. **Missing Delete Endpoints**: Added DELETE endpoints for users and simulations
5. **User Information**: Simulations now include launcher information

### Common Issues

**Q: Tables are empty after launching simulation**
A: Make sure you've run `npm run seed` in the backend directory to populate the database with sample data.

**Q: Can't see user names in simulation table**
A: The backend now includes user information in simulation responses. Refresh the page after launching a simulation.

**Q: Delete buttons not working**
A: Added proper DELETE endpoints for both users and simulations. Make sure you're logged in as admin.

**Q: Configuration fields empty**
A: The simulation form now collects configuration data (threat type, region, severity) that displays in the admin dashboard.

## 📁 Project Structure

```
├── sim-backend/          # Express.js API server
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── seed.js          # Database seeding script
│   └── server.js        # Main server file
├── sim-frontend/        # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/    # Login/Register components
│   │   │   ├── Dashboard/ # Role-specific dashboards
│   │   │   └── SimulationForm.jsx
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🔄 Database Schema

### Users Table
- `id` (Primary Key)
- `name` (Required)
- `username` (Required, Unique)
- `password` (Hashed)
- `role` (admin/analyst/viewer)

### Simulations Table  
- `id` (Primary Key)
- `simulationName` (Required)
- `simulationType` (Required)
- `config` (JSON - threat type, region, severity)
- `launchedBy` (Foreign Key to Users)
- `status` (pending/running/completed/failed)
- `result` (JSON simulation results)

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Simulations
- `GET /api/simulations` - Get simulations (role-based access)
- `POST /api/simulations` - Launch new simulation
- `GET /api/simulations/:id` - Get specific simulation
- `DELETE /api/simulations/:id` - Delete simulation (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user role (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## 🎯 Next Steps

1. **Enhanced Security**: Add rate limiting, input validation
2. **Real-time Updates**: WebSocket integration for live simulation status
3. **Advanced Analytics**: Detailed simulation metrics and reporting
4. **Email Notifications**: Alert users when simulations complete
5. **API Documentation**: Swagger/OpenAPI documentation

## 📝 License

This project is for educational purposes.