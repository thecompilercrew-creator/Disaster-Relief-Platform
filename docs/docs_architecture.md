# 🏗️ System Architecture

## Overview
The Disaster Relief Platform follows a **client–server architecture** designed for scalability, reliability, and rapid response during emergencies.

The system is divided into:
- Frontend (Presentation Layer)
- Backend (Application Layer)
- Database (Persistence Layer)
- External Services (Maps, AI, News)

---

## High-Level Architecture

```
Browser (User)
   ↓ HTTPS
Frontend (HTML, CSS, JS)
   ↓ REST API (JWT)
Backend (Node.js + Express)
   ↓ ODM
MongoDB Database

External Integrations:
- Leaflet + OpenStreetMap (Maps)
- Nominatim (Geocoding)
- Google Gemini API (AI)
- Google News RSS (News)
```

---

## Component Breakdown

### Frontend
- Single-page style navigation using hash routing
- Modular JS functions for tabs (Requests, Resources, Map, Gemini, News)
- LocalStorage for session persistence
- Responsive, card-based UI

### Backend
- RESTful API design
- JWT-based authentication middleware
- Controllers for requests, resources, users, and news
- Input validation and error handling

### Database
- MongoDB collections:
  - Users
  - HelpRequests
  - Resources
- Indexed geolocation fields for map queries (future-ready)

---

## Security Considerations
- Password hashing
- JWT expiration and verification
- Controlled access to sensitive contact details

---

## Scalability Notes
- Stateless backend (horizontal scaling)
- CDN-ready frontend
- Cacheable external API responses

---

## Future Architecture Enhancements
- WebSockets for real-time updates
- Redis caching
- Role-based access control (RBAC)
- Microservices split (optional)

