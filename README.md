# DevHub - Developer Community Platform

A comprehensive platform where developers can create profiles, share knowledge, bookmark resources, and connect through real-time chat.

## 🚀 Features

### Frontend (React + Redux)
- **Authentication & Authorization**: JWT-based login/signup with protected routes
- **Multi-step Profile Wizard**: Comprehensive profile creation with progress tracking
- **Post Feed**: Infinite scroll with markdown support for code snippets
- **Nested Comments**: Hierarchical comment system with optimistic updates
- **Resource Bookmarking**: Save trending repositories with offline sync
- **Private Chat**: Real-time messaging with online indicators
- **Analytics Dashboard**: Track your activity and engagement
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Mobile-first design that works on all devices

### Backend (Node.js + Express + MongoDB + Redis)
- **User Management**: JWT authentication with refresh tokens
- **Post & Comment System**: Rich-text support with nested comments
- **RapidAPI Integration**: Fetch trending GitHub repositories
- **Real-time Chat**: Socket.io for private messaging
- **Caching**: Redis for API responses and chat messages
- **Security**: Rate limiting, input sanitization, IP blocking
- **Analytics**: User activity tracking and insights

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Redux Toolkit, Tailwind CSS, Socket.io Client
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS with dark mode support

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Redis (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd devhub
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/devhub
REDIS_URI=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key_here
REFRESH_SECRET=your_refresh_secret_key_here
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
RAPIDAPI_KEY=your_rapidapi_key_here
FRONTEND_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
devhub/
├── backend/
│   ├── config/          # Database and Redis configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   └── server.ts        # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── slices/      # Redux slices
│   │   ├── types/       # TypeScript types
│   │   └── store.ts     # Redux store
│   └── public/          # Static assets
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Posts
- `GET /api/posts/feed` - Get post feed with pagination
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/comment` - Add comment
- `GET /api/posts/user/:userId` - Get user's posts

### Resources & Bookmarks
- `GET /api/resources/trending` - Get trending repositories
- `POST /api/bookmarks` - Bookmark resource
- `GET /api/bookmarks` - Get user bookmarks

### Chat & Users
- `GET /api/users/search` - Search users
- `GET /api/chat/rooms` - Get chat rooms
- `GET /api/chat/messages/:chatId` - Get chat messages

### Analytics
- `GET /api/analytics` - Get user analytics
- `GET /api/analytics/global` - Get global analytics

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend (Render)
1. Create account on Render
2. Connect your repository
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Create account on Vercel
2. Connect your repository
3. Set build command: `cd frontend && npm run build`
4. Set output directory: `frontend/dist`
5. Deploy

### Redis (Upstash)
1. Create account on Upstash
2. Create Redis database
3. Update `REDIS_URI` in environment variables

## 🔒 Security Features

- JWT authentication with refresh tokens
- Input sanitization to prevent XSS/SQL injection
- Rate limiting per user and IP
- IP blocking for suspicious activity
- CORS configuration
- Password hashing with bcrypt

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## 🎨 UI/UX Features

- Clean, modern developer-focused design
- Dark/Light theme toggle
- Smooth animations and transitions
- Loading states and error handling
- Intuitive navigation
- Mobile-friendly chat interface
- Progress indicators for multi-step forms

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@devhub.com or create an issue in the repository.

## 🔗 Links

- [Live Demo](https://dev-hub-orpin-rho.vercel.app/)
- [Postman Collection](./postman_collection.json)

---

Built with ❤️ by the DevHub Team