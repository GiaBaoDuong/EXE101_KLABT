import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SharedNav from '../../components/SharedNav/SharedNav'
import { getOrders } from '../../services/orderService'
import './Purchases.css'

const TABS = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled']

// OrderStatus enum: 1=Pending, 2=Processing, 3=Completed, 4=Cancelled
const ORDER_STATUS = {
  1: { label: 'Pending', color: 'orange' },
  2: { label: 'Processing', color: 'blue' },
  3: { label: 'Completed', color: 'green' },
  4: { label: 'Cancelled', color: 'red' },
}

const STATUS_TAB_MAP = {
  'Pending': [1],
  'Processing': [2],
  'Completed': [3],
  'Cancelled': [4],
}

const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
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

export default function Purchases() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('All')
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setIsLoading(true)
    const res = await getOrders()
    if (res.success) {
      setOrders(res.data || [])
    }
    setIsLoading(false)
  }

  const filtered = activeTab === 'All'
    ? orders
    : orders.filter(o => STATUS_TAB_MAP[activeTab]?.includes(o.status))

  const pendingCount = orders.filter(o => o.status === 1).length

  return (
    <main className="pur-page">
      <SharedNav cartCount={0} />

      {/* Page Header */}
      <div className="pur-header">
        <div className="pur-header__inner">
          <div>
            <p className="pur-header__eyebrow">My Account</p>
            <h1 className="pur-header__title">Orders</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pur-tabs">
        <div className="pur-tabs__inner">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`pur-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'Pending' && pendingCount > 0 && (
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
                {activeTab === 'All' ? 'No orders yet' : `No ${activeTab.toLowerCase()} orders`}
              </h3>
              <p className="pur-empty__sub">
                {activeTab === 'All'
                  ? 'Start shopping to see your orders here.'
                  : `You don't have any ${activeTab.toLowerCase()} orders at the moment.`}
              </p>
              <a href="/products" className="pur-empty__cta">Browse Products</a>
            </div>
          ) : (
            <div className="pur-orders">
              {filtered.map(order => (
                <div
                  key={order.orderId}
                  className="pur-order"
                  onClick={() => navigate(`/order/${order.orderId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Order Header */}
                  <div className="pur-order__header">
                    <div className="pur-order__meta">
                      <span className="pur-order__id">Order #{order.orderId}</span>
                      <span className="pur-order__date">
                        <IconClock /> {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="pur-order__right">
                      <span className={`pur-status pur-status--${ORDER_STATUS[order.status]?.color || 'gray'}`}>
                        {ORDER_STATUS[order.status]?.label || order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="pur-order__items">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="pur-item">
                        <div className="pur-item__img">
                          <img src={item.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} alt={item.productName} />
                        </div>
                        <div className="pur-item__info">
                          <span className="pur-item__name">{item.productName}</span>
                          <span className="pur-item__qty">Qty: {item.quantity}</span>
                        </div>
                        <span className="pur-item__price">{formatPrice(item.unitPrice)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="pur-order__footer">
                    <div className="pur-order__address">
                      <span className="pur-order__address-label">Ship to</span>
                      <span className="pur-order__address-value">{order.shippingAddress || '—'}</span>
                    </div>
                    <div className="pur-order__total">
                      <span className="pur-order__total-label">Total</span>
                      <span className="pur-order__total-value">{formatPrice(order.finalAmount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
