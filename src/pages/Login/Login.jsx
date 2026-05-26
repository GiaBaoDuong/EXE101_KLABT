import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Login.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        login(data.user, data.token)
        navigate('/')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Email hoặc mật khẩu không đúng')
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-image-section">
        <div className="login-image-content">
          <div className="login-image-placeholder">
            <img
              src="src/assets/petcarelogin.jpg"
              alt="Pet Store"
              className="login-image"
            />
            <div className="login-image-overlay">
              <h1 className="login-title-overlay">Chào mừng đến Pet Store</h1>
              <p className="login-subtitle-overlay">Tìm kiếm những người bạn hoàn hảo cho gia đình</p>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-form-content">
          <div className="login-form-header">
            <h2 className="login-form-title">Đăng Nhập</h2>
            <p className="login-form-subtitle">Truy cập tài khoản của bạn</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="login-error">{error}</div>}

            <div className="login-form-group">
              <label htmlFor="email" className="login-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="login-input"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password" className="login-label">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                className="login-input"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Chưa có tài khoản? <Link to="/register" className="login-link">Đăng ký ngay</Link>
            </p>
            <p className="login-footer-text">
              <a href="#" className="login-link">Quên mật khẩu?</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
