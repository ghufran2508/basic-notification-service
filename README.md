# 🔔 Notification Service - Production Ready

A high-performance, real-time notification service built with Node.js, TypeScript, WebSockets, TypeORM, and SQLite3.

## 🎯 Features

- ✅ Real-time notifications via WebSockets
- ✅ REST API for notification management
- ✅ Mark notifications as read/unread
- ✅ Bulk notification creation
- ✅ Notification filtering and pagination
- ✅ Unread count tracking
- ✅ Statistics and analytics
- ✅ WebSocket connection health monitoring
- ✅ Graceful shutdown handling
- ✅ TypeScript for type safety
- ✅ TypeORM with SQLite for data persistence

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │◄───────►│    Server    │◄───────►│  Database   │
│  (React)    │         │   (Express)  │         │  (SQLite)   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │
      │                        │
      │                        ▼
      │                 ┌─────────────┐
      └────WebSocket───►│ WS Service  │
                        └─────────────┘
```

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone or create the project
mkdir notification-service && cd notification-service

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=3000
DATABASE_PATH=./database.sqlite
NODE_ENV=development
CORS_ORIGIN=*
EOF

# Build TypeScript
npm run build

# Start development server
npm run dev

# Or start production server
npm start
```

## 📡 API Documentation

### Base URL
```
HTTP: http://localhost:3000/api
WebSocket: ws://localhost:3000
```

---

## 🔔 Notification Endpoints

### 1. Create Notification
```http
POST /api/notifications
Content-Type: application/json

{
  "user_id": "user123",
  "title": "New Message",
  "message": "You have a new message from John",
  "type": "info"  // info | success | warning | error | system
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "notif-uuid-123",
    "user_id": "user123",
    "title": "New Message",
    "message": "You have a new message from John",
    "type": "info",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "readAt": null
  },
  "message": "Notification created and sent successfully"
}
```

### 2. Create Bulk Notifications
```http
POST /api/notifications/bulk
Content-Type: application/json

{
  "notifications": [
    {
      "user_id": "user123",
      "title": "Welcome",
      "message": "Welcome to our service!",
      "type": "success"
    },
    {
      "user_id": "user123",
      "title": "Getting Started",
      "message": "Here's how to get started...",
      "type": "info"
    }
  ]
}
```

### 3. Get User Notifications
```http
GET /api/notifications/user/:user_id?unreadOnly=false&limit=20&offset=0
```

**Query Parameters:**
- `unreadOnly` (boolean): Filter only unread notifications
- `limit` (number): Number of notifications per page
- `offset` (number): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

### 4. Get Single Notification
```http
GET /api/notifications/:id?user_id=user123
```

### 5. Mark Notification as Read
```http
PATCH /api/notifications/:id/read
Content-Type: application/json

{
  "user_id": "user123"
}
```

### 6. Mark All as Read
```http
PATCH /api/notifications/user/:user_id/read-all
```

### 7. Update Notification
```http
PUT /api/notifications/:id
Content-Type: application/json

{
  "user_id": "user123",
  "title": "Updated Title",
  "message": "Updated message",
  "isRead": true
}
```

### 8. Delete Notification
```http
DELETE /api/notifications/:id?user_id=user123
```

### 9. Delete All User Notifications
```http
DELETE /api/notifications/user/:user_id/all
```

### 10. Get Unread Count
```http
GET /api/notifications/user/:user_id/unread-count
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### 11. Get Notification Statistics
```http
GET /api/notifications/user/:user_id/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "unread": 15,
    "byType": {
      "info": 50,
      "success": 20,
      "warning": 15,
      "error": 10,
      "system": 5
    }
  }
}
```

---

## 🔌 WebSocket Communication

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connected to notification service');
  
  // Subscribe to notifications for a user
  ws.send(JSON.stringify({
    type: 'subscribe',
    payload: { user_id: 'user123' }
  }));
};
```

### Message Types

#### Subscribe
```json
{
  "type": "subscribe",
  "payload": {
    "user_id": "user123"
  }
}
```

#### Unsubscribe
```json
{
  "type": "unsubscribe",
  "payload": {
    "user_id": "user123"
  }
}
```

#### Ping (Health Check)
```json
{
  "type": "ping"
}
```

### Receiving Notifications
```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'notification') {
    console.log('New notification:', message.payload);
    // Update UI with new notification
  }
};
```

**Notification Payload:**
```json
{
  "type": "notification",
  "payload": {
    "id": "notif-uuid-123",
    "user_id": "user123",
    "title": "New Message",
    "message": "You have a new message",
    "type": "info",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🧪 Testing Guide

### 1. Test Notification Creation
```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-1",
    "title": "Test Notification",
    "message": "This is a test notification",
    "type": "info"
  }'
```

### 2. Test WebSocket (Node.js)
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('Connected');
  
  // Subscribe
  ws.send(JSON.stringify({
    type: 'subscribe',
    payload: { user_id: 'test-user-1' }
  }));
});

ws.on('message', (data) => {
  console.log('Received:', JSON.parse(data.toString()));
});
```

### 3. Test WebSocket (Browser)
Open browser console and run:
```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    payload: { user_id: 'test-user-1' }
  }));
};

ws.onmessage = (e) => {
  console.log('Notification:', JSON.parse(e.data));
};
```

---

## 🎨 Frontend Integration Example (React)

```typescript
import { useEffect, useState } from 'react';

function NotificationComponent({ user_id }) {
  const [notifications, setNotifications] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Fetch initial notifications
    fetch(`http://localhost:3000/api/notifications/user/${user_id}`)
      .then(res => res.json())
      .then(data => setNotifications(data.data));

    // Connect to WebSocket
    const websocket = new WebSocket('ws://localhost:3000');
    
    websocket.onopen = () => {
      websocket.send(JSON.stringify({
        type: 'subscribe',
        payload: { user_id }
      }));
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'notification') {
        setNotifications(prev => [message.payload, ...prev]);
      }
    };

    setWs(websocket);

    return () => websocket.close();
  }, [user_id]);

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Performance Features

- **Connection Pooling**: WebSocket connections are managed efficiently
- **Heartbeat Monitoring**: Automatic cleanup of dead connections every 30s
- **Database Indexing**: Optimized queries with proper indexes
- **Pagination Support**: Handle large notification lists efficiently
- **Bulk Operations**: Create multiple notifications in one request

---

## 🔒 Security Considerations

For production deployment, consider adding:
- JWT authentication middleware
- Rate limiting
- Input validation with Joi/Zod
- HTTPS/WSS encryption
- CORS restrictions
- SQL injection protection (handled by TypeORM)

---

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR DEFAULT 'info',
  isRead BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  readAt DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_userId_createdAt ON notifications(user_id, createdAt);
CREATE INDEX idx_userId_isRead ON notifications(user_id, isRead);
```

---

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Check firewall settings
- Verify port 3000 is not in use
- Ensure CORS is properly configured

### Database Issues
- Delete `database.sqlite` and restart to reset
- Check file permissions
- Ensure SQLite3 is properly installed

### TypeScript Compilation Errors
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript version compatibility
- Clear `dist/` folder and rebuild

---

## 📦 Production Deployment

```bash
# Build for production
npm run build

# Set environment variables
export NODE_ENV=production
export PORT=3000
export DATABASE_PATH=/var/data/notifications.sqlite

# Start with PM2
pm2 start dist/server.js --name notification-service

# Or with Docker
docker build -t notification-service .
docker run -p 3000:3000 notification-service
```

---

## 🎯 Next Steps

Enhancements you can add:
- [ ] Redis for pub/sub in multi-server setup
- [ ] PostgreSQL/MySQL for production
- [ ] Push notifications (Firebase, APNS)
- [ ] Email notifications
- [ ] Notification templates
- [ ] Scheduled notifications
- [ ] Notification preferences per user
- [ ] Admin dashboard
- [ ] Analytics and metrics

---

## 📄 License

MIT

## 👨‍💻 Author

Built with ❤️ for production-ready notification systems