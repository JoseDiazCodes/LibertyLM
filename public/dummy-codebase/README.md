# E-Commerce Application

A full-stack e-commerce application built with React, Node.js, Express, and MongoDB.

## Features

### Frontend
- **React 18** with modern hooks and context API
- **Responsive Design** with Tailwind CSS
- **Product Catalog** with search, filtering, and pagination
- **Shopping Cart** with persistent storage
- **User Authentication** with JWT tokens
- **Wishlist** functionality
- **Order Management** and tracking
- **Payment Integration** with Stripe
- **Real-time Notifications** with React Hot Toast

### Backend
- **RESTful API** with Express.js
- **Authentication & Authorization** with JWT
- **Password Security** with bcrypt
- **Rate Limiting** and security middleware
- **Input Validation** with express-validator
- **File Upload** support
- **Email Notifications** with Nodemailer
- **Database** with MongoDB and Mongoose

### Security Features
- **Password Hashing** with bcrypt (12 salt rounds)
- **JWT Token** authentication
- **Rate Limiting** on auth routes
- **Account Lockout** after failed login attempts
- **Input Validation** and sanitization
- **CORS** configuration
- **Secure Headers** middleware

## Project Structure

```
dummy-ecommerce-app/
├── frontend/                 # React frontend
│   ├── components/          # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React context providers
│   ├── pages/              # Page components
│   └── utils/              # Utility functions
├── backend/                # Node.js backend
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middleware
│   ├── controllers/       # Route controllers
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── uploads/               # File upload directory
└── docs/                 # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Products
- `GET /api/products` - Get all products (with pagination, search, filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (admin only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_PATH=./uploads
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
# Install dependencies
npm install

# Start MongoDB (if running locally)
mongod

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## Database Schema

### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['customer', 'admin', 'moderator']),
  profile: {
    avatar: String,
    phone: String,
    dateOfBirth: Date,
    gender: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    newsletter: Boolean,
    notifications: Boolean
  },
  isEmailVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date
}
```

### Product Model
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  salePrice: Number,
  category: String (required),
  subcategory: String (required),
  brand: String (required),
  sku: String (unique, required),
  images: [{ url: String, alt: String, isPrimary: Boolean }],
  inventory: {
    quantity: Number,
    lowStockThreshold: Number,
    trackInventory: Boolean
  },
  reviews: [{
    user: ObjectId,
    rating: Number (1-5),
    comment: String,
    helpful: [ObjectId],
    verified: Boolean
  }],
  averageRating: Number,
  reviewCount: Number,
  isActive: Boolean,
  isFeatured: Boolean,
  salesCount: Number,
  viewCount: Number
}
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user flow testing

## Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production-secret-key
FRONTEND_URL=https://yourdomain.com
```

### Build Commands
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Security Considerations

1. **Authentication**
   - JWT tokens with expiration
   - Password complexity requirements
   - Account lockout after failed attempts

2. **Data Validation**
   - Input sanitization
   - Schema validation with Mongoose
   - Request validation with express-validator

3. **Rate Limiting**
   - Auth endpoints: 5 requests per 15 minutes
   - API endpoints: 100 requests per 15 minutes

4. **Error Handling**
   - Detailed error logging
   - Generic error messages to clients
   - Proper HTTP status codes

## Performance Optimizations

1. **Database**
   - Proper indexing on frequently queried fields
   - Query optimization
   - Connection pooling

2. **Frontend**
   - Code splitting with React.lazy
   - Image optimization and lazy loading
   - Component memoization

3. **API**
   - Response compression
   - Caching strategies
   - Pagination for large datasets

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@ecommerce-app.com or create an issue in the repository.