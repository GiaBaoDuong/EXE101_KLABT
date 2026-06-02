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
  1: { label: 'Chờ xử lý', color: '#f59e0b' },
  2: { label: 'Đã xác nhận', color: '#3b82f6' },
  3: { label: 'Đang thực hiện', color: '#8b5cf6' },
  4: { label: 'Đã hoàn thành', color: '#22c55e' },
  5: { label: 'Đã hủy', color: '#ef4444' },
}

const ORDER_STATUSES = {
  0: { label: 'Chờ xử lý', color: '#f59e0b' },
  1: { label: 'Đang giao', color: '#3b82f6' },
  2: { label: 'Đã giao', color: '#22c55e' },
  3: { label: 'Đã hủy', color: '#ef4444' },
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
          fetch(`${API_BASE_URL}/api/staff/BookingManagement`, { headers }),
          fetch(`${API_BASE_URL}/api/staff/BookingManagement/available-doctors`, { headers }),
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
        alert(`Cập nhật thất bại: ${errData.message || res.status}`)
      }
    } catch (e) {
      console.error('Failed to approve booking:', e)
      alert('Đã xảy ra lỗi khi xác nhận.')
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
        alert(`Cập nhật thất bại: ${errData.message || res.status}`)
      }
    } catch (e) {
      console.error('Failed to reject booking:', e)
      alert('Đã xảy ra lỗi khi từ chối.')
    }
  }

  const handleAssignDoctor = async (bookingId) => {
    if (!selectedBookingDoctor) {
      alert('Vui lòng chọn bác sĩ.')
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
        setBookings(prev => prev.map(b => b.bookingId === bookingId ? { ...b, doctorId: parseInt(selectedBookingDoctor) } : b))
        setSelectedBooking(null)
        setSelectedBookingDoctor('')
        alert('Đã chỉ định bác sĩ thành công!')
      } else {
        alert('Chỉ định bác sĩ thất bại.')
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

  const getStatusInfo = (status, statuses) => statuses[status] || { label: 'Không xác định', color: '#999' }

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
            <span>Đặt lịch</span>
            {pendingCount > 0 && <span className="sidebar-badge">{pendingCount}</span>}
          </button>
          <button className={`sidebar-btn ${activeTab === TABS.FEEDBACKS ? 'active' : ''}`} onClick={() => setActiveTab(TABS.FEEDBACKS)}>
            <Icons.Star />
            <span>Phản hồi</span>
          </button>
          <button className={`sidebar-btn ${activeTab === TABS.ORDERS ? 'active' : ''}`} onClick={() => setActiveTab(TABS.ORDERS)}>
            <Icons.Package />
            <span>Đơn hàng</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            🚪 <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="staff-content">
        {/* BOOKINGS TAB */}
        {activeTab === TABS.BOOKINGS && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Quản lý Đặt lịch</h2>
              <div className="panel-stats">
                <span className="stat-chip pending">{pendingCount} chờ</span>
                <span className="stat-chip confirmed">{confirmedCount} xác nhận</span>
                <span className="stat-chip completed">{completedCount} hoàn thành</span>
                <span className="stat-chip cancelled">{cancelledCount} hủy</span>
              </div>
            </div>
            <div className="panel-toolbar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm mã, thú cưng, dịch vụ..."
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
                <option value="all">Tất cả</option>
                {Object.entries(BOOKING_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Thú cưng</th>
                      <th>Dịch vụ</th>
                      <th>Ngày giờ</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr><td colSpan="7" className="empty-cell">Chưa có lịch hẹn nào</td></tr>
                    ) : filteredBookings.map(b => (
                      <tr key={b.bookingId}>
                        <td className="cell-id">#{b.bookingCode || b.bookingId}</td>
                        <td>{b.petName || '-'}</td>
                        <td className="cell-service">{getServiceNames(b.services)}</td>
                        <td>{formatDate(b.startTime || b.bookingDate)}</td>
                        <td className="cell-price">{formatPrice(b.totalPrice)}</td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: getStatusInfo(b.status, BOOKING_STATUSES).color }}>
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
                              title="Chi tiết"
                            >
                              Chi tiết
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
              <h2>Quản lý Phản hồi</h2>
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="feedbacks-grid">
                {feedbacks.length === 0 ? (
                  <div className="empty-state">Chưa có phản hồi nào</div>
                ) : feedbacks.map(f => (
                  <div className="feedback-card" key={f.feedbackId || f.id}>
                    <div className="feedback-header">
                      <div className="feedback-user">
                        <div className="feedback-avatar">
                          {(f.userName || f.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="feedback-name">{f.userName || f.name || 'Người dùng'}</div>
                          <div className="feedback-date">{formatDate(f.createdAt || f.date)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="feedback-rating">
                      {renderStars(f.rating || 0)}
                    </div>
                    <p className="feedback-comment">
                      {f.comment || f.content || <span className="text-muted">Không có bình luận</span>}
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
              <h2>Quản lý Đơn hàng</h2>
            </div>
            <div className="panel-toolbar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
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
                <option value="all">Tất cả</option>
                {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Ngày đặt</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="6" className="empty-cell">Chưa có đơn hàng nào</td></tr>
                    ) : filteredOrders.map(o => (
                      <tr key={o.orderId}>
                        <td className="cell-id">#{o.orderId}</td>
                        <td>{o.userName || '-'}</td>
                        <td className="cell-price">{formatPrice(o.totalAmount || o.total)}</td>
                        <td>{formatDate(o.orderDate || o.date)}</td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: getStatusInfo(o.status, ORDER_STATUSES).color }}>
                            {getStatusInfo(o.status, ORDER_STATUSES).label}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn detail-btn" onClick={() => setSelectedOrder(o)}>Chi tiết</button>
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
              <h3>Chi tiết lịch hẹn #{selectedBooking.bookingCode || selectedBooking.bookingId}</h3>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Thú cưng</label>
                  <span>{selectedBooking.petName || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Ngày đặt</label>
                  <span>{formatDate(selectedBooking.bookingDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Giờ bắt đầu</label>
                  <span>{formatDate(selectedBooking.startTime)}</span>
                </div>
                <div className="detail-item">
                  <label>Giờ kết thúc</label>
                  <span>{formatDate(selectedBooking.endTime)}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Dịch vụ</label>
                  <span>{getServiceNames(selectedBooking.services)}</span>
                </div>
                <div className="detail-item">
                  <label>Tổng tiền</label>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>{formatPrice(selectedBooking.totalPrice)}</span>
                </div>
                <div className="detail-item">
                  <label>Trạng thái</label>
                  <span className="status-badge" style={{ backgroundColor: getStatusInfo(selectedBooking.status, BOOKING_STATUSES).color }}>
                    {getStatusInfo(selectedBooking.status, BOOKING_STATUSES).label}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <label>Ghi chú</label>
                  <span>{selectedBooking.note || '-'}</span>
                </div>
              </div>

              {/* Assign Doctor */}
              <div className="assign-doctor-section">
                <h4>Chỉ định bác sĩ</h4>
                <div className="assign-doctor-row">
                  <select
                    value={selectedBookingDoctor}
                    onChange={e => setSelectedBookingDoctor(e.target.value)}
                    className="form-select"
                  >
                    <option value="">-- Chọn bác sĩ --</option>
                    {doctors.map(d => (
                      <option key={d.doctorId} value={d.doctorId}>
                        {d.fullName || d.name || `Bác sĩ #${d.doctorId}`}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn-assign"
                    onClick={() => handleAssignDoctor(selectedBooking.bookingId)}
                    disabled={!selectedBookingDoctor}
                  >
                    Gán bác sĩ
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setSelectedBooking(null)}>Đóng</button>
              {selectedBooking.status === 1 && (
                <>
                  <button className="btn-reject" onClick={() => setConfirmModal({ type: 'reject', booking: selectedBooking, message: 'Bạn có chắc muốn từ chối lịch hẹn này?' })}>Từ chối</button>
                  <button className="btn-approve" onClick={() => setConfirmModal({ type: 'approve', booking: selectedBooking, message: 'Bạn có chắc muốn xác nhận lịch hẹn này?' })}>Xác nhận</button>
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
              {confirmModal.type === 'approve' ? 'Xác nhận lịch hẹn' : 'Từ chối lịch hẹn'}
            </h3>
            <p className="confirm-modal-message">{confirmModal.message}</p>
            <p className="confirm-modal-info">
              Mã: <strong>#{confirmModal.booking.bookingCode || confirmModal.booking.bookingId}</strong>
              {confirmModal.booking.petName && <> &nbsp;|&nbsp; Thú cưng: <strong>{confirmModal.booking.petName}</strong></>}
            </p>
            <div className="confirm-modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmModal(null)}>Hủy</button>
              <button
                className={confirmModal.type === 'approve' ? 'btn-approve' : 'btn-reject'}
                onClick={confirmModal.type === 'approve' ? handleApproveBooking : handleRejectBooking}
              >
                {confirmModal.type === 'approve' ? 'Xác nhận' : 'Từ chối'}
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
              <h3>Chỉnh sửa đơn hàng #{selectedOrder.orderId}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Trạng thái</label>
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
              <button className="btn-cancel" onClick={() => setSelectedOrder(null)}>Hủy</button>
              <button className="btn-save" onClick={() => updateOrderStatus(selectedOrder.orderId, selectedOrder.status)}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Staff
