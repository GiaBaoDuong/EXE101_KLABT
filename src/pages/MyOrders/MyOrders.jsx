import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getOrders,
  cancelOrder,
  getStatusLabel,
  getPaymentStatusLabel,
  getOrderTypeLabel,
} from '../../services/mockOrderService'
import SharedNav from '../../components/SharedNav/SharedNav'
import './MyOrders.css'

function MyOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    const res = await getOrders()
    if (res.success) {
      setOrders(res.data)
    } else {
      setError(res.message || 'Lỗi tải đơn hàng')
    }
    setLoading(false)
  }

  const formatMoney = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' VND'

  const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const getStatusBadgeClass = (s) => {
    return { 1: 'pending', 2: 'processing', 3: 'completed', 4: 'cancelled' }[s] || 'pending'
  }

  const getPaymentBadgeClass = (s) => {
    return { 1: 'unpaid', 2: 'paid', 3: 'refunded', 4: 'failed' }[s] || 'unpaid'
  }

  const handlePay = (order) => {
    navigate(`/order-confirmation?orderId=${order.orderId}`)
  }

  const handleCancel = async (order) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đơn ${order.orderCode}?`)) return
    setActionLoading(order.orderId)
    const res = await cancelOrder(order.orderId)
    if (res.success) {
      await loadOrders()
    } else {
      alert(res.message)
    }
    setActionLoading(null)
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === Number(filter))

  return (
    <div className="orders-page">
      <SharedNav />
      <div className="orders-container">
        <div className="orders-header">
          <div>
            <h1>Đơn hàng của tôi</h1>
            <p className="orders-subtitle">Danh sách đơn hàng của bạn</p>
          </div>
          <button className="btn-refresh" onClick={loadOrders} disabled={loading}>
            {loading ? 'Đang tải...' : '↻ Làm mới'}
          </button>
        </div>

        <div className="orders-filter">
          {[
            { v: 'all', label: 'Tất cả' },
            { v: '0', label: 'Chờ xác nhận' },
            { v: '1', label: 'Đã xác nhận' },
            { v: '2', label: 'Đang giao' },
            { v: '3', label: 'Đã giao' },
            { v: '4', label: 'Đã hủy' },
          ].map(f => (
            <button
              key={f.v}
              className={`filter-btn ${filter === f.v ? 'active' : ''}`}
              onClick={() => setFilter(f.v)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <div className="orders-error">{error}</div>}

        {loading ? (
          <div className="orders-loading">Đang tải đơn hàng...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <p>Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => (
              <div key={order.orderId} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-code">{order.orderCode}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-badges">
                    <span className={`badge badge-${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className={`badge badge-${getPaymentBadgeClass(order.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                </div>

                <div className="order-card-items">
                  {order.items.map(item => (
                    <div key={item.orderItemId} className="order-item-row">
                      <div className="item-left">
                        <span className="item-name">{item.productName}</span>
                        <span className="item-meta">
                          {formatMoney(item.unitPrice)} × {item.quantity}
                        </span>
                      </div>
                      <span className="item-subtotal">{formatMoney(item.subTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-address">
                    <span className="meta-label">📍 Giao đến:</span> {order.shippingAddress}
                  </div>
                  <div className="order-total">
                    <span className="meta-label">Loại:</span> {getOrderTypeLabel(order.orderType)}
                    {order.discountAmount > 0 && (
                      <span className="discount-info"> (giảm {formatMoney(order.discountAmount)})</span>
                    )}
                    <div className="total-amount">
                      Tổng: <strong>{formatMoney(order.finalAmount)}</strong>
                    </div>
                  </div>
                </div>

                <div className="order-card-actions">
                  {order.status === 0 && order.paymentStatus === 0 && (
                    <>
                      <button
                        className="btn-action btn-pay"
                        onClick={() => handlePay(order)}
                      >
                        💳 Thanh toán ngay
                      </button>
                      <button
                        className="btn-action btn-cancel"
                        onClick={() => handleCancel(order)}
                        disabled={actionLoading === order.orderId}
                      >
                        {actionLoading === order.orderId ? 'Đang hủy...' : '✕ Hủy đơn'}
                      </button>
                    </>
                  )}
                  {order.status !== 0 && (
                    <span className="action-locked">Đơn hàng đã xử lý, không thể thay đổi</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyOrders
