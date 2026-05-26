import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Register.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Validate
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        }),
      })

      if (response.ok) {
        setShowSuccessModal(true)
        // Tự động chuyển về login sau 2 giây
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Đăng ký thất bại. Vui lòng thử lại.')
      }
    } catch (err) {
      setError('Không thể kết nối đến server. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-container">
      {/* Left side - Pet illustration */}
      <div className="register-image-section">
        <div className="register-decoration">
          <div className="paw-bg paw-1">🐾</div>
          <div className="paw-bg paw-2">🐾</div>
          <div className="paw-bg paw-3">🐾</div>
          <div className="paw-bg paw-4">🐾</div>
        </div>
        
        <div className="register-hero-content">
          <div className="hero-icon">🐕</div>
          <h1>Join Our Pet Family!</h1>
          <p>Create an account to manage your pets health, schedule grooming sessions, and connect with pet care experts.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">💉</span>
              <span>Track vaccinations</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✂️</span>
              <span>Book grooming</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏥</span>
              <span>Health records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="register-form-section">
        <div className="register-form-content">
          <div className="form-header">
            <div className="logo-badge">🐾</div>
            <h2>Tạo tài khoản</h2>
            <p>Đăng ký để bắt đầu chăm sóc thú cưng của bạn</p>
          </div>

          <form onSubmit={handleRegister} className="register-form">
            {error && (
              <div className="register-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="register-form-group">
                <label htmlFor="fullName">
                  <span className="label-icon">👤</span>
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="register-input"
                  placeholder="Nhập họ và tên của bạn"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="register-form-group">
                <label htmlFor="phone">
                  <span className="label-icon">📱</span>
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="register-input"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="register-form-group">
              <label htmlFor="email">
                <span className="label-icon">✉️</span>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="register-input"
                placeholder="Nhập địa chỉ email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-row">
              <div className="register-form-group">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span>
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="register-input"
                  placeholder="Tạo mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="register-form-group">
                <label htmlFor="confirmPassword">
                  <span className="label-icon">🔐</span>
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="register-input"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="terms-checkbox">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a>
              </label>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Đang đăng ký...
                </>
              ) : (
                <>
                  <span className="btn-icon">🐾</span>
                  Đăng ký ngay
                </>
              )}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Đã có tài khoản? 
              <Link to="/login" className="register-link"> Đăng nhập ngay</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">🎉</div>
            <h3>Đăng ký thành công!</h3>
            <p>Tài khoản của bạn đã được tạo. Đang chuyển hướng...</p>
            <div className="redirect-loader">
              <div className="loader-dot"></div>
              <div className="loader-dot"></div>
              <div className="loader-dot"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register
