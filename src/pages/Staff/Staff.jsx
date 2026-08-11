import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Staff.css'
import { useAuth } from '../../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const TABS = {
  BOOKINGS: 'bookings',
  FEEDBACKS: 'feedbacks',
  ORDERS: 'orders',
}

const BOOKING_STATUSES = {
  1: { label: 'Pending', color: '#f59e0b' },
  2: { label: 'Confirmed', color: '#3b82f6' },
  3: { label: 'In Progress', color: '#8b5cf6' },
  4: { label: 'Completed', color: '#22c55e' },
  5: { label: 'Cancelled', color: '#ef4444' },
}

const ORDER_STATUSES = {
  0: { label: 'Pending', color: '#f59e0b' },
  1: { label: 'Shipping', color: '#3b82f6' },
  2: { label: 'Delivered', color: '#22c55e' },
  3: { label: 'Cancelled', color: '#ef4444' },
}

const Icons = {
  Calendar: () => <span className="icon">📅</span>,
  Star: () => <span className="icon">⭐</span>,
  Package: () => <span className="icon">📦</span>,
}

function Staff() {
  const [activeTab, setActiveTab] = useState(TABS.BOOKINGS)
  const [bookings, setBookings] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [orders, setOrders] = useState([])
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedBookingDoctor, setSelectedBookingDoctor] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      }

      if (activeTab === TABS.BOOKINGS) {
        const [bRes, dRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/staff/BookingManagement?status=1`, { headers }),
          fetch(`${API_BASE_URL}/api/staff/BookingManagement/doctors`, { headers }),
        ])
        if (bRes.ok) {
          const bData = await bRes.json()
          setBookings(Array.isArray(bData) ? bData : bData.data || [])
        }
        if (dRes.ok) {
          const dData = await dRes.json()
          setDoctors(Array.isArray(dData) ? dData : dData.data || [])
        }
      } else if (activeTab === TABS.FEEDBACKS) {
        const res = await fetch(`${API_BASE_URL}/api/staff/feedbacks`, { headers })
        if (res.ok) {
          const data = await res.json()
          setFeedbacks(Array.isArray(data) ? data : data.data || [])
        }
      } else if (activeTab === TABS.ORDERS) {
        const res = await fetch(`${API_BASE_URL}/api/staff/ordermanagement`, { headers })
        if (res.ok) {
          const data = await res.json()
          setOrders(Array.isArray(data) ? data : data.data || [])
        }
      }
    } catch (e) {
      console.error('Failed to fetch data:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const [confirmModal, setConfirmModal] = useState(null) // { type: 'approve'|'reject', booking, message }

  const handleApproveBooking = async () => {
    const { booking } = confirmModal
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/staff/BookingManagement/${booking.bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: 2, note: '' }),
      })
      if (res.ok) {
        const updated = { ...booking, status: 2 }
        setBookings(prev => prev.map(b => b.bookingId === booking.bookingId ? updated : b))
        setSelectedBooking(updated)
        setSelectedBooking(null)
        setConfirmModal(null)
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(`Update failed: ${errData.message || res.status}`)
      }
    } catch (e) {
      console.error('Failed to approve booking:', e)
      alert('An error occurred while confirming.')
    }
  }

  const handleRejectBooking = async () => {
    const { booking } = confirmModal
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/staff/BookingManagement/${booking.bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: 5, note: '' }),
      })
      if (res.ok) {
        const updated = { ...booking, status: 5 }
        setBookings(prev => prev.map(b => b.bookingId === booking.bookingId ? updated : b))
        setSelectedBooking(updated)
        setSelectedBooking(null)
        setConfirmModal(null)
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(`Update failed: ${errData.message || res.status}`)
      }
    } catch (e) {
      console.error('Failed to reject booking:', e)
      alert('An error occurred while rejecting.')
    }
  }

  const handleAssignDoctor = async (bookingId) => {
    if (!selectedBookingDoctor) {
      alert('Please select a doctor.')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/staff/BookingManagement/${bookingId}/assign-doctor`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ doctorId: parseInt(selectedBookingDoctor) }),
      })
      if (res.ok) {
        const result = await res.json()
        setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, doctorId: parseInt(selectedBookingDoctor), status: 2, conversationId: result.conversationId } : b))
        setSelectedBooking(null)
        setSelectedBookingDoctor('')
        alert('Doctor assigned successfully!')
        if (result.conversationId) {
          console.log('Chat room created with conversationId:', result.conversationId)
        }
      } else {
        alert('Failed to assign doctor.')
      }
    } catch (e) {
      console.error('Failed to assign doctor:', e)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/staff/ordermanagement/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(status),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o))
        setSelectedOrder(null)
      }
    } catch (e) {
      console.error('Failed to update order status:', e)
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

  const getStatusInfo = (status, statuses) => statuses[status] || { label: 'Unknown', color: '#999' }

  const getServiceNames = (services) => {
    if (!services || services.length === 0) return '-'
    return services.map(s => s.serviceName).join(', ')
  }

  const filteredBookings = bookings.filter(b => {
    const search = searchTerm.toLowerCase()
    const matchSearch = !search ||
      b.bookingCode?.toLowerCase().includes(search) ||
      b.bookingId?.toString().includes(search) ||
      b.petName?.toLowerCase().includes(search) ||
      b.services?.some(s => s.serviceName?.toLowerCase().includes(search))
    const matchStatus = statusFilter === 'all' || b.status === parseInt(statusFilter)
    return matchSearch && matchStatus
  })

  const filteredOrders = orders.filter(o => {
    const search = searchTerm.toLowerCase()
    const matchSearch = !search ||
      o.orderId?.toString().includes(search) ||
      o.userName?.toLowerCase().includes(search)
    const matchStatus = statusFilter === 'all' || o.status === parseInt(statusFilter)
    return matchSearch && matchStatus
  })

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
    ))
  }

  const pendingCount = bookings.filter(b => b.status === 1).length
  const confirmedCount = bookings.filter(b => b.status === 2).length
  const completedCount = bookings.filter(b => b.status === 4).length
  const cancelledCount = bookings.filter(b => b.status === 5).length

  return (
    <main className="staff-page">
      {/* Sidebar */}
      <aside className="staff-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">K-LABT</span>
          <span className="sidebar-role">Staff Panel</span>
        </div>
        <nav className="sidebar-nav">
          <button className={`sidebar-btn ${activeTab === TABS.BOOKINGS ? 'active' : ''}`} onClick={() => setActiveTab(TABS.BOOKINGS)}>
            <Icons.Calendar />
            <span>Bookings</span>
            {pendingCount > 0 && <span className="sidebar-badge">{pendingCount}</span>}
          </button>
          <button className={`sidebar-btn ${activeTab === TABS.FEEDBACKS ? 'active' : ''}`} onClick={() => setActiveTab(TABS.FEEDBACKS)}>
            <Icons.Star />
            <span>Feedback</span>
          </button>
          <button className={`sidebar-btn ${activeTab === TABS.ORDERS ? 'active' : ''}`} onClick={() => setActiveTab(TABS.ORDERS)}>
            <Icons.Package />
            <span>Orders</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            🚪 <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="staff-content">
        {/* BOOKINGS TAB */}
        {activeTab === TABS.BOOKINGS && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Booking Management</h2>
              <div className="panel-stats">
                <span className="stat-chip pending">{pendingCount} pending</span>
                <span className="stat-chip confirmed">{confirmedCount} confirmed</span>
                <span className="stat-chip completed">{completedCount} completed</span>
                <span className="stat-chip cancelled">{cancelledCount} cancelled</span>
              </div>
            </div>
            <div className="panel-toolbar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search ID, pet, service..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button className="clear-btn" onClick={() => setSearchTerm('')}>✕</button>
                )}
              </div>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                {Object.entries(BOOKING_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Pet</th>
                      <th>Service</th>
                      <th>Date & Time</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr><td colSpan="7" className="empty-cell">No bookings yet</td></tr>
                    ) : filteredBookings.map(b => (
                      <tr key={b.bookingId}>
                        <td className="cell-id">#{b.bookingCode || b.bookingId}</td>
                        <td>{b.petName || '-'}</td>
                        <td className="cell-service">{getServiceNames(b.services)}</td>
                        <td>{formatDate(b.startTime || b.bookingDate)}</td>
                        <td className="cell-price">{formatPrice(b.totalPrice)}</td>
                        <td>
                          <span className="status-badge">
                            {getStatusInfo(b.status, BOOKING_STATUSES).label}
                          </span>
                        </td>
                        <td>
                          <div className="action-group">
                            <button
                              className="action-btn detail-btn"
                              onClick={() => {
                                setSelectedBooking(b)
                                setSelectedBookingDoctor(b.doctorId ? String(b.doctorId) : '')
                              }}
                              title="Details"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* FEEDBACKS TAB */}
        {activeTab === TABS.FEEDBACKS && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Feedback Management</h2>
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : (
              <div className="feedbacks-grid">
                {feedbacks.length === 0 ? (
                  <div className="empty-state">No feedback yet</div>
                ) : feedbacks.map(f => (
                  <div className="feedback-card" key={f.feedbackId || f.id}>
                    <div className="feedback-header">
                      <div className="feedback-user">
                        <div className="feedback-avatar">
                          {(f.userName || f.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="feedback-name">{f.userName || f.name || 'User'}</div>
                          <div className="feedback-date">{formatDate(f.createdAt || f.date)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="feedback-rating">
                      {renderStars(f.rating || 0)}
                    </div>
                    <p className="feedback-comment">
                      {f.comment || f.content || <span className="text-muted">No comments</span>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === TABS.ORDERS && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Order Management</h2>
            </div>
            <div className="panel-toolbar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button className="clear-btn" onClick={() => setSearchTerm('')}>✕</button>
                )}
              </div>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Order Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="6" className="empty-cell">No orders yet</td></tr>
                    ) : filteredOrders.map(o => (
                      <tr key={o.orderId}>
                        <td className="cell-id">#{o.orderId}</td>
                        <td>{o.userName || '-'}</td>
                        <td className="cell-price">{formatPrice(o.totalAmount || o.total)}</td>
                        <td>{formatDate(o.orderDate || o.date)}</td>
                        <td>
                          <span className="status-badge">
                            {getStatusInfo(o.status, ORDER_STATUSES).label}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn detail-btn" onClick={() => setSelectedOrder(o)}>Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details #{selectedBooking.bookingCode || selectedBooking.bookingId}</h3>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Pet</label>
                  <span>{selectedBooking.petName || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Date</label>
                  <span>{formatDate(selectedBooking.bookingDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Start Time</label>
                  <span>{formatDate(selectedBooking.startTime)}</span>
                </div>
                <div className="detail-item">
                  <label>End Time</label>
                  <span>{formatDate(selectedBooking.endTime)}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Service</label>
                  <span>{getServiceNames(selectedBooking.services)}</span>
                </div>
                <div className="detail-item">
                  <label>Total</label>
                  <span>{formatPrice(selectedBooking.totalPrice)}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className="status-badge">
                    {getStatusInfo(selectedBooking.status, BOOKING_STATUSES).label}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <label>Note</label>
                  <span>{selectedBooking.note || '-'}</span>
                </div>
              </div>

              {/* Assign Doctor - only show for Pending bookings */}
              {selectedBooking.status === 1 && (
                <div className="assign-doctor-section">
                  <h4>Assign Doctor</h4>
                  <div className="assign-doctor-row">
                    <select
                      value={selectedBookingDoctor}
                      onChange={e => setSelectedBookingDoctor(e.target.value)}
                      className="form-select"
                    >
                      <option value="">-- Select Doctor --</option>
                      {doctors.map(d => (
                        <option key={d.userId || d.doctorId} value={d.userId || d.doctorId}>
                          {d.fullName || d.name || `Dr. #${d.userId || d.doctorId}`}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-assign"
                      onClick={() => handleAssignDoctor(selectedBooking.bookingId)}
                      disabled={!selectedBookingDoctor}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setSelectedBooking(null)}>Close</button>
              {selectedBooking.status === 1 && (
                <>
                  <button className="btn-reject" onClick={() => setConfirmModal({ type: 'reject', booking: selectedBooking, message: 'Are you sure you want to reject this booking?' })}>Reject</button>
                  <button className="btn-approve" onClick={() => setConfirmModal({ type: 'approve', booking: selectedBooking, message: 'Are you sure you want to confirm this booking?' })}>Confirm</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              {confirmModal.type === 'approve' ? '✔️' : '✕'}
            </div>
            <h3 className="confirm-modal-title">
              {confirmModal.type === 'approve' ? 'Confirm Booking' : 'Reject Booking'}
            </h3>
            <p className="confirm-modal-message">{confirmModal.message}</p>
            <p className="confirm-modal-info">
              ID: <strong>#{confirmModal.booking.bookingCode || confirmModal.booking.bookingId}</strong>
              {confirmModal.booking.petName && <> &nbsp;|&nbsp; Pet: <strong>{confirmModal.booking.petName}</strong></>}
            </p>
            <div className="confirm-modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button
                className={confirmModal.type === 'approve' ? 'btn-approve' : 'btn-reject'}
                onClick={confirmModal.type === 'approve' ? handleApproveBooking : handleRejectBooking}
              >
                {confirmModal.type === 'approve' ? 'Confirm' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Order #{selectedOrder.orderId}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={selectedOrder.status}
                  onChange={e => setSelectedOrder({ ...selectedOrder, status: parseInt(e.target.value) })}
                  className="form-select"
                >
                  {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setSelectedOrder(null)}>Cancel</button>
              <button className="btn-save" onClick={() => updateOrderStatus(selectedOrder.orderId, selectedOrder.status)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Staff
