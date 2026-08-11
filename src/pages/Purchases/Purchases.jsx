import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SharedNav from '../../components/SharedNav/SharedNav'
import { getOrders, getMyBookings, BOOKING_STATUS_CONFIG } from '../../services/orderService'
import './Purchases.css'

// Tab All/Orders/Services + theo status
const TABS = [
  { key: 'All',           label: 'Tất cả' },
  { key: 'Orders',        label: 'Sản phẩm' },
  { key: 'Services',      label: 'Dịch vụ' },
  { key: 'Pending',       label: 'Chờ xử lý' },
  { key: 'Completed',     label: 'Hoàn thành' },
  { key: 'Cancelled',     label: 'Đã hủy' },
]

// OrderStatus: 1=Pending, 2=Processing, 3=Completed, 4=Cancelled
const ORDER_STATUS = {
  1: { label: 'Chờ xử lý',  color: 'orange' },
  2: { label: 'Đang xử lý', color: 'blue' },
  3: { label: 'Hoàn thành',  color: 'green' },
  4: { label: 'Đã hủy',      color: 'red' },
}

// BookingStatus: 1=Pending, 2=Confirmed, 3=InProgress, 4=Completed, 5=Cancelled
const BOOKING_STATUS_TO_TAB = {
  Pending:    ['Pending'],
  Confirmed:  ['Pending'],
  InProgress: ['Pending'],
  Completed:  ['Completed'],
  Cancelled:  ['Cancelled'],
}

const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconBox = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Purchases() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All')
  const [orders, setOrders] = useState([])
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setIsLoading(true)
    const [o, b] = await Promise.all([getOrders(), getMyBookings()])
    if (o.success) setOrders(o.data || [])
    if (b.success) setBookings(b.data || [])
    setIsLoading(false)
  }

  // Don dang xu ly = order status 1 + booking status 1/2/3
  const pendingCount =
    orders.filter(o => o.status === 1).length +
    bookings.filter(b => [1, 2, 3].includes(b.status ?? b.Status)).length

  // Merge items de hien thi, co tag kind
  const merged = [
    ...orders.map(o => ({ kind: 'order',   id: o.orderId,     data: o, createdAt: o.createdAt })),
    ...bookings.map(b => ({ kind: 'booking', id: b.bookingId, data: b, createdAt: b.createdAt || b.bookingDate })),
  ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  const filtered = merged.filter(item => {
    if (activeTab === 'All') return true
    if (activeTab === 'Orders') return item.kind === 'order'
    if (activeTab === 'Services') return item.kind === 'booking'
    if (activeTab === 'Pending') {
      if (item.kind === 'order') return item.data.status === 1
      return [1, 2, 3].includes(item.data.status ?? item.data.Status)
    }
    if (activeTab === 'Completed') {
      if (item.kind === 'order') return item.data.status === 3
      return item.data.status === 4 || item.data.Status === 4
    }
    if (activeTab === 'Cancelled') {
      if (item.kind === 'order') return item.data.status === 4
      return item.data.status === 5 || item.data.Status === 5
    }
    return true
  })

  const handleClickItem = (item) => {
    if (item.kind === 'order') navigate(`/order/${item.id}`)
    else navigate(`/booking/${item.id}`)
  }

  return (
    <main className="pur-page">
      <SharedNav cartCount={0} />

      {/* Page Header */}
      <div className="pur-header">
        <div className="pur-header__inner">
          <div>
            <p className="pur-header__eyebrow">My Account</p>
            <h1 className="pur-header__title">Đơn hàng & Dịch vụ</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pur-tabs">
        <div className="pur-tabs__inner">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`pur-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.key === 'Pending' && pendingCount > 0 && (
                <span className="pur-tab__badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pur-body">
        <div className="pur-body__inner">

          {isLoading ? (
            <div className="pur-loading">
              {[1, 2, 3].map(i => (
                <div key={i} className="pur-skeleton-order">
                  <div className="skeleton-line" style={{ height: 16, width: '40%' }} />
                  <div className="skeleton-line" style={{ height: 80, width: '100%' }} />
                  <div className="skeleton-line" style={{ height: 40, width: '60%' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="pur-empty">
              <div className="pur-empty__icon">
                <IconBox />
              </div>
              <h3 className="pur-empty__title">
                {activeTab === 'All' ? 'Chưa có đơn hàng / dịch vụ nào' : 'Không có mục nào ở tab này'}
              </h3>
              <p className="pur-empty__sub">
                {activeTab === 'All'
                  ? 'Hãy mua sắm hoặc đặt lịch dịch vụ để xem lịch sử tại đây.'
                  : 'Hãy thay đổi tab khác để xem các mục.'}
              </p>
              <a href="/products" className="pur-empty__cta">Khám phá sản phẩm</a>
            </div>
          ) : (
            <div className="pur-orders">
              {filtered.map(item => {
                if (item.kind === 'order') return <OrderCard key={`o-${item.id}`} order={item.data} onClick={() => handleClickItem(item)} />
                return <BookingCard key={`b-${item.id}`} booking={item.data} onClick={() => handleClickItem(item)} />
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function OrderCard({ order, onClick }) {
  const statusCfg = ORDER_STATUS[order.status] || { label: '—', color: 'gray' }
  return (
    <div className="pur-order" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="pur-order__header">
        <div className="pur-order__meta">
          <span className="pur-order__id">
            <IconPackage style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Đơn hàng #{order.orderId}
          </span>
          <span className="pur-order__date">
            <IconClock /> {formatDate(order.createdAt)}
          </span>
        </div>
        <div className="pur-order__right">
          <span className={`pur-badge pur-badge--kind`}>Sản phẩm</span>
          <span className={`pur-status pur-status--${statusCfg.color}`}>{statusCfg.label}</span>
        </div>
      </div>

      <div className="pur-order__items">
        {(order.items || []).map((it, idx) => (
          <div key={idx} className="pur-item">
            <div className="pur-item__img">
              <img src={it.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} alt={it.productName} />
            </div>
            <div className="pur-item__info">
              <span className="pur-item__name">{it.productName}</span>
              <span className="pur-item__qty">SL: {it.quantity}</span>
            </div>
            <span className="pur-item__price">{formatPrice(it.unitPrice)}</span>
          </div>
        ))}
      </div>

      <div className="pur-order__footer">
        <div className="pur-order__address">
          <span className="pur-order__address-label">Giao đến</span>
          <span className="pur-order__address-value">{order.shippingAddress || '—'}</span>
        </div>
        <div className="pur-order__total">
          <span className="pur-order__total-label">Tổng</span>
          <span className="pur-order__total-value">{formatPrice(order.finalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

function BookingCard({ booking, onClick }) {
  const status = booking.status ?? booking.Status
  const statusCfg = BOOKING_STATUS_CONFIG[status] || { label: '—', bg: '#f5f5f5', color: '#111' }
  const services = booking.bookingServices || booking.BookingServices || []
  const total = booking.totalPrice || booking.totalAmount || booking.TotalPrice || booking.TotalAmount || 0
  const bookingDate = booking.bookingDate || booking.BookingDate
  const petName = booking.petName || booking.PetName || (booking.pet && (booking.pet.name || booking.pet.Name)) || '—'
  const serviceNames = services.map(s => s.serviceName || s.ServiceName).filter(Boolean).join(', ')

  return (
    <div className="pur-order pur-order--booking" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="pur-order__header">
        <div className="pur-order__meta">
          <span className="pur-order__id">
            <IconCalendar style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Dịch vụ #{booking.bookingId}
          </span>
          <span className="pur-order__date">
            <IconClock /> {formatDate(bookingDate || booking.createdAt)}
          </span>
        </div>
        <div className="pur-order__right">
          <span className="pur-badge pur-badge--kind pur-badge--service">Dịch vụ</span>
          <span className="pur-status" style={{ background: statusCfg.bg, color: statusCfg.color }}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="pur-order__items">
        {services.length > 0 ? (
          services.map((s, idx) => (
            <div key={s.bookingServiceId || s.BookingServiceId || idx} className="pur-item">
              <div className="pur-item__img pur-item__img--service">
                <IconCalendar />
              </div>
              <div className="pur-item__info">
                <span className="pur-item__name">{s.serviceName || s.ServiceName}</span>
                <span className="pur-item__qty">Cho {petName} • {formatDateTime(s.scheduledAt || s.ScheduledAt || bookingDate)}</span>
              </div>
              <span className="pur-item__price">{formatPrice(s.price || s.Price)}</span>
            </div>
          ))
        ) : (
          <div className="pur-item">
            <div className="pur-item__img pur-item__img--service">
              <IconCalendar />
            </div>
            <div className="pur-item__info">
              <span className="pur-item__name">{serviceNames || 'Dịch vụ'}</span>
              <span className="pur-item__qty">Cho {petName} • {formatDateTime(bookingDate)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="pur-order__footer">
        <div className="pur-order__address">
          <span className="pur-order__address-label">Thú cưng</span>
          <span className="pur-order__address-value">{petName}</span>
        </div>
        <div className="pur-order__total">
          <span className="pur-order__total-label">Tổng</span>
          <span className="pur-order__total-value">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
