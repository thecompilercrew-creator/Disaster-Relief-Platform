# 🔌 API Documentation

## Base URL
```
https://your-backend-url.com/api
```

---

## Authentication

### POST /auth/register
Create a new user account.

**Body:**
```json
{ "name": "John", "email": "john@mail.com", "password": "******" }
```

---

### POST /auth/login
Authenticate user and return JWT.

**Response:**
```json
{ "token": "jwt_token_here" }
```

---

## Help Requests

### POST /requests
Create a help request.

### GET /requests
Fetch all requests.

### PUT /requests/:id
Edit request (address, urgency, details).

### POST /requests/:id/volunteer
Volunteer for a request.

---

## Resources

### POST /resources
Add a resource.

### GET /resources
Fetch available resources.

### PUT /resources/:id
Edit resource details.

---

## News

### GET /news
Fetch latest disaster-related news (RSS proxied).

---

## Error Format
```json
{ "error": "Message describing the issue" }
```

---

## Authentication Header
```
Authorization: Bearer <JWT_TOKEN>
```

