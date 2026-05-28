# Todo Application - README

## Quick Start

### Installation
```bash
npm install
```

### Configuration
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Todo Endpoints (requires JWT token)
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create todo
- `GET /api/todos/:id` - Get single todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## Environment Variables
```
NODE_ENV=development
PORT=8080
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
```

## Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive Azure App Services deployment instructions.

## License
ISC
