# web_tech_project_frontend_acity_eats
# ACITY EATS - Campus Food Ordering System

## Project Overview

ACITY EATS is a comprehensive web-based food ordering system designed for Academic City University. The platform enables students and staff to browse menu items, place orders (Inhouse or Delivery), track order status, and manage their order history. Administrators can manage menu items, update order statuses, and view detailed statistics through a dedicated admin dashboard.

### Key Functionality

- **User Authentication**: Secure registration and login system with JWT-based authentication
- **Menu Browsing**: Browse available food items with categories (Meals, Noodles, Sandwich, Burger, Drinks)
- **Shopping Cart**: Add items to cart, adjust quantities, and view totals
- **Order Placement**: Place orders with order type selection (Inhouse/Delivery)
- **Order Management**: View order history, track order status (Pending, Preparing, Ready, Completed)
- **Admin Dashboard**: Complete admin panel for managing orders, menu items, and viewing statistics
- **Real-time Updates**: Order status updates and menu availability management

---

## Deployment Links

### Frontend (GitHub Pages)
🔗 **Live URL**: [https://benittaafriyie-svg.github.io/web_tech_project_frontend_acity_eats/]

### Backend (Render)
🔗 **API URL**: [https://web-tech-project-backend-acity-eats.onrender.com]

---

## Login Details

### Regular User Account
Create Student Account

### Admin Account
- **Email**: `benitta.afriyie@acity.edu.gh`
- **Password**: `123456`

---

## Feature Checklist

### User Features
- ✅ User Registration
- ✅ User Login/Logout
- ✅ Browse Menu Items
- ✅ Filter by Category (All, Meals, Drinks, Snacks)
- ✅ View Item Details
- ✅ Add Items to Cart
- ✅ Update Cart Quantities
- ✅ Remove Items from Cart
- ✅ View Cart Total
- ✅ Place Orders (Inhouse/Delivery)
- ✅ View Order History
- ✅ Track Order Status
- ✅ Filter Orders by Status

### Admin Features
- ✅ Admin Dashboard
- ✅ View All Orders
- ✅ Update Order Status
- ✅ Filter Orders by Type (Inhouse/Takeout)
- ✅ Add Menu Items
- ✅ Edit Menu Items
- ✅ Delete Menu Items
- ✅ View Statistics (Total Orders, Revenue, etc.)
- ✅ Manage Menu Item Availability

### Technical Features
- ✅ JWT Authentication
- ✅ RESTful API
- ✅ PostgreSQL Database
- ✅ Responsive Design
- ✅ Error Handling
- ✅ Input Validation
- ✅ Secure Password Hashing

---

## Installation Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone [your-backend-repo-url]
   cd campus-food-ordering-system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `backend` directory:
   ```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DATABASE_URL="postgresql://benitta:46yqYXHBhVVCg0a7yNlStsUJEpL78Avb@dpg-d4p87s2li9vc73aud030-a.frankfurt-postgres.render.com/acity_eats?sslmode=require"


# For Render.com PostgreSQL (use Internal Database URL):
# DATABASE_URL=postgresql://campus_food_user:password@dpg-xxxxx.oregon-postgres.render.com/campus_food

# JWT Secret (generate a random string of at least 32 characters)
JWT_SECRET="0f377d7d618abfebf456d05b073e7b41489c92e42604891a2a5b6e083032f71d"

# CORS Configuration (optional)
ALLOWED_ORIGINS=http://localhost:3000

   ```

4. **Set up the database**
   - Create a PostgreSQL database
   - Run the database schema/migration scripts (if available)
   - Or create tables manually based on the schema

5. **Run database migrations** (if applicable)
   ```bash
   # Update category from Momo to Meals
   psql -U your_username -d your_database -f migrations/update_momo_to_meals.sql
   
   # Add order_type column (if needed)
   psql -U your_username -d your_database -f migrations/add_order_type.sql
   ```

6. **Start the server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone [your-frontend-repo-url]
   cd campus-food-ordering-system/frontend
   ```

2. **Update API URL** (if running locally)
   - Open `js/auth.js`, `js/orders.js`, `js/admin.js`
   - Update `API_URL` to point to your backend:
   ```javascript
   const API_URL = 'http://localhost:5000/api';
   // Or use your deployed backend URL
   // const API_URL = 'https://your-backend-url.onrender.com/api';
   ```

3. **Serve the frontend**
   - Option 1: Use a local server (Python)
     ```bash
     python -m http.server 8000
     ```
   - Option 2: Use a Node.js server
     ```bash
     npx http-server -p 8000
     ```
   - Option 3: Use VS Code Live Server extension
   - Option 4: Deploy to GitHub Pages

4. **Access the application**
   Open `http://localhost:8000` in your browser

---

## Project Structure

### Backend
```
backend/
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── menu.js          # Menu item routes
│   ├── orders.js        # Order routes
│   └── admin.js         # Admin routes
├── middleware/
│   └── auth.js          # Authentication middleware
├── db/
│   └── index.js         # Database connection
├── migrations/           # Database migration scripts
├── server.js            # Main server file
├── package.json         # Dependencies
└── .env                 # Environment variables
```

### Frontend
```
frontend/
├── index.html           # Home page
├── login.html           # Login page
├── register.html        # Registration page
├── orders.html          # Order history page
├── admin.html           # Admin dashboard
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   ├── auth.js         # Authentication logic
│   ├── menu.js         # Menu display logic
│   ├── cart.js         # Cart management
│   ├── orders.js       # Order history
│   ├── admin.js        # Admin dashboard
│   └── api.js          # API utilities
└── images/              # Static images
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID
- `GET /api/menu/category/:category` - Get items by category

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `DELETE /api/orders/:id` - Cancel order

### Admin
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/menu` - Get all menu items
- `POST /api/admin/menu` - Add menu item
- `PUT /api/admin/menu/:id` - Update menu item
- `DELETE /api/admin/menu/:id` - Delete menu item
- `GET /api/admin/stats` - Get dashboard statistics

---

## Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Github Pages

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (JSON Web Tokens)
- bcryptjs (Password Hashing)
- CORS

---

## Database Schema

### Tables
- `users` - User accounts
- `menu_items` - Food menu items
- `orders` - Order records
- `order_items` - Individual items in orders

---


## License

This project is licensed under the ISC License.

---

## Contact

For questions or support, please open an issue in the repository.

---

## Acknowledgments

- Academic City University
- All contributors and testers
