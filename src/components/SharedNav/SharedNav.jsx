import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import './SharedNav.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const BOOKING_STATUSES = {
  1: { label: 'Pending', color: '#f59e0b' },
  2: { label: 'Confirmed', color: '#3b82f6' },
  3: { label: 'In Progress', color: '#8b5cf6' },
  4: { label: 'Completed', color: '#22c55e' },
  5: { label: 'Cancelled', color: '#ef4444' },
}

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

export default function SharedNav({ cartCount = 0 }) {
  const { logout, user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification()
  const navigate = useNavigate()
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [userBookings, setUserBookings] = useState([])
  const notifRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    if (showUserDropdown) fetchUserBookings()
  }, [showUserDropdown])

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifPanel(false)
      if (userRef.current && !userRef.current.contains(event.target)) setShowUserDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/Booking`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      })
      if (res.ok) {
        const data = await res.json()
        setUserBookings(Array.isArray(data) ? data.slice(0, 5) : [])
      }
    } catch (e) { /* silent */ }
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const handleEditProfile = () => { setShowUserDropdown(false); navigate('/user-profile') }
  const handleBookings = () => { setShowUserDropdown(false); navigate('/grooming') }

  const getNotifIcon = (type) => {
    if (type === 'booking_confirmed') return <IconCheck />
    if (type === 'booking_rejected') return <IconX />
    return <BellIcon />
  }

  const formatNotifTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const formatDate = (d) => {
    if (!d) return '-'
    const date = new Date(d)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="sn-header">
      {/* Utility Bar */}
      <div className="sn-utility-bar">
        <div className="sn-utility-bar__inner">
          <span className="sn-utility-bar__text">Free shipping on orders over 500K VND</span>
          <div className="sn-utility-bar__links">
            <a href="#">Find a Store</a>
            <a href="#">Help</a>
            <a href="#">Join Us</a>
            <a href="#">Sign In</a>
          </div>
        </div>
      </div>

      {/* Primary Nav */}
      <nav className="sn-nav">
        <div className="sn-nav__inner">
          <Link to="/home" className="sn-nav__logo">K-LABT</Link>

          <ul className="sn-nav__links">
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/pet-health-quiz">Health Check</Link></li>
            <li><Link to="/grooming">Grooming</Link></li>
            <li><Link to="/pet-profile">Pet Profile</Link></li>
            <li><Link to="/purchases">Purchases</Link></li>
          </ul>

          <div className="sn-nav__actions">
            <button className="sn-icon-btn" aria-label="Search"><SearchIcon /></button>
            <button className="sn-icon-btn" aria-label="Wishlist"><HeartIcon /></button>

            {/* Bell Notification */}
            <div className="sn-notif" ref={notifRef}>
              <button
                className="sn-icon-btn"
                aria-label="Notifications"
                onClick={() => setShowNotifPanel(v => !v)}
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <span className="sn-notif__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {showNotifPanel && (
                <div className="sn-notif__panel">
                  <div className="sn-notif__header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button className="sn-notif__mark-read" onClick={markAllAsRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="sn-notif__list">
                    {notifications.length === 0 ? (
                      <div className="sn-notif__empty">
                        <BellIcon />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`sn-notif__item ${n.read ? 'read' : 'unread'}`}
                          onClick={() => { markAsRead(n.id); if (n.link) navigate(n.link) }}
                        >
                          <div className="sn-notif__item-icon">{getNotifIcon(n.type)}</div>
                          <div className="sn-notif__item-body">
                            <p className="sn-notif__item-title">{n.title}</p>
                            <p className="sn-notif__item-msg">{n.message}</p>
                            <span className="sn-notif__item-time">{formatNotifTime(n.timestamp)}</span>
                          </div>
                          {!n.read && <span className="sn-notif__dot" />}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="sn-notif__footer">
                    <button className="sn-notif__view-all" onClick={() => { setShowNotifPanel(false); navigate('/notifications') }}>
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="sn-user" ref={userRef}>
              <button
                className="sn-icon-btn"
                aria-label="User Menu"
                onClick={() => setShowUserDropdown(v => !v)}
              >
                <UserIcon />
              </button>
              {showUserDropdown && (
                <div className="sn-user__dropdown">
                  <div className="sn-user__header">
                    <div className="sn-user__avatar">
                      {(user?.avatarUrl) ? (
                        <img src={user.avatarUrl} alt={user?.fullName} />
                      ) : (
                        <span className="sn-user__avatar-initials">
                          {(user?.fullName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="sn-user__info">
                      <span className="sn-user__name">{user?.fullName || 'User'}</span>
                      <span className="sn-user__email">{user?.email || ''}</span>
                    </div>
                  </div>
                  <div className="sn-user__divider" />
                  <div className="sn-user__bookings">
                    <div className="sn-user__bookings-header">
                      <div className="sn-user__bookings-title">
                        <IconCalendar />
                        Booking History
                      </div>
                      <button className="sn-user__bookings-new-btn" onClick={handleBookings}>+ Book now</button>
                    </div>
                    {userBookings.length === 0 ? (
                      <div className="sn-user__bookings-empty"><p>No bookings yet</p></div>
                    ) : (
                      <div className="sn-user__bookings-list">
                        {userBookings.map(b => {
                          const status = BOOKING_STATUSES[b.status] || BOOKING_STATUSES[1]
                          return (
                            <div key={b.bookingId} className="sn-user__booking-item">
                              <div className="sn-user__booking-left">
                                <span className="sn-user__booking-service">{b.serviceName || 'Service'}</span>
                                <span className="sn-user__booking-date">
                                  <IconClock />
                                  {formatDate(b.bookingDate || b.date)}
                                </span>
                              </div>
                              <span className="sn-user__booking-status" style={{ color: status.color }}>{status.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <div className="sn-user__divider" />
                  <div className="sn-user__actions">
                    <button className="sn-user__item" onClick={handleEditProfile}><IconEdit />Edit profile</button>
                    <button className="sn-user__item sn-user__item--logout" onClick={handleLogout}><IconLogout />Log out</button>
                  </div>
                </div>
              )}
            </div>

            <Link to="/purchases" className="sn-icon-btn sn-icon-link" aria-label="Shopping bag">
              <BagIcon />
              {cartCount > 0 && <span className="sn-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
