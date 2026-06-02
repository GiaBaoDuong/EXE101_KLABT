import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import './AppHeader.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const BOOKING_STATUSES = {
  1: { label: 'Chờ xử lý', color: '#f59e0b' },
  2: { label: 'Đã xác nhận', color: '#3b82f6' },
  3: { label: 'Đang thực hiện', color: '#8b5cf6' },
  4: { label: 'Đã hoàn thành', color: '#22c55e' },
  5: { label: 'Đã hủy', color: '#ef4444' },
}

function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M10.5 3a7.5 7.5 0 1 1 4.74 13.32l4.22 4.23-1.42 1.41-4.23-4.22A7.5 7.5 0 0 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconBag(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M7 8V7a5 5 0 0 1 10 0v1h3l-1 13H5L4 8h3Zm2 0h6V7a3 3 0 0 0-6 0v1Zm-2.82 2l.77 9h10.1l.77-9H6.18Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconUser(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0-2a2.5 2.5 0 1 1 2.5-2.5A2.5 2.5 0 0 1 12 10Z"
        fill="currentColor"
      />
      <path
        d="M4 21a8 8 0 0 1 16 0h-2a6 6 0 0 0-12 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconBell(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9m-4.27 15a2.5 2.5 0 0 1-4.46 0H4.27Z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconCalendar(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zM7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconCheck(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" />
    </svg>
  )
}

function IconX(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
    </svg>
  )
}

function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor" />
    </svg>
  )
}

export default function AppHeader({
  leftText = 'About',
  nav = [],
  promoText,
  cartCount = 0,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, addNotification } = useNotification()
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [userBookings, setUserBookings] = useState([])
  const notifRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    if (showUserDropdown) {
      fetchUserBookings()
    }
  }, [showUserDropdown])

  // Polling: check booking status changes every 10s
  useEffect(() => {
    if (!user) return

    const knownBookings = new Map() // bookingId -> status

    const poll = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/Booking`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        })
        if (res.ok) {
          const data = await res.json()
          const bookings = Array.isArray(data) ? data : []
          bookings.forEach(b => {
            if (knownBookings.has(b.bookingId)) {
              const prevStatus = knownBookings.get(b.bookingId)
              if (prevStatus !== b.status) {
                if (b.status === 2) {
                  addNotification({
                    type: 'booking_confirmed',
                    title: 'Lịch hẹn đã được xác nhận!',
                    message: `Mã lịch hẹn #${b.bookingCode || b.bookingId} đã được xác nhận.`,
                    link: '/grooming',
                  })
                } else if (b.status === 5) {
                  addNotification({
                    type: 'booking_rejected',
                    title: 'Lịch hẹn đã bị từ chối',
                    message: `Mã lịch hẹn #${b.bookingCode || b.bookingId} đã bị từ chối.`,
                    link: '/grooming',
                  })
                }
              }
            }
            knownBookings.set(b.bookingId, b.status)
          })
        }
      } catch (e) {
        // silent fail
      }
    }

    // Initial fetch
    poll()
    const interval = setInterval(poll, 10000)
    return () => clearInterval(interval)
  }, [user])

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/Booking`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        setUserBookings(Array.isArray(data) ? data.slice(0, 5) : [])
      }
    } catch (e) {
      console.log('Failed to fetch bookings')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleEditProfile = () => {
    setShowUserDropdown(false)
    navigate('/user-profile')
  }

  const handleBookings = () => {
    setShowUserDropdown(false)
    navigate('/grooming')
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case 'booking_pending':
        return <IconCalendar className="notif-icon" />
      case 'booking_confirmed':
        return <IconCheck className="notif-icon success" />
      case 'booking_rejected':
        return <IconX className="notif-icon error" />
      default:
        return <IconBell className="notif-icon" />
    }
  }

  const formatNotifTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Vừa xong'
    if (mins < 60) return `${mins} phút trước`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} giờ trước`
    return `${Math.floor(hrs / 24)} ngày trước`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    })
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifPanel(false)
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="app-header">
      <div className="app-header-top">
        <span className="app-header-left">{leftText}</span>

        <Link to="/home" className="app-logo" aria-label="Go to homepage">
          K-LABT
        </Link>

        <div className="app-actions">
          <button type="button" className="icon-btn" aria-label="Search">
            <IconSearch className="icon" />
          </button>

          {/* Notification Bell */}
          <div className="notif-container" ref={notifRef}>
            <button
              type="button"
              className="icon-btn notif-btn"
              aria-label="Notifications"
              onClick={() => setShowNotifPanel(!showNotifPanel)}
            >
              <IconBell className="icon" />
              {unreadCount > 0 && (
                <span className="notif-badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="notif-panel">
                <div className="notif-header">
                  <h3>Thông báo</h3>
                  {unreadCount > 0 && (
                    <button className="notif-mark-read" onClick={markAllAsRead}>
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <IconBell className="notif-empty-icon" />
                      <p>Chưa có thông báo nào</p>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                        onClick={() => {
                          markAsRead(notif.id)
                          if (notif.link) navigate(notif.link)
                        }}
                      >
                        <div className="notif-item-icon">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="notif-item-content">
                          <p className="notif-item-title">{notif.title}</p>
                          <p className="notif-item-body">{notif.message}</p>
                          <span className="notif-item-time">{formatNotifTime(notif.timestamp)}</span>
                        </div>
                        {!notif.read && <span className="notif-dot"></span>}
                      </div>
                    ))
                  )}
                  <div className="notif-footer">
                    <button className="notif-view-all" onClick={() => { setShowNotifPanel(false); navigate('/notifications') }}>
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="user-dropdown" ref={userRef}>
            <button
              type="button"
              className="icon-btn user-profile-btn"
              aria-label="User Menu"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <IconUser className="icon user-icon" />
            </button>

            {showUserDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <span className="dropdown-name">{user?.fullName}</span>
                    <span className="dropdown-email">{user?.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>

                {/* Booking History */}
                <div className="dropdown-booking-section">
                  <div className="dropdown-section-title">
                    <span className="dropdown-section-icon"><IconCalendar className="section-icon" /></span>
                    Lịch sử đặt lịch
                  </div>
                  {userBookings.length === 0 ? (
                    <div className="dropdown-booking-empty">
                      <p>Chưa có lịch hẹn nào</p>
                    </div>
                  ) : (
                    <div className="dropdown-booking-list">
                      {userBookings.map(b => {
                        const status = BOOKING_STATUSES[b.status] || BOOKING_STATUSES[0]
                        return (
                          <div key={b.bookingId} className="dropdown-booking-item">
                            <div className="booking-item-left">
                              <span className="booking-service-name">{b.serviceName || 'Dịch vụ'}</span>
                              <span className="booking-date-time">
                                <IconClock className="clock-icon" />
                                {formatDate(b.bookingDate || b.date)}
                              </span>
                            </div>
                            <span
                              className="booking-status-chip"
                              style={{ color: status.color }}
                            >
                              {status.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <button className="dropdown-booking-more" onClick={handleBookings}>
                    Đặt lịch mới →
                  </button>
                </div>

                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleEditProfile}>
                  <span className="dropdown-icon">&#9998;</span>
                  Chỉnh sửa thông tin
                </button>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <span className="dropdown-icon"><IconLogout className="logout-icon" /></span>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>

          <Link to="/purchases" className="icon-btn icon-link" aria-label="Purchased items">
            <IconBag className="icon" />
            <span className="badge" aria-label={`Cart count ${cartCount}`}>
              {cartCount}
            </span>
          </Link>
        </div>
      </div>

      {nav?.length ? (
        <nav className="app-nav" aria-label="Primary">
          {nav.map((item) => {
            const isActive = item.to && location.pathname === item.to
            const className = isActive ? 'active' : undefined

            if (item.to) {
              return (
                <Link key={item.label} to={item.to} className={className}>
                  {item.label}
                </Link>
              )
            }

            return (
              <a key={item.label} href={item.href ?? '#'} className={className}>
                {item.label}
              </a>
            )
          })}
        </nav>
      ) : null}

      {promoText ? <div className="app-promo">{promoText}</div> : null}
    </header>
  )
}
