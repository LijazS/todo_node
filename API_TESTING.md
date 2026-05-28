// API Testing Examples
// Use these with Postman, curl, or any HTTP client

// ==========================
// 1. HEALTH CHECK
// ==========================
GET http://localhost:8080/health


// ==========================
// 2. AUTHENTICATION
// ==========================

// REGISTER
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response includes: token, user data

---

// LOGIN
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

// Save the returned token for use in other requests


// ==========================
// 3. TODO OPERATIONS
// ==========================

// Note: Replace {TOKEN} with actual JWT token from login/register
// Authorization header format: "Bearer {TOKEN}"

// CREATE TODO
POST http://localhost:8080/api/todos
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, cheese",
  "priority": "high",
  "dueDate": "2024-12-31"
}

---

// GET ALL TODOS
GET http://localhost:8080/api/todos
Authorization: Bearer {TOKEN}

// Optional query parameters:
// GET http://localhost:8080/api/todos?completed=true
// GET http://localhost:8080/api/todos?completed=false

---

// GET SINGLE TODO
GET http://localhost:8080/api/todos/{TODO_ID}
Authorization: Bearer {TOKEN}

---

// UPDATE TODO
PUT http://localhost:8080/api/todos/{TODO_ID}
Content-Type: application/json
Authorization: Bearer {TOKEN}

{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "priority": "low",
  "dueDate": "2024-12-25"
}

---

// DELETE TODO
DELETE http://localhost:8080/api/todos/{TODO_ID}
Authorization: Bearer {TOKEN}


// ==========================
// CURL EXAMPLES
// ==========================

# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get todos (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/todos

# Create todo
curl -X POST http://localhost:8080/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Buy groceries","priority":"high"}'

# Update todo
curl -X PUT http://localhost:8080/api/todos/TODOID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"completed":true}'

# Delete todo
curl -X DELETE http://localhost:8080/api/todos/TODOID \
  -H "Authorization: Bearer TOKEN"
