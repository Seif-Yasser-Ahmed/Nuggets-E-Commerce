# Nuggets E-Commerce Platform

A comprehensive e-commerce platform with user and admin interfaces, product management, cart functionality, order processing, and more.

## Table of Contents

- [Overview](#overview)
- [Team Members](#team-members)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  [- Prerequisites](#prerequisites)
  [- Installation](#installation)
  [- Configuration](#configuration)
  [- Running the Application](#running-the-applicatio)
- [Database Schema](#database-schema)
- [Frontend Overview](#frontend-overview)
- [Backend Overview](#backend-overview)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Security Considerations](#security-considerations)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Overview

Nuggets is a full-stack e-commerce application built with React for the frontend and Node.js/Express for the backend. It provides a complete shopping experience with product browsing, user authentication, shopping cart, wishlists, order management, and an admin dashboard for managing products, users, and orders.

## Team Members

> - [Seif Yasser](https://github.com/Seif-Yasser-Ahmed)
> - [Omar Ahmed](https://github.com/Omarbayom)
> - [Youssef Tamer](https://github.com/JoeCode11)
> - [Mohamed Salah](https://github.com/Salah1174)
> - [Salma Hisham](https://github.com/salma-h-wagdy)
> - [Salma Youssef](https://github.com/ssalma2002)

## Features

### User Features
- **Authentication**: Sign up, sign in, password recovery
- **Product Browsing**: View products, filter by categories, search functionality
- **User Profiles**: Manage personal information, view order history
- **Shopping Cart**: Add, remove, and update items
- **Wishlist**: Save products for later
- **Checkout Process**: Multiple payment methods, shipping information
- **Order Tracking**: View status of orders
- **Product Reviews**: Leave ratings and comments

### Admin Features
- **Dashboard**: Overview of sales and activities
- **User Management**: View, edit, and manage user accounts
- **Product Management**: Add, edit, delete products with variants (colors, sizes)
- **Order Management**: View and update order statuses
- **Analytics**: Basic sales and user statistics

## Project Structure

```
Nuggets/
├── client/                  # React frontend
│   ├── public/              # Static files
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── contexts/        # React context providers
│       ├── pages/           # Page components
│       │   └── Admin/       # Admin dashboard pages
│       ├── routes/          # Route components
│       ├── services/        # API service modules
│       └── utils/           # Utility functions
│
└── server/                  # Node.js backend
    ├── controllers/         # Request handlers
    ├── middlewares/         # Express middlewares
    ├── models/              # Database models
    ├── routes/              # API routes
    └── uploads/             # File storage for uploads
```

## Technologies Used

### Frontend
- React
- React Router
- Joy UI & Material UI
- Axios
- JWT Authentication
- Context API for state management

### Backend
- Node.js
- Express
- MySQL
- JSON Web Tokens (JWT)
- Multer (file uploads)
- Bcrypt (password hashing)

## Getting Started

### Prerequisites
- Node.js (v14+)
- MySQL Server
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/nuggets.git
cd nuggets
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

### Configuration

1. Create a `.env` file in the server directory with the following variables:
```
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=nuggets_db
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=1h
```

2. Set up the database
```bash
# Create database and tables using the SQL scripts
# (SQL scripts should be provided in a separate file)
```

### Running the Application

1. Start the backend server
```bash
cd server
node server.js
```

2. Start the frontend development server
```bash
cd client
npm run start
```

3. Access the application at `http://localhost:3000`

## Database Schema

### Core Tables
- **user**: User account information
  - id, username, email, password, first_name, last_name, telephone, isAdmin, personal_image, social_links, created_at

- **product**: Product information
  - id, name, description, price, category, image_url, stock, discount, rating, review_count, specs, colors, sizes, created_at

- **cart**: Shopping cart items
  - id, user_id, product_id, quantity, created_at

- **order**: Order information
  - id, user_id, shipping_address, billing_address, payment_method, status, total_amount, created_at

- **order_item**: Items within an order
  - id, order_id, product_id, quantity, price, name, image_url

- **wishlist**: User's saved products
  - id, user_id, product_id, created_at

- **reviews**: Product reviews
  - id, product_id, user_id, rating, comment, created_at

## Frontend Overview

The frontend is built using React with the following key components:

### Public Pages
- **Home**: Landing page with featured products and promotions
- **Store**: Product browsing with filters and search functionality
- **Item**: Detailed product view with specifications and reviews
- **Sign In/Sign Up**: User authentication forms

### Protected Pages
- **Profile**: User profile management and activity history
- **Cart**: Shopping cart management
- **Checkout**: Order completion process
- **Admin Dashboard**: Administration interface (restricted to admin users)

### State Management
- Uses React's Context API for theme and authentication state
- Local component state with useState for component-specific data
- localStorage for persistent authentication data

## Backend Overview

The backend is built with Express.js and follows a modular architecture:

### API Structure
- RESTful API with versioned endpoints (`/api/v1/`)
- JWT-based authentication middleware
- Role-based access control (user vs admin)
- MySQL database for data persistence

### Key Modules
- **Authentication**: User registration, login, and token management
- **User Management**: Profile operations and wishlist functionality
- **Product Management**: CRUD operations for products and categories
- **Cart Management**: Shopping cart operations
- **Order Processing**: Order creation and management
- **File Uploads**: Image storage for products and user profiles

## API Endpoints

### Authentication
- `POST /api/v1/users/signin`: User login
- `POST /api/v1/users/signup`: User registration

### User
- `GET /api/v1/users/:userId`: Get user profile
- `PUT /api/v1/users/:userId`: Update user profile
- `PUT /api/v1/users/:userId/social`: Update social links

### Products
- `GET /api/v1/products`: List all products
- `GET /api/v1/products/:productId`: Get product details
- `GET /api/v1/products/categories`: List product categories

### Cart
- `GET /api/v1/cart/:userId`: Get user's cart
- `POST /api/v1/cart`: Add item to cart
- `PUT /api/v1/cart/:cartItemId`: Update cart item quantity
- `DELETE /api/v1/cart/:cartItemId`: Remove item from cart

### Wishlist
- `GET /api/v1/wishlist/:userId`: Get user's wishlist
- `POST /api/v1/wishlist`: Add item to wishlist
- `DELETE /api/v1/wishlist/:userId/:productId`: Remove item from wishlist

### Orders
- `POST /api/v1/orders`: Create a new order
- `GET /api/v1/orders/:userId`: Get user's orders
- `GET /api/v1/orders/:orderId/details`: Get order details

### Admin
- `GET /api/v1/admin/users`: List all users (admin only)
- `PUT /api/v1/admin/users/:userId/admin-status`: Update user admin status
- `GET /api/v1/admin/orders`: List all orders (admin only)
- `PUT /api/v1/admin/orders/:orderId`: Update order status

## Authentication Flow

1. User signs in via `/api/v1/users/signin` with username/password
2. Server validates credentials and returns a JWT token
3. Client stores the token in localStorage
4. Token is sent with subsequent requests via Authorization header
5. Server middleware validates the token for protected routes

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens for stateless authentication
- Role-based access control for admin functions
- Input validation for all form submissions
- Secure handling of file uploads
- CORS configuration for API protection

## Future Enhancements

- Payment gateway integration
- Email notifications for orders
- Advanced product filtering and search
- User address book
- Social media authentication
- Product recommendations
- Mobile app version
- Performance optimizations
- Multi-language support


## License

MIT License

Copyright (c) 2025 Nuggets Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Similar code found with 4 license types
