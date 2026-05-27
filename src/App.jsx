import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Homepage from './pages/Homepage/Homepage'
import PetProfile from './pages/PetProfile/PetProfile'
import PetHealthRecord from './pages/PetHealthRecord/PetHealthRecord'
import Purchases from './pages/Purchases/Purchases'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import PetGrooming from './pages/PetGrooming/PetGrooming'
import UserProfile from './pages/UserProfile/UserProfile'
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
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Nếu chưa đăng nhập, chuyển hướng tới login */}
        <Route
          path="/"
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
        {/* Trang login/register - có thể truy cập bất kỳ khi nào */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
