// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Profile from './pages/Profile';
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import Dashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/Users';
import Logs from './pages/Admin/Logs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />

        {/* 🔐 Protected User Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 🔐 Admin Only Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/logs" element={<Logs />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;