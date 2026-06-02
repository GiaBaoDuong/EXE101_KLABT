import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Homepage from './pages/Homepage/Homepage'
import Products from './pages/Products/Products'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import Services from './pages/Services/Services'
import PetProfile from './pages/PetProfile/PetProfile'
import PetHealthRecord from './pages/PetHealthRecord/PetHealthRecord'
import Purchases from './pages/Purchases/Purchases'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import PetGrooming from './pages/PetGrooming/PetGrooming'
import UserProfile from './pages/UserProfile/UserProfile'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import Staff from './pages/Staff/Staff'
import Notifications from './pages/Notifications/Notifications'
import { useAuth } from './context/AuthContext'
import './App.css'

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #e0e0e0',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function App() {
  const { isAuthenticated, isLoading, user } = useAuth()

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Default - Login Page */}
        <Route path="/" element={<Login />} />
        {/* Products - Public */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/services" element={<Services />} />
        {/* Auth Required */}
        <Route
          path="/home"
          element={isAuthenticated ? <Homepage /> : <Navigate to="/login" />}
        />
        <Route
          path="/pet-profile"
          element={isAuthenticated ? <PetProfile /> : <Navigate to="/login" />}
        />
        <Route
          path="/health-record"
          element={isAuthenticated ? <PetHealthRecord /> : <Navigate to="/login" />}
        />
        <Route
          path="/purchases"
          element={isAuthenticated ? <Purchases /> : <Navigate to="/login" />}
        />
        <Route
          path="/grooming"
          element={isAuthenticated ? <PetGrooming /> : <Navigate to="/login" />}
        />
        <Route
          path="/user-profile"
          element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />}
        />
        {/* Admin Dashboard - cho Admin & Staff */}
        <Route
          path="/admin"
          element={
            isAuthenticated
              ? <AdminDashboard />
              : <Navigate to="/login" />
          }
        />
        {/* Staff Dashboard */}
        <Route
          path="/staff"
          element={
            isAuthenticated
              ? <Staff />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/notifications"
          element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />}
        />
        {/* Login/Register - công khai */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
