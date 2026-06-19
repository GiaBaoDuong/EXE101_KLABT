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
  const [termsAccepted, setTermsAccepted] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy')
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
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-container">
      {/* Left: Editorial Hero */}
      <div className="register-image-section">
        <img
          src="../../src/assets/register1.jpg"
          alt="Happy pets and pet care"
          className="register-image"
        />
        <div className="register-image-overlay">
          <div className="register-title-overlay">
            Join<br />Our<br />Family.
          </div>
          <p className="register-subtitle-overlay">
            Create an account to manage your pets' health, book appointments, and access premium care.
          </p>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="register-form-section">
        <div className="register-form-content">
          <div className="register-form-header">
            <span className="register-form-label">Pet Care</span>
            <h1 className="register-form-title">Sign Up</h1>
            <p className="register-form-subtitle">
              Create your account to get started.
            </p>
          </div>

          <form onSubmit={handleRegister} className="register-form" noValidate>
            {error && (
              <div className="register-error" role="alert">
                {error}
              </div>
            )}

            <div className="register-form-row">
              <div className="register-form-group">
                <label htmlFor="fullName" className="register-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="register-input"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="register-form-group">
                <label htmlFor="phone" className="register-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="register-input"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="register-form-group">
              <label htmlFor="email" className="register-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="register-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="register-form-row">
              <div className="register-form-group">
                <label htmlFor="password" className="register-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="register-input"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="register-form-group">
                <label htmlFor="confirmPassword" className="register-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="register-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="register-terms">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="terms" className="register-terms-label">
                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="register-spinner" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="register-footer">
            <p className="register-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="register-link">
                Sign in now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-modal-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3>You're In.</h3>
            <p>Account created. Redirecting you to sign in...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register
