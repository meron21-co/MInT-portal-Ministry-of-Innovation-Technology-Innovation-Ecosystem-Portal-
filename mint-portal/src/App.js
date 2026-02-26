import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import Home from "./pages/HomePage";
import InventorDashboard from "./pages/Dashboard/InventorDashboard";
import InvestorDashboard from "./pages/Dashboard/InvestorDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import Login from "./pages/login";
import Register from "./pages/Register";
import { AuthContext, AuthProvider } from "./pages/AuthContext";

// ---------- Protected Route Component ----------
function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    // not logged in → go to login
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // logged in but wrong role → go home
    return <Navigate to="/" replace />;
  }

  return children;
}

// ---------- App Component ----------
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/inventor"
              element={
                <ProtectedRoute role="inventor">
                  <InventorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investor"
              element={
                <ProtectedRoute role="investor">
                  <InvestorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
