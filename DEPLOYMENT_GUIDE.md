# Todo App - Azure App Services Deployment Guide

## Overview
This is a production-ready Node.js Todo application with Express.js, MongoDB, and JWT authentication. It's configured to run on Microsoft Azure App Services with Node.js 24 LTS.

## Project Structure
```
todo-app/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── env.js               # Environment configuration
│   ├── controllers/
│   │   ├── authController.js    # Auth logic (register, login)
│   │   └── todoController.js    # Todo CRUD operations
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   ├── User.js              # User schema
│   │   └── Todo.js              # Todo schema
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   └── todos.js             # Todo routes
│   └── server.js                # Main server file
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── web.config                   # IIS configuration for Azure
└── deploy.cmd                   # Deployment script
```

## Features
✅ User Registration & Login with JWT authentication
✅ Todo CRUD operations (Create, Read, Update, Delete)
✅ MongoDB integration with Mongoose
✅ Password hashing with bcryptjs
✅ Input validation
✅ Error handling
✅ CORS enabled
✅ Health check endpoint
✅ Azure App Services optimized

## Prerequisites
- Azure subscription
- Azure App Service plan (Windows or Linux)
- MongoDB Atlas account or local MongoDB instance
- Git (for deployment)
- Node.js 24 LTS locally (for testing)

## Local Setup

### 1. Install Dependencies
```bash
cd todo-app
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=8080
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-db?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
```

### 3. Run Locally
```bash
npm start
# or with auto-reload in development:
npm run dev
```

Server will start on `http://localhost:8080`

## API Endpoints

### Health Check
```
GET /health
```
Returns: `{ "status": "healthy", "timestamp": "..." }`

### Authentication
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

### Todo Operations (All require Authorization header)
```
Authorization: Bearer <token>
```

#### Create Todo
```
POST /api/todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high",
  "dueDate": "2024-12-31"
}
```

#### Get All Todos
```
GET /api/todos
GET /api/todos?completed=true
GET /api/todos?completed=false
```

#### Get Single Todo
```
GET /api/todos/:id
```

#### Update Todo
```
PUT /api/todos/:id
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true,
  "priority": "medium"
}
```

#### Delete Todo
```
DELETE /api/todos/:id
```

## Azure App Services Deployment

### Step 1: Prepare MongoDB Connection String

1. Go to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Create a cluster or use existing one
3. Get connection string:
   - Click "Connect" > "Drivers" > "Node.js"
   - Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/todo-db?retryWrites=true&w=majority`
   - Replace `username`, `password`, and `todo-db` with your values

### Step 2: Create Azure App Service

#### Via Azure Portal:
1. Go to https://portal.azure.com
2. Click "Create a resource" > "App Service"
3. Fill in details:
   - **Subscription**: Choose your subscription
   - **Resource Group**: Create new or select existing
   - **Name**: `todo-app-youruniquename`
   - **Publish**: Code
   - **Runtime Stack**: Node 24 LTS
   - **Operating System**: Windows (recommended) or Linux
   - **Region**: Choose closest to you
   - **App Service Plan**: Choose or create (B1 free tier for testing)
4. Click "Review + Create" > "Create"

#### Via Azure CLI:
```bash
az group create --name myResourceGroup --location eastus

az appservice plan create \
  --name myAppServicePlan \
  --resource-group myResourceGroup \
  --sku B1 \
  --is-linux

az webapp create \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name todo-app-youruniquename \
  --runtime "NODE|24-lts"
```

### Step 3: Configure Application Settings

#### Via Azure Portal:
1. Open your App Service
2. Go to **Settings** > **Configuration**
3. Click **+ New application setting** and add:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/todo-db?retryWrites=true&w=majority` |
| `JWT_SECRET` | `your-super-secret-key-change-this-in-production` |
| `JWT_EXPIRE` | `7d` |
| `PORT` | `8080` |
| `HOST` | `0.0.0.0` |

4. Click **Save** > **Continue**

#### Via Azure CLI:
```bash
az webapp config appsettings set \
  --name todo-app-youruniquename \
  --resource-group myResourceGroup \
  --settings \
    NODE_ENV=production \
    MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/todo-db?retryWrites=true&w=majority" \
    JWT_SECRET="your-super-secret-key" \
    JWT_EXPIRE="7d" \
    PORT=8080 \
    HOST=0.0.0.0
```

### Step 4: Configure Node.js Settings

1. Go to **Settings** > **General**
2. Set **Stack settings**:
   - **Runtime**: Node 24 LTS
3. Click **Save**

### Step 5: Deploy Application

#### Option A: Git Deployment (Recommended)
```bash
# Initialize git (if not already done)
cd todo-app
git init
git add .
git commit -m "Initial commit"

# Get deployment credentials
az webapp deployment user set \
  --user-name <username> \
  --password <password>

# Get remote URL
az webapp deployment source config-local-git \
  --name todo-app-youruniquename \
  --resource-group myResourceGroup

# Add remote and push
git remote add azure <git-url-from-above>
git push azure main
```

#### Option B: Direct Upload via Azure Portal
1. Open your App Service
2. Go to **Deployment Center**
3. Select **Local Git** or **External Git**
4. Follow prompts to connect repository

#### Option C: Manual ZIP Deploy
```bash
# Prepare deployment
npm install --production
zip -r app.zip src/ node_modules/ package.json .deployment deploy.cmd web.config

# Deploy
az webapp deployment source config-zip \
  --resource-group myResourceGroup \
  --name todo-app-youruniquename \
  --src app.zip
```

### Step 6: Verify Deployment

1. Go to your App Service URL: `https://todo-app-youruniquename.azurewebsites.net`
2. Test health endpoint:
   ```
   GET https://todo-app-youruniquename.azurewebsites.net/health
   ```
3. Test registration:
   ```bash
   curl -X POST https://todo-app-youruniquename.azurewebsites.net/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
   ```

### Step 7: Enable Monitoring and Logging

1. Go to **Monitoring** > **App Service logs**
2. Enable:
   - Application logging (File System) - **Verbose**
   - Web server logging (File System)
3. Set retention to 7 days
4. View logs in **Monitoring** > **Log stream**

## Important Notes for Azure App Services

✅ **Port Configuration**: App is configured to listen on `0.0.0.0:8080` (Azure requirement)
✅ **web.config**: IIS configuration included for Windows App Services
✅ **Graceful Shutdown**: App handles SIGTERM for zero-downtime deployments
✅ **Health Check**: `/health` endpoint for monitoring
✅ **Environment Variables**: All sensitive data in application settings (never in code)
✅ **Connection Pooling**: MongoDB connection pooling enabled by default

## Troubleshooting

### App not starting
1. Check **Log stream** in Azure Portal
2. Verify all environment variables are set
3. Check MongoDB connection string
4. View error logs: `D:\home\LogFiles\Application`

### Connection to MongoDB fails
1. Verify MongoDB connection string in application settings
2. Whitelist Azure App Service IP in MongoDB Atlas
   - In MongoDB Atlas > Network Access
   - Add your App Service's outbound IP
   - Or allow `0.0.0.0/0` (less secure)

### High CPU/Memory usage
1. Check for memory leaks in logs
2. Review connection pool settings
3. Consider scaling up App Service plan
4. Enable Application Insights for detailed metrics

### JWT token issues
1. Ensure `JWT_SECRET` is set and consistent
2. Check token expiration in `JWT_EXPIRE`
3. Verify Authorization header format: `Authorization: Bearer <token>`

## Performance Optimization

For production:

1. **Enable compression** - Already in Express
2. **Use CDN** - Azure CDN for static assets
3. **Connection pooling** - Configured in Mongoose
4. **Caching** - Consider Redis for sessions
5. **Monitoring** - Enable Application Insights
6. **Alerts** - Set up alerts for high CPU/memory

## Next Steps

- [ ] Set up Application Insights for monitoring
- [ ] Configure auto-scaling based on metrics
- [ ] Set up automated backups for MongoDB
- [ ] Implement rate limiting
- [ ] Add request logging middleware
- [ ] Set up CI/CD pipeline with GitHub Actions
- [ ] Enable HTTPS (automatic with azurewebsites.net)

## Support

For issues with Azure App Services: https://docs.microsoft.com/azure/app-service/
For MongoDB issues: https://docs.mongodb.com/
For Node.js issues: https://nodejs.org/docs/
