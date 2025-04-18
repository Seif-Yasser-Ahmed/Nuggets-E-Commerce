// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Store from './pages/Store';
import Checkout from './pages/Checkout';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import Dashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/Users';
import Products from './pages/Admin/Products';
import Orders from './pages/Admin/Orders';
import Logs from './pages/Admin/Logs';
import Reset from './pages/Reset';
import Item from './pages/Item';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/item/:id" element={<Item />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/store" element={<Store />} />

            {/* 🔐 Protected User Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>

            {/* 404 Not Found route for user routes */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* 🔐 Admin Only Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/dashboard/users" element={<Users />} />
            <Route path="/admin/dashboard/products" element={<Products />} />
            <Route path="/admin/dashboard/orders" element={<Orders />} />
            <Route path="/admin/dashboard/logs" element={<Logs />} />
          </Route>

          {/* Catch-all for any other routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;