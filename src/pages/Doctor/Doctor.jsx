import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Doctor.css'
import { useAuth } from '../../context/AuthContext'
import SharedNav from '../../components/SharedNav/SharedNav'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const BOOKING_STATUSES = {
  1: { label: 'Pending', color: '#f59e0b' },
  2: { label: 'Confirmed', color: '#3b82f6' },
  3: { label: 'In Progress', color: '#8b5cf6' },
  4: { label: 'Completed', color: '#22c55e' },
  5: { label: 'Cancelled', color: '#ef4444' },
}

const TABS = {
  MY_BOOKINGS: 'my-bookings',
  COMPLETED: 'completed',
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
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyBookings()
  }, [activeTab])

  const token = localStorage.getItem('token')
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }

  const fetchMyBookings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/my-bookings`, {
        headers: authHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setBookings(Array.isArray(data) ? data : data.data || [])
      } else {
        console.error('Failed to fetch bookings:', res.status)
      }
    } catch (e) {
      console.error('Failed to fetch bookings:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/bookings/${bookingId}/status`, {
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
        alert('Status updated successfully!')
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(`Update failed: ${errData.message || res.status}`)
      }
    } catch (e) {
      console.error('Failed to update status:', e)
      alert('An error occurred while updating.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteBooking = async (bookingId) => {
    if (!medicalNote.trim()) {
      alert('Please enter medical notes.')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/doctor/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ medicalNote }),
      })
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.bookingId === bookingId ? { ...b, status: 4 } : b
        ))
        if (selectedBooking?.bookingId === bookingId) {
          setSelectedBooking(prev => ({ ...prev, status: 4 }))
        }
        setSelectedBooking(null)
        setMedicalNote('')
        alert('Appointment completed successfully!')
        fetchMyBookings()
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(`Completion failed: ${errData.message || res.status}`)
      }
    } catch (e) {
      console.error('Failed to complete booking:', e)
      alert('An error occurred while completing.')
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

  const getStatusInfo = (status) => BOOKING_STATUSES[status] || { label: 'Unknown', color: '#999' }

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

  const displayedBookings = activeTab === TABS.MY_BOOKINGS ? myBookings : completedBookings

  return (
    <div className="doctor-dashboard">
      <SharedNav cartCount={0} />

      {/* Sidebar */}
      <aside className="doctor-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">&#128137; Doctor</div>
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
            <span className="nav-icon">&#128197;</span>
            <span>My Appointments</span>
            {pendingCount + inProgressCount > 0 && (
              <span className="nav-badge">{pendingCount + inProgressCount}</span>
            )}
          </button>
          <button
            className={`nav-item ${activeTab === TABS.COMPLETED ? 'active' : ''}`}
            onClick={() => setActiveTab(TABS.COMPLETED)}
          >
            <span className="nav-icon">&#9989;</span>
            <span>Completed History</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-btn-home" onClick={() => navigate('/home')}>
            &#127968; Back to Home
          </button>
          <button className="sidebar-btn-logout" onClick={handleLogout}>
            &#128682; Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="doctor-main">
        <header className="doctor-header">
          <h1 className="doctor-title">
            {activeTab === TABS.MY_BOOKINGS ? 'My Appointments' : 'Completed History'}
          </h1>
          <div className="header-stats">
            {pendingCount > 0 && (
              <div className="stat-chip stat-pending">
                <span className="stat-dot"></span>
                Pending: {pendingCount}
              </div>
            )}
            {inProgressCount > 0 && (
              <div className="stat-chip stat-inprogress">
                <span className="stat-dot"></span>
                In Progress: {inProgressCount}
              </div>
            )}
          </div>
        </header>

        {/* Search & Filter */}
        <div className="doctor-toolbar">
          <input
            type="text"
            className="doctor-search"
            placeholder="Search booking ID, pet name, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="doctor-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="2">Confirmed</option>
            <option value="3">In Progress</option>
            <option value="4">Completed</option>
            <option value="5">Cancelled</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="doctor-stats-row">
          <div className="doc-stat-card doc-stat-pending">
            <div className="doc-stat-num">{pendingCount}</div>
            <div className="doc-stat-label">Pending</div>
          </div>
          <div className="doc-stat-card doc-stat-inprogress">
            <div className="doc-stat-num">{inProgressCount}</div>
            <div className="doc-stat-label">In Progress</div>
          </div>
          <div className="doc-stat-card doc-stat-completed">
            <div className="doc-stat-num">{bookings.filter(b => b.status === 4).length}</div>
            <div className="doc-stat-label">Completed</div>
          </div>
        </div>

        {/* Booking List */}
        {isLoading ? (
          <div className="doctor-loading">
            <div className="doctor-spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : displayedBookings.length === 0 ? (
          <div className="doctor-empty">
            <div className="doctor-empty-icon">&#128218;</div>
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
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="dbc-body">
                    <div className="dbc-row">
                      <span className="dbc-icon">&#128054;</span>
                      <div className="dbc-info">
                        <span className="dbc-info-label">Pet</span>
                        <span className="dbc-info-value">{booking.petName || '-'}</span>
                      </div>
                    </div>
                    <div className="dbc-row">
                      <span className="dbc-icon">&#128100;</span>
                      <div className="dbc-info">
                        <span className="dbc-info-label">Customer</span>
                        <span className="dbc-info-value">{booking.customerName || '-'}</span>
                      </div>
                    </div>
                    <div className="dbc-row">
                      <span className="dbc-icon">&#128197;</span>
                      <div className="dbc-info">
                        <span className="dbc-info-label">Date</span>
                        <span className="dbc-info-value">
                          {booking.bookingDate
                            ? new Date(booking.bookingDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="dbc-row">
                      <span className="dbc-icon">&#128339;</span>
                      <div className="dbc-info">
                        <span className="dbc-info-label">Time</span>
                        <span className="dbc-info-value">
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
                      <span className="dbc-note-label">&#128221; Medical notes:</span>
                      <span className="dbc-note-text">{booking.medicalNote}</span>
                    </div>
                  )}

                  <div className="dbc-footer">
                    <span className="dbc-price">{formatPrice(booking.totalPrice)}</span>
                    <span className="dbc-view-detail">Details &#8250;</span>
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
              <button className="dm-close" onClick={() => setSelectedBooking(null)}>&times;</button>
            </div>

            <div className="dm-body">
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

              <div className="dm-status-bar">
                <span className="dm-status-label">Status:</span>
                {(() => {
                  const s = getStatusInfo(selectedBooking.status)
                  return (
                    <span className="dm-status-badge">
                      {s.label}
                    </span>
                  )
                })()}
              </div>

              {/* Medical Note - for completing */}
              {selectedBooking.status === 3 && (
                <div className="dm-medical-section">
                  <label className="dm-note-label">&#128221; Medical Notes</label>
                  <textarea
                    className="dm-note-input"
                    rows={4}
                    placeholder="Enter medical notes, diagnosis, prescriptions..."
                    value={medicalNote}
                    onChange={(e) => setMedicalNote(e.target.value)}
                  />
                </div>
              )}

              {/* Show medical note if already completed */}
              {selectedBooking.status === 4 && selectedBooking.medicalNote && (
                <div className="dm-medical-section">
                  <label className="dm-note-label">&#128221; Medical Notes</label>
                  <div className="dm-note-readonly">{selectedBooking.medicalNote}</div>
                </div>
              )}
            </div>

            <div className="dm-actions">
              {selectedBooking.status === 2 && (
                <button
                  className="dm-btn dm-btn-start"
                  onClick={() => handleUpdateStatus(selectedBooking.bookingId, 3)}
                  disabled={isSubmitting}
                >
                  &#9654; Start Exam
                </button>
              )}
              {selectedBooking.status === 3 && (
                <button
                  className="dm-btn dm-btn-complete"
                  onClick={() => handleCompleteBooking(selectedBooking.bookingId)}
                  disabled={isSubmitting}
                >
                  &#9989; Complete & Save Notes
                </button>
              )}
              <button
                className="dm-btn dm-btn-cancel"
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
