import { useState } from 'react'
import SharedNav from '../../components/SharedNav/SharedNav'
import './Purchases.css'

const TABS = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled']

const ORDER_STATUS = {
  Pending: { label: 'Pending', color: 'orange' },
  Processing: { label: 'Processing', color: 'blue' },
  Completed: { label: 'Completed', color: 'green' },
  Cancelled: { label: 'Cancelled', color: 'red' },
}

const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
  const [activeTab, setActiveTab] = useState('All')

  // TODO: Replace with real API data
  const orders = []

  const filtered = activeTab === 'All'
    ? orders
    : orders.filter(o => o.status === activeTab)

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
              {tab === 'Pending' && orders.filter(o => o.status === 'Pending').length > 0 && (
                <span className="pur-tab__badge">
                  {orders.filter(o => o.status === 'Pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="pur-body">
        <div className="pur-body__inner">

          {filtered.length === 0 ? (
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
                <div key={order.orderId} className="pur-order">
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
                        {order.status === 'Processing' && <IconChevron />}
                        {order.status === 'Pending' && <IconClock />}
                        {order.status === 'Completed' && <IconCheck />}
                        {order.status === 'Cancelled' && <IconX />}
                        {ORDER_STATUS[order.status]?.label || order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="pur-order__items">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="pur-item">
                        <div className="pur-item__img">
                          <img src={item.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&q=80'} alt={item.name} />
                        </div>
                        <div className="pur-item__info">
                          <span className="pur-item__name">{item.name}</span>
                          <span className="pur-item__qty">Qty: {item.quantity}</span>
                        </div>
                        <span className="pur-item__price">{formatPrice(item.price)}</span>
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
                      <span className="pur-order__total-value">{formatPrice(order.total)}</span>
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
