# Lead Management System

A Lead management system built with React.js and Django REST Framework.

## 🚀 Features

- **Authentication System**: Secure login with JWT tokens
- **Lead Management**: Create, update, and track leads
- **Status Tracking**: Visual status management with color-coded indicators
- **Modern UI**: responsive interface with smooth animations
- **Real-time Updates**: Dynamic status changes without page refresh

## 🛠 Tech Stack

### Frontend
- **React.js 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **Axios** for API calls
- **React Router** for navigation

### Backend
- **Django 4.2** with Django REST Framework
- **JWT Authentication** with djangorestframework-simplejwt
- **SQLite** database (easily configurable for PostgreSQL/MySQL)
- **Django CORS Headers** for cross-origin requests

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)
- npm or yarn

## 🔧 Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Start the development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Leads
- `GET /api/leads/` - Get all leads
- `POST /api/leads/` - Create a new lead
- `GET /api/leads/{id}/` - Get a specific lead
- `PUT /api/leads/{id}/` - Update a lead
- `PATCH /api/leads/{id}/` - Partial update (status change)
- `DELETE /api/leads/{id}/` - Delete a lead

## 🎨 Lead Status Colors

- **New Lead**: Gray (`#6B7280`)
- **Lead Sent**: Blue (`#3B82F6`)
- **Deal Done**: Green (`#10B981`)

## 🔐 Default Login Credentials

For testing purposes, you can create a superuser or use these test credentials:
- Email: `admin@example.com`
- Password: `admin123`

## 📱 Features Overview

### Authentication
- Secure JWT-based authentication
- Token refresh mechanism
- Protected routes

### Lead Management
- Create leads with Name, Phone, Email, and Lead Source
- Default status: "New Lead"
- Visual status indicators with color coding
- Status change functionality with smooth animations

### UI/UX
- Responsive design for all screen sizes
- Smooth animations and transitions
- Modern card-based layout
- Interactive status badges
- Loading states and error handling

## 🔄 Development Workflow

1. Make changes to the backend or frontend
2. The development servers will automatically reload
3. Test your changes in the browser
4. Check the Django admin panel at `http://localhost:8000/admin/` for backend data

## 🚀 Production Deployment

### Backend
- Configure environment variables
- Use PostgreSQL or MySQL for production
- Set up proper CORS settings
- Configure static file serving

### Frontend
- Build the production bundle: `npm run build`
- Deploy to a CDN or static hosting service
- Update API endpoints to production URLs

## 🧪 Testing

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm test
```

## 📝 License

This project is licensed under the MIT License.



