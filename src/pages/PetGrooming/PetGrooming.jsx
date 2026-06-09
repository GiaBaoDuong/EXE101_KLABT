import { Link, useNavigate } from 'react-router-dom';
import '../PetGrooming/PetGrooming.css'
import SharedNav from '../../components/SharedNav/SharedNav'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const petHeroImage = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80'
const petHeroImage2 = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80'

/* SVG Icons */
const IconBathtub = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h20M6 12V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7" />
    <path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3z" />
  </svg>
)
const IconClock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconTag = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)
const IconCheckCircle = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const testimonials = [
  {
    name: 'Sarah M.',
    text: 'My golden retriever looks amazing every time! The team is so patient and caring.',
    rating: 5,
  },
  {
    name: 'John D.',
    text: 'Best grooming service in town. My Shih Tzu always comes back looking like a star.',
    rating: 5,
  },
  {
    name: 'Emily R.',
    text: 'They truly understand how to handle nervous pets. Highly recommend!',
    rating: 5,
  },
]

function PetGrooming() {
  const { user, token } = useAuth()
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [pets, setPets] = useState([])
  const [services, setServices] = useState([])
  const [isLoadingPets, setIsLoadingPets] = useState(true)
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)
  const [bookings, setBookings] = useState([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('book') // 'book' | 'history'
  const notifiedBookingsRef = useRef(new Set(
    JSON.parse(localStorage.getItem('notified_bookings') || '[]')
  ))

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [formData, setFormData] = useState({
    petId: '',
    serviceId: '',
    note: '',
  })

  useEffect(() => {
    if (sessionStorage.getItem('scrollToBooking') === '1') {
      sessionStorage.removeItem('scrollToBooking')
      setTimeout(() => {
        const el = document.getElementById('booking')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
    fetchPets()
    fetchServices()
    fetchBookings()

    // Prevent browser's auto-scroll-on-focus animation — use scrollIntoViewIfNeeded(false)
    // so it only scrolls if the field is truly out of view, without animation jump
    const bookingSection = document.querySelector('.booking-form-wrap')
    if (bookingSection) {
      bookingSection.addEventListener('focusin', (e) => {
        const target = e.target
        if (target && typeof target.scrollIntoViewIfNeeded === 'function') {
          target.scrollIntoViewIfNeeded(false)
        }
      }, true)
    }
  }, [user, token])

  const fetchPets = async () => {
    setIsLoadingPets(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pet/user/${user?.userId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      })
      if (res.ok) {
        const data = await res.json()
        const petList = Array.isArray(data) ? data : (data ? [data] : [])
        setPets(petList)
      }
    } catch (e) {
      console.log('Failed to fetch pets')
    } finally {
      setIsLoadingPets(false)
    }
  }

  const fetchServices = async () => {
    setIsLoadingServices(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/Service`)
      if (res.ok) {
        const data = await res.json()
        setServices(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.log('Failed to fetch services')
    } finally {
      setIsLoadingServices(false)
    }
  }

  const fetchBookings = async () => {
    setIsLoadingBookings(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/Booking`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        const newBookings = Array.isArray(data) ? data : []
        // Check and notify for confirmed/rejected bookings
        newBookings.forEach(b => {
          const key = `${b.bookingId}`
          if (b.status === 2 && !notifiedBookingsRef.current.has(`${key}_2`)) {
            notifiedBookingsRef.current.add(`${key}_2`)
            localStorage.setItem('notified_bookings', JSON.stringify([...notifiedBookingsRef.current]))
            addNotification({
              type: 'booking_confirmed',
              title: 'Booking confirmed!',
              message: `Booking #${b.bookingCode || b.bookingId} has been confirmed.`,
              link: '/grooming',
            })
          } else if (b.status === 5 && !notifiedBookingsRef.current.has(`${key}_5`)) {
            notifiedBookingsRef.current.add(`${key}_5`)
            localStorage.setItem('notified_bookings', JSON.stringify([...notifiedBookingsRef.current]))
            addNotification({
              type: 'booking_rejected',
              title: 'Booking rejected',
              message: `Booking #${b.bookingCode || b.bookingId} has been rejected.`,
              link: '/grooming',
            })
          }
        })
        setBookings(newBookings)
      }
    } catch (e) {
      console.log('Failed to fetch bookings')
    } finally {
      setIsLoadingBookings(false)
    }
  }

  const fetchBookingDetail = async (bookingId) => {
    setIsDetailModalOpen(true)
    setIsLoadingDetail(true)
    setSelectedBookingDetail(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/Booking/${bookingId}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedBookingDetail(data)
      }
    } catch (e) {
      console.error('Failed to fetch booking detail:', e)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  }

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '-'
    return new Date(isoStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !formData.petId || !formData.serviceId) {
      alert('Please select a pet, service, date, and time!')
      return
    }

    setIsSubmitting(true)
    try {
      const startTime = `${selectedDate}T${selectedTime}:00.000Z`
      const endTimeDate = new Date(`${selectedDate}T${selectedTime}:00.000Z`)
      endTimeDate.setHours(endTimeDate.getHours() + 1)
      const endTime = endTimeDate.toISOString()

      const payload = {
        petId: parseInt(formData.petId),
        bookingDate: selectedDate,
        startTime,
        endTime,
        services: [
          {
            serviceId: parseInt(formData.serviceId),
            quantity: 1,
          },
        ],
        note: formData.note,
      }

      const res = await fetch(`${API_BASE_URL}/api/Booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setBookingResult(data)
        setShowSuccessModal(true)
        addNotification({
          type: 'booking_pending',
          title: 'Booking successful!',
          message: `Booking ID: ${data.bookingCode || data.bookingId}. Status: Pending confirmation.`,
          link: '/home',
        })
        setFormData({ petId: '', serviceId: '', note: '' })
        setSelectedDate('')
        setSelectedTime('')
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(errData.message || 'Booking failed. Please try again.')
      }
    } catch (err) {
      console.error('Booking error:', err)
      alert('Booking failed. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 1: return { label: 'Pending', color: '#f59e0b', bg: '#fef3c7' }
      case 2: return { label: 'Confirmed', color: '#3b82f6', bg: '#dbeafe' }
      case 3: return { label: 'In Progress', color: '#8b5cf6', bg: '#ede9fe' }
      case 4: return { label: 'Completed', color: '#22c55e', bg: '#dcfce7' }
      case 5: return { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' }
      default: return { label: 'Unknown', color: '#999', bg: '#f1f5f9' }
    }
  }

  return (
    <main className="pet-grooming">
      <SharedNav cartCount={0} />

      {/* Hero Banner Section */}
      <section className="grooming-hero">
        <div className="hero-image-wrapper">
          <img src={petHeroImage} alt="Happy groomed dog" className="hero-dog-image" />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-subtitle">Premium grooming service</p>
          <h1 className="hero-title">Paw & Pamper</h1>
          <button
            className="hero-btn"
            onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })}
          >
            Book Now
          </button>
        </div>
      </section>

      {/* Feature Icons Section */}
      <section className="feature-icons">
        <div className="feature-icon-item">
          <div className="feature-circle"><IconBathtub /></div>
          <p>Premium Care</p>
        </div>
        <div className="feature-icon-item">
          <div className="feature-circle"><IconClock /></div>
          <p>Flexible Time</p>
        </div>
        <div className="feature-icon-item">
          <div className="feature-circle"><IconTag /></div>
          <p>Best Value</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-header">
          <h2>Professional Services</h2>
        </div>
        <div className="services-grid">
          {isLoadingServices ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-mute)' }}>Loading services...</p>
          ) : services.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-mute)' }}>No services available</p>
          ) : services.map(service => (
            <div key={service.serviceId} className="pp-card service-card">
              <div className="pp-card__image-wrap">
                {service.thumbnailUrl || service.images?.[0] ? (
                  <img src={service.thumbnailUrl || service.images[0]} alt={service.name} className="pp-card__image" />
                ) : (
                  <div className="pp-card__placeholder">
                    <span className="pp-card__placeholder-icon"><IconBathtub /></span>
                  </div>
                )}
              </div>
              <div className="pp-card__body">
                <div className="pp-card__head">
                  <div>
                    <h3 className="pp-card__title">{service.name}</h3>
                    <p className="pp-card__species">{service.category || 'Grooming'}</p>
                  </div>
                </div>
                <p className="service-card__desc">{service.description}</p>
                <div className="pp-card__actions">
                  <span className="service-card__price">{formatPrice(service.price)}</span>
                  <button
                    className="pp-btn-primary"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, serviceId: String(service.serviceId) }))
                      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    Select Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tab Switcher */}
      <div className="grooming-tabs">
        <button
          className={`grooming-tab ${activeSection === 'book' ? 'active' : ''}`}
          onClick={() => setActiveSection('book')}
        >
          Book Now
        </button>
        <button
          className={`grooming-tab ${activeSection === 'history' ? 'active' : ''}`}
          onClick={() => { setActiveSection('history'); if (bookings.length === 0) fetchBookings() }}
        >
          Booking History
        </button>
      </div>

      {/* BOOKING FORM SECTION */}
      {activeSection === 'book' && (
      <section id="booking" className="booking-section">
        {/* Left — Editorial Visual */}
        <div className="booking-editorial">
          <div className="booking-editorial__image-wrap">
            <img src={petHeroImage2} alt="Pet grooming" />
          </div>
          <div className="booking-editorial__overlay" />
          <div className="booking-editorial__content">
            <p className="booking-editorial__eyebrow">Grooming Session</p>
            <h2 className="booking-editorial__title">
              Your Pet<br />Deserves<br />The Best
            </h2>
            <p className="booking-editorial__sub">
              Premium care tailored to your pet's unique needs.
            </p>
          </div>
        </div>

        {/* Right — Booking Form */}
        <div className="booking-form-wrap">
          <div className="booking-form-header">
            <p className="booking-form-header__eyebrow">Step 1 of 1</p>
            <h2 className="booking-form-header__title">Book Appointment</h2>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="booking-form__grid">
              {/* Pet */}
              <div className="booking-field">
                <label className="booking-field__label">Pet</label>
                {isLoadingPets ? (
                  <div className="booking-field__skeleton" />
                ) : (
                  <div className="booking-field__select-wrap">
                    <select
                      name="petId"
                      value={formData.petId}
                      onChange={handleInputChange}
                      required
                      className="booking-field__select"
                    >
                      <option value="">Select pet</option>
                      {pets.map(p => (
                        <option key={p.petId} value={p.petId}>{p.name}</option>
                      ))}
                    </select>
                    <span className="booking-field__select-arrow">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 4.5l3.5 3.5 3.5-3.5" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>

              {/* Service */}
              <div className="booking-field">
                <label className="booking-field__label">Service</label>
                {isLoadingServices ? (
                  <div className="booking-field__skeleton" />
                ) : (
                  <div className="booking-field__select-wrap">
                    <select
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleInputChange}
                      required
                      className="booking-field__select"
                    >
                      <option value="">Select service</option>
                      {services.map(s => (
                        <option key={s.serviceId} value={s.serviceId}>{s.name}</option>
                      ))}
                    </select>
                    <span className="booking-field__select-arrow">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 4.5l3.5 3.5 3.5-3.5" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="booking-field">
                <label className="booking-field__label">Date</label>
                <div className="booking-field__select-wrap">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="booking-field__input booking-field__input--date"
                  />
                </div>
              </div>

              {/* Time */}
              <div className="booking-field">
                <label className="booking-field__label">Time</label>
                <div className="booking-field__select-wrap">
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={e => setSelectedTime(e.target.value)}
                    required
                    className="booking-field__input booking-field__input--time"
                  />
                </div>
              </div>

              {/* Note — full width */}
              <div className="booking-field booking-field--full">
                <label className="booking-field__label">Note <span className="booking-field__optional">(optional)</span></label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Special requests or instructions..."
                  className="booking-field__input booking-field__input--note"
                />
              </div>
            </div>

            <button type="submit" className="booking-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </section>
      )}

      {/* BOOKING HISTORY SECTION */}
      {activeSection === 'history' && (
        <section className="booking-history-section">
          <h2 className="booking-title">Booking History</h2>

          {isLoadingBookings ? (
            <div className="history-loading">
              <div className="history-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="history-empty">
              <IconCalendar />
              <p className="history-empty-title">No bookings yet</p>
              <p className="history-empty-sub">Book a grooming session for your pet now!</p>
              <button className="history-empty-btn" onClick={() => setActiveSection('book')}>
                Book now
              </button>
            </div>
          ) : (
            <div className="booking-history-list">
              {bookings.map(booking => {
                const status = getStatusInfo(booking.status)
                return (
                  <div
                    key={booking.bookingId}
                    className="booking-history-card"
                    onClick={() => fetchBookingDetail(booking.bookingId)}
                  >
                    <div className="bhc-header">
                      <div className="bhc-id">
                        <span className="bhc-label">Booking ID</span>
                        <span className="bhc-value">#{booking.bookingCode || booking.bookingId}</span>
                      </div>
                      <span className="bhc-status" style={{ color: status.color, background: status.bg }}>
                        {status.label}
                      </span>
                    </div>
                    <div className="bhc-body">
                      <div className="bhc-info">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span>{booking.petName || 'Pet'}</span>
                      </div>
                      <div className="bhc-info">
                        <IconCalendar />
                        <span>{new Date(booking.bookingDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                    </div>
                    {booking.services?.length > 0 && (
                      <div className="bhc-services">
                        {booking.services.map((s, i) => (
                          <span key={i} className="bhc-service-tag">{s.serviceName || s.name}</span>
                        ))}
                      </div>
                    )}
                    <div className="bhc-footer">
                      <span className="bhc-price">{formatPrice(booking.totalPrice)}</span>
                      <span className="bhc-view-detail">View details →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* BOOKING DETAIL MODAL */}
      {isDetailModalOpen && (
        <div className="booking-modal-overlay" onClick={() => { setSelectedBookingDetail(null); setIsDetailModalOpen(false) }}>
          <div className="booking-detail-modal" onClick={e => e.stopPropagation()}>
            {isLoadingDetail ? (
              <div className="bdm-loading">
                <div className="history-spinner"></div>
                <p>Loading details...</p>
              </div>
            ) : selectedBookingDetail ? (
            <>
            <div className="bdm-header">
              <div>
                <h2 className="bdm-title">Booking Details</h2>
                <p className="bdm-code">#{selectedBookingDetail.bookingCode || selectedBookingDetail.bookingId}</p>
              </div>
              <button className="bdm-close" onClick={() => { setSelectedBookingDetail(null); setIsDetailModalOpen(false) }}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="bdm-status-bar">
              {(() => {
                const s = getStatusInfo(selectedBookingDetail.status)
                return (
                  <span className="bdm-status-badge" style={{ color: s.color, background: s.bg }}>
                    {s.label}
                  </span>
                )
              })()}
              <span className="bdm-created">Booked: {new Date(selectedBookingDetail.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className="bdm-content">
              <div className="bdm-section">
                <h3 className="bdm-section-title">&#128054; Pet Information</h3>
                <div className="bdm-grid">
                  <div className="bdm-field">
                    <span className="bdm-field-label">Pet Name</span>
                    <span className="bdm-field-value">{selectedBookingDetail.petName}</span>
                  </div>
                </div>
              </div>

              <div className="bdm-section">
                <h3 className="bdm-section-title">&#128197; Booking Information</h3>
                <div className="bdm-grid">
                  <div className="bdm-field">
                    <span className="bdm-field-label">Date</span>
                    <span className="bdm-field-value">
                      {new Date(selectedBookingDetail.bookingDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="bdm-field">
                    <span className="bdm-field-label">Start Time</span>
                    <span className="bdm-field-value">
                      {selectedBookingDetail.startTime ? new Date(selectedBookingDetail.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                  <div className="bdm-field">
                    <span className="bdm-field-label">End Time</span>
                    <span className="bdm-field-value">
                      {selectedBookingDetail.endTime ? new Date(selectedBookingDetail.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                  {selectedBookingDetail.note && (
                    <div className="bdm-field bdm-field-full">
                      <span className="bdm-field-label">Note</span>
                      <span className="bdm-field-value">{selectedBookingDetail.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedBookingDetail.services?.length > 0 && (
                <div className="bdm-section">
                  <h3 className="bdm-section-title">&#127770; Booked Services</h3>
                  <div className="bdm-services">
                    {selectedBookingDetail.services.map((s, i) => (
                      <div key={i} className="bdm-service-row">
                        <div className="bdm-service-left">
                          <span className="bdm-service-name">{s.serviceName || s.name}</span>
                          <span className="bdm-service-qty">x{s.quantity}</span>
                        </div>
                        <div className="bdm-service-right">
                          <span className="bdm-service-unit">{formatPrice(s.unitPrice)}</span>
                          <span className="bdm-service-sub">{formatPrice(s.subTotal)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bdm-total">
                    <span>Total</span>
                    <span className="bdm-total-price">{formatPrice(selectedBookingDetail.totalPrice)}</span>
                  </div>
                </div>
              )}
            </div>
            </>
            ) : null}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && bookingResult && (
        <div className="booking-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            <div className="booking-modal-icon">
              <IconCheckCircle />
            </div>
            <h2>Booking Successful!</h2>
            <div className="booking-modal-detail">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Booking ID</span>
                <span className="modal-detail-value">{bookingResult.bookingCode || bookingResult.bookingId}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Pet</span>
                <span className="modal-detail-value">{bookingResult.petName}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Date</span>
                <span className="modal-detail-value">{formatDateTime(bookingResult.bookingDate)}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Time</span>
                <span className="modal-detail-value">{formatDateTime(bookingResult.startTime)}</span>
              </div>
              {bookingResult.services?.length > 0 && (
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Service</span>
                  <span className="modal-detail-value">
                    {bookingResult.services.map(s => s.serviceName).join(', ')}
                  </span>
                </div>
              )}
              <div className="modal-detail-row">
                <span className="modal-detail-label">Total</span>
                <span className="modal-detail-value total-price">
                  {formatPrice(bookingResult.totalPrice)}
                </span>
              </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Status</span>
                  <span className="modal-detail-value status-pending">
                    Pending
                  </span>
                </div>
            </div>
            <p className="booking-modal-note">
              Staff will confirm your booking as soon as possible. You will be notified.
            </p>
            <div className="booking-modal-actions">
              <button
                className="modal-btn-home"
                onClick={() => { setShowSuccessModal(false); navigate('/home') }}
              >
                Go to Home
              </button>
              <button
                className="modal-btn-close"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="reveal-header">What Pet Parents Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">
                {Array.from({ length: item.rating }).map((_, i) => <IconStar key={i} />)}
              </div>
              <p className="testimonial-text">"{item.text}"</p>
              <p className="testimonial-author">— {item.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <Link to="/pet-profile" className="nav-tab">
          Pet Profile
        </Link>
        <Link to="/health-record" className="nav-tab">
          Pet Health Record
        </Link>
        <Link to="/grooming" className="nav-tab active">
          Grooming Booking
        </Link>
      </div>

    </main>
  )
}

export default PetGrooming
