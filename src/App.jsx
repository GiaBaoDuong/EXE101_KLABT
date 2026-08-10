import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
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
import PetHealth from './pages/PetHealth/PetHealth'
import PetHealthQuiz from './pages/PetHealthQuiz/PetHealthQuiz'
import PetHealthQuizResult from './pages/PetHealthQuiz/PetHealthQuizResult'
import UserProfile from './pages/UserProfile/UserProfile'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import Staff from './pages/Staff/Staff'
import Doctor from './pages/Doctor/Doctor'
import Notifications from './pages/Notifications/Notifications'
import Checkout from './pages/Checkout/Checkout'
import MyOrders from './pages/MyOrders/MyOrders'
import OrderDetail from './pages/OrderDetail/OrderDetail'
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation'
import SharedNav from './components/SharedNav/SharedNav'
import Footer from './components/Footer/Footer'
import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import './App.css'

/** Save current location before redirecting to login */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    sessionStorage.setItem('loginRedirect', location.pathname + location.search)
    return <Navigate to="/login" replace />
  }
  return children
}

/** Auto-scroll to top on every route change */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

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

/** Wrap with SharedNav + Footer. Pages already render their own SharedNav. */
function PageLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public product pages */}
        <Route path="/products" element={<PageLayout><Products /></PageLayout>} />
        <Route path="/products/:id" element={<PageLayout><ProductDetail /></PageLayout>} />
        <Route path="/services" element={<PageLayout><Services /></PageLayout>} />

        <Route path="/pet-health-quiz" element={<PageLayout><PetHealthQuiz /></PageLayout>} />
        <Route path="/pet-health-quiz/result" element={<PageLayout><PetHealthQuizResult /></PageLayout>} />

        {/* Auth pages */}
        <Route
          path="/home"
          element={isAuthenticated ? <PageLayout><Homepage /></PageLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/pet-profile"
          element={isAuthenticated ? <PageLayout><PetProfile /></PageLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/health-record"
          element={isAuthenticated ? <PageLayout><PetHealthRecord /></PageLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/purchases"
          element={isAuthenticated ? <PageLayout><Purchases /></PageLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/grooming"
          element={isAuthenticated ? <PageLayout><PetGrooming /></PageLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/health"
          element={isAuthenticated ? <PageLayout><PetHealth /></PageLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/user-profile"
          element={isAuthenticated ? <PageLayout><UserProfile /></PageLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/staff"
          element={isAuthenticated ? <Staff /> : <Navigate to="/login" />}
        />
        <Route
          path="/doctor"
          element={isAuthenticated ? <Doctor /> : <Navigate to="/login" />}
        />
        <Route
          path="/notifications"
          element={isAuthenticated ? <PageLayout><Notifications /></PageLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/checkout"
          element={<RequireAuth><PageLayout><Checkout /></PageLayout></RequireAuth>}
        />
        <Route
          path="/order-confirmation"
          element={<RequireAuth><PageLayout><OrderConfirmation /></PageLayout></RequireAuth>}
        />
        <Route
          path="/my-orders"
          element={isAuthenticated ? <PageLayout><MyOrders /></PageLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/order/:id"
          element={isAuthenticated ? <PageLayout><OrderDetail /></PageLayout> : <Navigate to="/login" />}
        />
        {/* Standalone — no footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
