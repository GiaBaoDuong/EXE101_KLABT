import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Homepage from './pages/Homepage/Homepage'
import PetProfile from './pages/PetProfile/PetProfile'
import PetHealthRecord from './pages/PetHealthRecord/PetHealthRecord'
import Purchases from './pages/Purchases/Purchases'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import PetGrooming from './pages/PetGrooming/PetGrooming'
import { useAuth } from './context/AuthContext'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()

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
        {/* Trang login/register - có thể truy cập bất kỳ khi nào */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
