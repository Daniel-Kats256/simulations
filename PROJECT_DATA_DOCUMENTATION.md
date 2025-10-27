# Cybersecurity Simulation Project - Data Documentation

## Project Overview
This is a cybersecurity simulation platform with a Node.js/Express backend and React frontend. The system allows users to run various types of cybersecurity attack simulations and manage user roles and permissions.

## Database Schema

### Database Configuration
- **Type**: SQLite
- **File**: `sim-backend/database.sqlite`
- **ORM**: Sequelize
- **Configuration**: `sim-backend/config/database.js`

### Tables

#### 1. Users Table (`users`)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `name` | STRING | NOT NULL, NOT EMPTY | User's full name |
| `username` | STRING | UNIQUE, NOT NULL, LENGTH(3-50) | Unique username for login |
| `password` | STRING | NOT NULL | Hashed password (bcrypt) |
| `role` | ENUM | NOT NULL, DEFAULT 'viewer' | User role: 'admin', 'analyst', 'viewer' |
| `created_at` | TIMESTAMP | AUTO | Record creation timestamp |
| `updated_at` | TIMESTAMP | AUTO | Record update timestamp |

**Current Users Data:**
```json
[
  {
    "id": 1,
    "name": "tumwinye roney",
    "username": "ronie",
    "password": "$2b$10$UQjLp8l.3eLuTwZNtdhHC.mqPTzup6tGf4oJv3tWDwIwF9gmvmm/e",
    "role": "analyst",
    "createdAt": "2025-08-02T03:38:14.835Z",
    "updatedAt": "2025-08-02T03:38:14.835Z"
  },
  {
    "id": 2,
    "name": "daniel kats",
    "username": "dan",
    "password": "$2b$10$x5K7VaET7ntFNjakFZ62HOixHwe0aKGektqPaVzPwJzXDlio7cewi",
    "role": "admin",
    "createdAt": "2025-08-02T03:39:33.996Z",
    "updatedAt": "2025-08-02T03:39:33.996Z"
  },
  {
    "id": 3,
    "name": "Richard Palma",
    "username": "richy",
    "password": "$2b$10$Y9OQA7ko3trULObglwqRq.vXYIvnw4idnsjjwbGCkBmKavwh1VpUm",
    "role": "viewer",
    "createdAt": "2025-08-02T03:41:18.275Z",
    "updatedAt": "2025-08-02T03:41:18.275Z"
  }
]
```

#### 2. Simulations Table (`simulations`)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique simulation identifier |
| `simulation_name` | STRING | NOT NULL | Name/description of the simulation |
| `simulation_type` | STRING | NOT NULL | Type of attack simulation |
| `config` | JSON | NULLABLE | Configuration parameters for simulation |
| `launched_by` | INTEGER | NOT NULL, FOREIGN KEY | User ID who launched the simulation |
| `status` | STRING | DEFAULT 'pending' | Simulation status: 'pending', 'running', 'completed', 'failed' |
| `result` | TEXT | NULLABLE | JSON string containing simulation results |
| `created_at` | TIMESTAMP | AUTO | Record creation timestamp |
| `updated_at` | TIMESTAMP | AUTO | Record update timestamp |

**Current Simulations Data:**
```json
[
  {
    "id": 1,
    "simulationName": "storage test",
    "simulationType": "Phishing",
    "config": {},
    "launchedBy": 1,
    "status": "completed",
    "result": "{\"simulationType\":\"Phishing\",\"success\":true,\"metrics\":{\"emailsSent\":57,\"clickRate\":21,\"credentialsHarvested\":1,\"detected\":false},\"timestamp\":\"2025-08-02T03:39:10.829Z\",\"message\":\"Phishing simulation completed successfully\"}",
    "createdAt": "2025-08-02T03:39:05.797Z",
    "updatedAt": "2025-08-02T03:39:10.833Z"
  }
]
```

### Relationships
- **Simulation → User**: Many-to-One relationship
  - `simulations.launched_by` → `users.id`
  - Cascade delete: When a user is deleted, their simulations are also deleted

## Simulation Types and Metrics

### Available Simulation Types
1. **DDoS (Distributed Denial of Service)**
   - **Metrics**: requestsPerSecond, targetResponseTime, successfulBlocks, duration
   - **Success Rate**: ~70% (random > 0.3)

2. **Malware Detection**
   - **Metrics**: detectionRate, filesScanned, threatsFound, quarantined
   - **Success Rate**: ~75% (random > 0.25)

3. **Phishing Campaign**
   - **Metrics**: emailsSent, clickRate, credentialsHarvested, detected
   - **Success Rate**: ~60% (random > 0.4)

4. **Ransomware Attack**
   - **Metrics**: filesEncrypted, encryptionTime, detectionTime, recoveryPossible
   - **Success Rate**: ~80% (random > 0.2)

5. **SQL Injection**
   - **Metrics**: queriesAttempted, successful, dataExfiltrated, blocked
   - **Success Rate**: ~65% (random > 0.35)

### Simulation Result Structure
```json
{
  "simulationType": "string",
  "success": "boolean",
  "metrics": {
    // Type-specific metrics
  },
  "timestamp": "ISO string",
  "message": "string"
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/protected` - Protected route test

### Users Management
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id` - Update user role (admin only)

### Simulations
- `POST /api/simulations` - Launch new simulation (admin/analyst)
- `GET /api/simulations` - Get simulations (filtered by user role)
- `GET /api/simulations/:id` - Get specific simulation

## User Roles and Permissions

### Role Hierarchy
1. **Admin** - Full access to all features
   - Can view all simulations
   - Can manage users (view, update roles, delete)
   - Can launch simulations
   - Can delete simulations

2. **Analyst** - Limited administrative access
   - Can view their own simulations
   - Can launch simulations
   - Cannot manage users

3. **Viewer** - Read-only access
   - Can view their own simulations
   - Cannot launch simulations
   - Cannot manage users

## Frontend Components

### Key Components
- `AuthPage.jsx` - Authentication interface
- `AdminDashboard.jsx` - Admin management interface
- `AnalystDashboard.jsx` - Analyst simulation interface
- `ViewerDashboard.jsx` - Viewer read-only interface
- `SimulationForm.jsx` - Simulation launch form
- `Navbar.jsx` - Navigation component

### Data Flow
1. User authentication via JWT tokens
2. Role-based dashboard rendering
3. Simulation form submission
4. Real-time status updates
5. Results display and management

## Security Features

### Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Token expiration handling

### Authorization
- Role-based access control (RBAC)
- Route-level permission checks
- User-specific data filtering

### Data Validation
- Input validation on all forms
- SQL injection prevention via ORM
- XSS protection through proper escaping

## File Structure

```
workspace/
├── sim-backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── index.js
│   │   ├── user.js
│   │   └── simulation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── protected.js
│   │   ├── simulations.js
│   │   └── users.js
│   ├── server.js
│   ├── database.sqlite
│   └── package.json
├── sim-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Navbar.jsx
│   │   │   └── SimulationForm.jsx
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
└── PULL_REQUEST_SUMMARY.md
```

## Current Data Status

### Database Health
- ✅ Database file exists and is accessible
- ✅ Tables are properly created with relationships
- ✅ Sample data is present and valid
- ✅ No empty tables - all contain relevant data

### Data Completeness
- **Users**: 3 active users with different roles
- **Simulations**: 1 completed simulation with detailed metrics
- **Relationships**: Properly established between users and simulations

### Data Quality
- All required fields are populated
- Data types are consistent
- Foreign key relationships are maintained
- Timestamps are properly recorded

This documentation provides a complete overview of the project's data structures, current state, and operational details. The system is fully functional with real data and proper relationships established.