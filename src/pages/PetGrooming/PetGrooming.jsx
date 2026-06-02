import petHeroImage from '../../assets/petHomepage1.jpg';
import petHeroImage2 from '../../assets/petHomepage2.jpg';
import petHeroImage3 from '../../assets/petHomepage3.jpg';
import { Link, useNavigate } from 'react-router-dom';
import '../PetGrooming/PetGrooming.css'
import AppHeader from '../../components/AppHeader/AppHeader'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

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
];

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

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [formData, setFormData] = useState({
    petId: '',
    serviceId: '',
    note: '',
  })

  useEffect(() => {
    fetchPets()
    fetchServices()
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
        setBookings(Array.isArray(data) ? data : [])
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
      alert('Vui lòng chọn thú cưng, dịch vụ, ngày và giờ!')
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
          title: 'Đặt lịch thành công!',
          message: `Mã lịch hẹn: ${data.bookingCode || data.bookingId}. Trạng thái: Đang chờ xác nhận.`,
          link: '/home',
        })
        setFormData({ petId: '', serviceId: '', note: '' })
        setSelectedDate('')
        setSelectedTime('')
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(errData.message || 'Đặt lịch thất bại. Vui lòng thử lại.')
      }
    } catch (err) {
      console.error('Booking error:', err)
      alert('Đặt lịch thất bại. Vui lòng kiểm tra kết nối và thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 1: return { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fef3c7' }
      case 2: return { label: 'Đã xác nhận', color: '#3b82f6', bg: '#dbeafe' }
      case 3: return { label: 'Đang thực hiện', color: '#8b5cf6', bg: '#ede9fe' }
      case 4: return { label: 'Đã hoàn thành', color: '#22c55e', bg: '#dcfce7' }
      case 5: return { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' }
      default: return { label: 'Không xác định', color: '#999', bg: '#f1f5f9' }
    }
  }

  return (
    <main className="pet-grooming">
      <AppHeader
        leftText="About"
        nav={[
          { label: 'Pet Profile', to: '/pet-profile' },
          { label: 'Product', to: '/products' },
          { label: 'Service', to: '/services' },
          { label: 'Grooming Booking', to: '/grooming' },
          { label: 'Purchases', to: '/purchases' },
        ]}
        cartCount={0}
      />

      {/* Hero Banner Section */}
      <section className="grooming-hero">
        <div className="hero-image-wrapper">
          <img src={petHeroImage} alt="Happy groomed dog" className="hero-dog-image" />
        </div>
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
          <div className="feature-circle">
            <span className="feature-emoji">🛁</span>
          </div>
          <p>Our Service</p>
        </div>
        <div className="feature-icon-item">
          <div className="feature-circle">
            <span className="feature-emoji">⏰</span>
          </div>
          <p>Time</p>
        </div>
        <div className="feature-icon-item">
          <div className="feature-circle">
            <span className="feature-emoji">💰</span>
          </div>
          <p>Price</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-header">
          <div className="services-title-row">
            <h2>Professional Services</h2>
          </div>
        </div>
        <div className="services-grid">
          {isLoadingServices ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Đang tải dịch vụ...</p>
          ) : services.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>Không có dịch vụ</p>
          ) : services.map(service => (
            <div key={service.serviceId} className="service-card">
              <div className="service-icon">{service.name?.[0] || '⚡'}</div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <span className="service-price-tag">{formatPrice(service.price)}</span>
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
          Đặt lịch
        </button>
        <button
          className={`grooming-tab ${activeSection === 'history' ? 'active' : ''}`}
          onClick={() => { setActiveSection('history'); if (bookings.length === 0) fetchBookings() }}
        >
          Lịch sử đặt lịch
        </button>
      </div>

      {/* BOOKING FORM SECTION */}
      {activeSection === 'book' && (
      <>
      {/* Booking Section */}
      <section id="booking" className="booking-section">
        <h2 className="booking-title">Book a Grooming Session</h2>

        <form onSubmit={handleSubmit} className="booking-form">
          {/* Pet & Service Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Chọn thú cưng</label>
              {isLoadingPets ? (
                <select disabled><option>Đang tải...</option></select>
              ) : (
                <select
                  name="petId"
                  value={formData.petId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Chọn thú cưng --</option>
                  {pets.map(p => (
                    <option key={p.petId} value={p.petId}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="form-group">
              <label>Chọn dịch vụ</label>
              {isLoadingServices ? (
                <select disabled><option>Đang tải...</option></select>
              ) : (
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {services.map(s => (
                    <option key={s.serviceId} value={s.serviceId}>{s.name} - {formatPrice(s.price)}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="form-group">
              <label>Ngày đặt</label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Time & Note Row */}
          <div className="form-row schedule-row">
            <div className="form-group">
              <label>Giờ hẹn</label>
              <input
                type="time"
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: '2 / -1' }}>
              <label>Ghi chú</label>
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Yêu cầu đặc biệt..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="confirm-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Book Appointment'}
          </button>
        </form>
      </section>
      </>
      )}

      {/* BOOKING HISTORY SECTION */}
      {activeSection === 'history' && (
        <section className="booking-history-section">
          <h2 className="booking-title">Lịch sử đặt lịch</h2>

          {isLoadingBookings ? (
            <div className="history-loading">
              <div className="history-spinner"></div>
              <p>Đang tải...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty-icon">&#128197;</div>
              <p className="history-empty-title">Chưa có lịch hẹn nào</p>
              <p className="history-empty-sub">Hãy đặt lịch grooming cho thú cưng của bạn ngay!</p>
              <button className="history-empty-btn" onClick={() => setActiveSection('book')}>
                Đặt lịch ngay
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
                        <span className="bhc-label">Mã lịch hẹn</span>
                        <span className="bhc-value">#{booking.bookingCode || booking.bookingId}</span>
                      </div>
                      <span
                        className="bhc-status"
                        style={{ color: status.color, background: status.bg }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div className="bhc-body">
                      <div className="bhc-info">
                        <span className="bhc-info-icon">&#128054;</span>
                        <span>{booking.petName || 'Thú cưng'}</span>
                      </div>
                      <div className="bhc-info">
                        <span className="bhc-info-icon">&#128197;</span>
                        <span>{new Date(booking.bookingDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                      <div className="bhc-info">
                        <span className="bhc-info-icon">&#128339;</span>
                        <span>{booking.startTime ? new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
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
                      <span className="bhc-view-detail">Xem chi tiết &#8250;</span>
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
                <p>Đang tải chi tiết...</p>
              </div>
            ) : selectedBookingDetail ? (
            <>
            <div className="bdm-header">
              <div>
                <h2 className="bdm-title">Chi tiết lịch hẹn</h2>
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
              <span className="bdm-created">Đặt lúc: {new Date(selectedBookingDetail.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div className="bdm-content">
              <div className="bdm-section">
                <h3 className="bdm-section-title">&#128054; Thông tin thú cưng</h3>
                <div className="bdm-grid">
                  <div className="bdm-field">
                    <span className="bdm-field-label">Tên thú cưng</span>
                    <span className="bdm-field-value">{selectedBookingDetail.petName}</span>
                  </div>
                </div>
              </div>

              <div className="bdm-section">
                <h3 className="bdm-section-title">&#128197; Thông tin lịch hẹn</h3>
                <div className="bdm-grid">
                  <div className="bdm-field">
                    <span className="bdm-field-label">Ngày hẹn</span>
                    <span className="bdm-field-value">
                      {new Date(selectedBookingDetail.bookingDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="bdm-field">
                    <span className="bdm-field-label">Giờ bắt đầu</span>
                    <span className="bdm-field-value">
                      {selectedBookingDetail.startTime ? new Date(selectedBookingDetail.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                  <div className="bdm-field">
                    <span className="bdm-field-label">Giờ kết thúc</span>
                    <span className="bdm-field-value">
                      {selectedBookingDetail.endTime ? new Date(selectedBookingDetail.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>
                  {selectedBookingDetail.note && (
                    <div className="bdm-field bdm-field-full">
                      <span className="bdm-field-label">Ghi chú</span>
                      <span className="bdm-field-value">{selectedBookingDetail.note}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedBookingDetail.services?.length > 0 && (
                <div className="bdm-section">
                  <h3 className="bdm-section-title">&#127770; Dịch vụ đã đặt</h3>
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
                    <span>Tổng cộng</span>
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
            <div className="booking-modal-icon">&#9989;</div>
            <h2>Đặt lịch thành công!</h2>
            <div className="booking-modal-detail">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Mã lịch hẹn</span>
                <span className="modal-detail-value">{bookingResult.bookingCode || bookingResult.bookingId}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Thú cưng</span>
                <span className="modal-detail-value">{bookingResult.petName}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Ngày</span>
                <span className="modal-detail-value">{formatDateTime(bookingResult.bookingDate)}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Giờ</span>
                <span className="modal-detail-value">{formatDateTime(bookingResult.startTime)}</span>
              </div>
              {bookingResult.services?.length > 0 && (
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Dịch vụ</span>
                  <span className="modal-detail-value">
                    {bookingResult.services.map(s => s.serviceName).join(', ')}
                  </span>
                </div>
              )}
              <div className="modal-detail-row">
                <span className="modal-detail-label">Tổng tiền</span>
                <span className="modal-detail-value total-price">
                  {formatPrice(bookingResult.totalPrice)}
                </span>
              </div>
                <div className="modal-detail-row">
                  <span className="modal-detail-label">Trạng thái</span>
                  <span className="modal-detail-value status-pending">
                    Chờ xử lý
                  </span>
                </div>
            </div>
            <p className="booking-modal-note">
              Nhân viên sẽ xác nhận lịch hẹn trong thời gian sớm nhất. Thông báo sẽ được gửi đến bạn.
            </p>
            <div className="booking-modal-actions">
              <button
                className="modal-btn-home"
                onClick={() => { setShowSuccessModal(false); navigate('/home') }}
              >
                Về trang chủ
              </button>
              <button
                className="modal-btn-close"
                onClick={() => setShowSuccessModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Pet Parents Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">{'★'.repeat(item.rating)}</div>
              <p className="testimonial-text">"{item.text}"</p>
              <p className="testimonial-author">- {item.name}</p>
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

      {/* Footer */}
      <footer className="footer">
        <Link to="/home" className="logo-block">
          K-LABT
        </Link>
        <div className="footer-links">
          <div>
            <h4>Shop</h4>
            <a href="#">Walk</a>
            <a href="#">Carry</a>
            <a href="#">Play</a>
            <a href="#">Shop All</a>
          </div>
          <div>
            <h4>Info</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Reviews</a>
            <a href="#">Wholesale</a>
          </div>
          <div>
            <h4>Help</h4>
            <a href="#">Contact</a>
            <a href="#">FAQ</a>
            <a href="#">Shipping & Returns</a>
            <a href="#">Account</a>
          </div>
          <div>
            <h4>Join the Pack!</h4>
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default PetGrooming
