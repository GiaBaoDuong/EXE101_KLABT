import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Doctor.css'
import { useAuth } from '../../context/AuthContext'
import { getDoctorBookings, updateBookingStatus, completeBooking } from '../../services/mockDoctorService'

const USE_MOCK = false
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const BOOKING_STATUSES = {
  1: { label: 'Pending', bg: '#f5f5f5', color: '#111111' },
  2: { label: 'Confirmed', bg: '#111111', color: '#ffffff' },
  3: { label: 'In Progress', bg: '#111111', color: '#ffffff' },
  4: { label: 'Completed', bg: '#111111', color: '#ffffff' },
  5: { label: 'Cancelled', bg: '#f5f5f5', color: '#111111' },
}

const TABS = {
  MY_BOOKINGS: 'my-bookings',
  COMPLETED: 'completed',
}

// Toast Notification Component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  }

  return (
    <div className={`doc-toast doc-toast--${type}`}>
      <span className="doc-toast__icon">{icons[type]}</span>
      <span className="doc-toast__message">{message}</span>
      <button className="doc-toast__close" onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}

function Doctor() {
  const [activeTab, setActiveTab] = useState(TABS.MY_BOOKINGS)
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [medicalNote, setMedicalNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  useEffect(() => {
    fetchMyBookings()
  }, [activeTab])

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }

  const fetchMyBookings = async () => {
    setIsLoading(true)
    try {
      let data
      if (USE_MOCK) {
        const res = await getDoctorBookings()
        data = res.data || []
      } else {
        const res = await fetch(`${API_BASE_URL}/api/doctor/my-bookings`, {
          headers: authHeaders,
        })
        if (res.ok) {
          data = await res.json()
        } else {
          console.error('Failed to fetch bookings:', res.status)
          data = []
        }
      }
      setBookings(Array.isArray(data) ? data : data.data || [])
    } catch (e) {
      console.error('Failed to fetch bookings:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setIsSubmitting(true)
    try {
      let res
      if (USE_MOCK) {
        res = await updateBookingStatus(bookingId, newStatus)
        if (res.success) {
          setBookings(prev => prev.map(b =>
            b.bookingId === bookingId ? { ...b, status: newStatus } : b
          ))
          if (selectedBooking?.bookingId === bookingId) {
            setSelectedBooking(prev => ({ ...prev, status: newStatus }))
          }
          setSelectedBooking(null)
          showToast('Status updated successfully!', 'success')
        } else {
          showToast(res.message || 'Update failed', 'error')
        }
      } else {
        res = await fetch(`${API_BASE_URL}/api/doctor/bookings/${bookingId}/status`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ status: newStatus }),
        })
        if (res.ok) {
          setBookings(prev => prev.map(b =>
            b.bookingId === bookingId ? { ...b, status: newStatus } : b
          ))
          if (selectedBooking?.bookingId === bookingId) {
            setSelectedBooking(prev => ({ ...prev, status: newStatus }))
          }
          setSelectedBooking(null)
          showToast('Status updated successfully!', 'success')
        } else {
          let errData = {}
          try {
            errData = await res.json()
          } catch {
            errData = { message: res.statusText || 'Update failed' }
          }
          showToast(errData.message || 'Update failed', 'error')
        }
      }
    } catch (e) {
      console.error('Failed to update status:', e)
      showToast('An error occurred while updating.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteBooking = async (bookingId) => {
    if (!medicalNote.trim()) {
      showToast('Please enter medical notes.', 'info')
      return
    }
    setIsSubmitting(true)
    try {
      let res
      if (USE_MOCK) {
        res = await completeBooking(bookingId, medicalNote)
        if (res.success) {
          setBookings(prev => prev.map(b =>
            b.bookingId === bookingId ? { ...b, status: 4, medicalNote } : b
          ))
          if (selectedBooking?.bookingId === bookingId) {
            setSelectedBooking(prev => ({ ...prev, status: 4, medicalNote }))
          }
          setSelectedBooking(null)
          setMedicalNote('')
          showToast('Appointment completed successfully!', 'success')
          fetchMyBookings()
        } else {
          showToast(res.message || 'Completion failed', 'error')
        }
      } else {
        res = await fetch(`${API_BASE_URL}/api/doctor/bookings/${bookingId}/complete`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ note: medicalNote }),
        })
        if (res.ok) {
          let result = {}
          try {
            result = await res.json()
          } catch {
            result = { message: 'Appointment completed successfully!' }
          }
          setBookings(prev => prev.map(b =>
            b.bookingId === bookingId ? { ...b, status: 4, medicalNote } : b
          ))
          if (selectedBooking?.bookingId === bookingId) {
            setSelectedBooking(prev => ({ ...prev, status: 4, medicalNote }))
          }
          setSelectedBooking(null)
          setMedicalNote('')
          showToast('Appointment completed successfully!', 'success')
          fetchMyBookings()
          if (result.conversationId) {
            console.log('Conversation created with ID:', result.conversationId)
          }
        } else {
          let errData = {}
          try {
            errData = await res.json()
          } catch {
            errData = { message: res.statusText || 'Completion failed' }
          }
          showToast(errData.message || 'Completion failed', 'error')
        }
      }
    } catch (e) {
      console.error('Failed to complete booking:', e)
      showToast('An error occurred while completing.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  }

  const getStatusInfo = (status) => BOOKING_STATUSES[status] || { label: 'Unknown', bg: '#f5f5f5', color: '#111111' }

  const getServiceNames = (services) => {
    if (!services || services.length === 0) return '-'
    return services.map(s => s.serviceName || s.name).join(', ')
  }

  const filteredBookings = bookings.filter(b => {
    const search = searchTerm.toLowerCase()
    const matchSearch = !search ||
      b.bookingCode?.toLowerCase().includes(search) ||
      b.bookingId?.toString().includes(search) ||
      b.petName?.toLowerCase().includes(search) ||
      b.customerName?.toLowerCase().includes(search)
    const matchStatus = statusFilter === 'all' || b.status === parseInt(statusFilter)
    return matchSearch && matchStatus
  })

  const myBookings = filteredBookings.filter(b => b.status !== 4)
  const completedBookings = filteredBookings.filter(b => b.status === 4)

  const pendingCount = bookings.filter(b => b.status === 2).length
  const inProgressCount = bookings.filter(b => b.status === 3).length
  const completedCount = bookings.filter(b => b.status === 4).length

  const displayedBookings = activeTab === TABS.MY_BOOKINGS ? myBookings : completedBookings

  return (
    <div className="doctor-dashboard">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Sidebar */}
      <aside className="doctor-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">K-LABT</div>
          <div className="sidebar-user">
            <span className="sidebar-user-name">{user?.fullName || user?.name || 'Doctor'}</span>
            <span className="sidebar-user-role">Veterinarian</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === TABS.MY_BOOKINGS ? 'active' : ''}`}
            onClick={() => setActiveTab(TABS.MY_BOOKINGS)}
          >
            <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>My Appointments</span>
            {pendingCount + inProgressCount > 0 && (
              <span className="nav-badge">{pendingCount + inProgressCount}</span>
            )}
          </button>
          <button
            className={`nav-item ${activeTab === TABS.COMPLETED ? 'active' : ''}`}
            onClick={() => setActiveTab(TABS.COMPLETED)}
          >
            <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Completed</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-btn-home" onClick={() => navigate('/home')}>
            <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Back to Home</span>
          </button>
          <button className="sidebar-btn-logout" onClick={handleLogout}>
            <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="doctor-main">
        <header className="doctor-header">
          <h1 className="doctor-title">
            {activeTab === TABS.MY_BOOKINGS ? 'My Appointments' : 'Completed'}
          </h1>
          <div className="header-stats">
            {pendingCount > 0 && (
              <div className="stat-chip">
                <span className="stat-dot"></span>
                <span>{pendingCount} Confirmed</span>
              </div>
            )}
            {inProgressCount > 0 && (
              <div className="stat-chip">
                <span className="stat-dot"></span>
                <span>{inProgressCount} In Progress</span>
              </div>
            )}
          </div>
        </header>

        {/* Stats Cards */}
        <div className="doctor-stats-row">
          <div className="doc-stat-card">
            <div className="doc-stat-num">{pendingCount}</div>
            <div className="doc-stat-label">Confirmed</div>
          </div>
          <div className="doc-stat-card">
            <div className="doc-stat-num">{inProgressCount}</div>
            <div className="doc-stat-label">In Progress</div>
          </div>
          <div className="doc-stat-card">
            <div className="doc-stat-num">{completedCount}</div>
            <div className="doc-stat-label">Completed</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="doctor-toolbar">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="doctor-search"
              placeholder="Search booking ID, pet name, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className={`doctor-filter ${statusFilter !== 'all' ? 'active' : ''}`}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="2">Confirmed</option>
            <option value="3">In Progress</option>
            <option value="4">Completed</option>
            <option value="5">Cancelled</option>
          </select>
        </div>

        {/* Booking List */}
        {isLoading ? (
          <div className="doctor-loading">
            <div className="doctor-spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="doctor-empty">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <p className="doctor-empty-title">
              {activeTab === TABS.MY_BOOKINGS ? 'No appointments yet' : 'No completed appointments yet'}
            </p>
          </div>
        ) : (
          <div className="doctor-booking-list">
            {displayedBookings.map(booking => {
              const status = getStatusInfo(booking.status)
              return (
                <div
                  key={booking.bookingId}
                  className="doctor-booking-card"
                  onClick={() => { setSelectedBooking(booking); setMedicalNote('') }}
                >
                  <div className="dbc-header">
                    <div className="dbc-id">
                      <span className="dbc-label">Booking ID</span>
                      <span className="dbc-value">#{booking.bookingCode || booking.bookingId}</span>
                    </div>
                    <span
                      className="dbc-status"
                      style={{ backgroundColor: status.bg, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="dbc-body">
                    <div className="dbc-grid">
                      <div className="dbc-item">
                        <span className="dbc-item-label">Pet</span>
                        <span className="dbc-item-value">{booking.petName || '-'}</span>
                      </div>
                      <div className="dbc-item">
                        <span className="dbc-item-label">Customer</span>
                        <span className="dbc-item-value">{booking.customerName || '-'}</span>
                      </div>
                      <div className="dbc-item">
                        <span className="dbc-item-label">Date</span>
                        <span className="dbc-item-value">
                          {booking.bookingDate
                            ? new Date(booking.bookingDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : '-'}
                        </span>
                      </div>
                      <div className="dbc-item">
                        <span className="dbc-item-label">Time</span>
                        <span className="dbc-item-value">
                          {booking.startTime
                            ? new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.services?.length > 0 && (
                    <div className="dbc-services">
                      {booking.services.map((s, i) => (
                        <span key={i} className="dbc-service-tag">{s.serviceName || s.name}</span>
                      ))}
                    </div>
                  )}

                  {booking.medicalNote && (
                    <div className="dbc-medical-note">
                      <span className="dbc-note-label">Medical Notes</span>
                      <span className="dbc-note-text">{booking.medicalNote}</span>
                    </div>
                  )}

                  <div className="dbc-footer">
                    <span className="dbc-price">{formatPrice(booking.totalPrice)}</span>
                    <span className="dbc-view-detail">View Details</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="doctor-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="doctor-modal" onClick={e => e.stopPropagation()}>
            <div className="dm-header">
              <h3 className="dm-title">Appointment Details</h3>
              <button className="dm-close" onClick={() => setSelectedBooking(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="dm-body">
              <div className="dm-section">
                <span className="dm-section-label">Booking Information</span>
                <div className="dm-row">
                  <span className="dm-label">Booking ID</span>
                  <span className="dm-value">#{selectedBooking.bookingCode || selectedBooking.bookingId}</span>
                </div>
                <div className="dm-row">
                  <span className="dm-label">Pet</span>
                  <span className="dm-value">{selectedBooking.petName || '-'}</span>
                </div>
                <div className="dm-row">
                  <span className="dm-label">Customer</span>
                  <span className="dm-value">{selectedBooking.customerName || '-'}</span>
                </div>
                <div className="dm-row">
                  <span className="dm-label">Date</span>
                  <span className="dm-value">
                    {selectedBooking.bookingDate
                      ? new Date(selectedBooking.bookingDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      : '-'}
                  </span>
                </div>
                <div className="dm-row">
                  <span className="dm-label">Time</span>
                  <span className="dm-value">
                    {selectedBooking.startTime
                      ? new Date(selectedBooking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </span>
                </div>
              </div>

              <div className="dm-section">
                <span className="dm-section-label">Service Details</span>
                <div className="dm-row">
                  <span className="dm-label">Service</span>
                  <span className="dm-value">{getServiceNames(selectedBooking.services)}</span>
                </div>
                <div className="dm-row">
                  <span className="dm-label">Total</span>
                  <span className="dm-value dm-price">{formatPrice(selectedBooking.totalPrice)}</span>
                </div>
                <div className="dm-row">
                  <span className="dm-label">Customer Notes</span>
                  <span className="dm-value">{selectedBooking.note || '-'}</span>
                </div>
              </div>

              <div className="dm-section">
                <div className="dm-status-row">
                  <span className="dm-label">Status</span>
                  {(() => {
                    const s = getStatusInfo(selectedBooking.status)
                    return (
                      <span className="dm-status-badge" style={{ backgroundColor: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    )
                  })()}
                </div>
              </div>

              {/* Medical Note - for completing */}
              {selectedBooking.status === 3 && (
                <div className="dm-medical-section">
                  <span className="dm-section-label">Diagnosis & Notes</span>
                  <textarea
                    className="dm-note-input"
                    rows={4}
                    placeholder="Enter diagnosis, prescriptions, follow-up instructions..."
                    value={medicalNote}
                    onChange={(e) => setMedicalNote(e.target.value)}
                  />
                </div>
              )}

              {/* Show medical note if already completed */}
              {selectedBooking.status === 4 && selectedBooking.medicalNote && (
                <div className="dm-medical-section">
                  <span className="dm-section-label">Medical Notes</span>
                  <div className="dm-note-readonly">{selectedBooking.medicalNote}</div>
                </div>
              )}
            </div>

            <div className="dm-actions">
              {selectedBooking.status === 2 && (
                <button
                  className="dm-btn dm-btn-primary"
                  onClick={() => handleUpdateStatus(selectedBooking.bookingId, 3)}
                  disabled={isSubmitting}
                >
                  Start Exam
                </button>
              )}
              {selectedBooking.status === 3 && (
                <button
                  className="dm-btn dm-btn-primary"
                  onClick={() => handleCompleteBooking(selectedBooking.bookingId)}
                  disabled={isSubmitting}
                >
                  Complete & Save
                </button>
              )}
              <button
                className="dm-btn dm-btn-secondary"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Doctor
