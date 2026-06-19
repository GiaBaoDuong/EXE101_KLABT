import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Login.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        sessionStorage.setItem('justLoggedIn', 'true')

        if (data.user?.role === 'Admin') {
          sessionStorage.setItem('adminToken', data.token)
          sessionStorage.setItem('adminUser', JSON.stringify(data.user))
          navigate('/admin')
        } else if (data.user?.role === 'Staff') {
          sessionStorage.setItem('staffToken', data.token)
          sessionStorage.setItem('staffUser', JSON.stringify(data.user))
          navigate('/staff')
        } else if (data.user?.role === 'Doctor') {
          navigate('/doctor')
        } else {
          navigate('/home')
        }
      } else {
        setError('Email or password is incorrect')
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Left: Editorial Hero */}
      <div className="login-image-section">
        <img
          src="../../src/assets/login2.jpg"
          alt="Happy pets and pet care"
          className="login-image"
        />
        <div className="login-image-overlay">
          <div className="login-title-overlay">
            Your pet<br />deserves<br />the best.
          </div>
          <p className="login-subtitle-overlay">
            Premium care, products, and services — all in one place.
          </p>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="login-form-section">
        <div className="login-form-content">
          <div className="login-form-header">
            <span className="login-form-label">Pet Care</span>
            <h1 className="login-form-title">Sign In</h1>
            <p className="login-form-subtitle">
              Welcome back. Access your account to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="login-form" noValidate>
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <div className="login-form-group">
              <label htmlFor="email" className="login-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="login-form-group" style={{ textAlign: 'right' }}>
              <Link to="/forgot-password" className="login-link" style={{ fontSize: '13px' }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="login-spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="login-link">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
