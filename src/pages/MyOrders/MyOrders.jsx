import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getOrders,
  cancelOrder,
  getStatusLabel,
  getPaymentStatusLabel,
  getOrderTypeLabel,
} from '../../services/orderService'
import SharedNav from '../../components/SharedNav/SharedNav'
import './MyOrders.css'

// OrderStatus: 1=Pending, 2=Processing, 3=Completed, 4=Cancelled
const ORDER_STATUS = {
  1: { label: 'Chờ xác nhận', color: 'pending' },
  2: { label: 'Đang xử lý', color: 'processing' },
  3: { label: 'Đã hoàn thành', color: 'completed' },
  4: { label: 'Đã hủy', color: 'cancelled' },
}

// PaymentStatus: 1=Unpaid, 2=Paid, 3=Refunded, 4=Failed
const PAYMENT_STATUS = {
  1: { label: 'Chưa thanh toán', color: 'unpaid' },
  2: { label: 'Đã thanh toán', color: 'paid' },
  3: { label: 'Đã hoàn tiền', color: 'refunded' },
  4: { label: 'Thất bại', color: 'failed' },
}

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
      setOrders(res.data || [])
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

  const handleOrderClick = (order) => {
    navigate(`/order/${order.orderId}`)
  }

  const handlePay = (e, order) => {
    e.stopPropagation()
    navigate(`/checkout?orderId=${order.orderId}`)
  }

  const handleCancel = async (e, order) => {
    e.stopPropagation()
    if (!window.confirm(`Bạn có chắc muốn hủy đơn ${order.orderCode || order.orderId}?`)) return
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
            { v: '1', label: 'Chờ xác nhận' },
            { v: '2', label: 'Đang xử lý' },
            { v: '3', label: 'Đã hoàn thành' },
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
              <div
                key={order.orderId}
                className="order-card"
                onClick={() => handleOrderClick(order)}
                style={{ cursor: 'pointer' }}
              >
                <div className="order-card-header">
                  <div>
                    <span className="order-code">{order.orderCode || `Order #${order.orderId}`}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-badges">
                    <span className={`badge badge-${ORDER_STATUS[order.status]?.color || 'pending'}`}>
                      {ORDER_STATUS[order.status]?.label || getStatusLabel(order.status)}
                    </span>
                    <span className={`badge badge-${PAYMENT_STATUS[order.paymentStatus]?.color || 'unpaid'}`}>
                      {PAYMENT_STATUS[order.paymentStatus]?.label || getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                </div>

                <div className="order-card-items">
                  {(order.items || []).map(item => (
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
                    <span className="meta-label">📍 Giao đến:</span> {order.shippingAddress || '—'}
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

                <div className="order-card-actions" onClick={e => e.stopPropagation()}>
                  {order.status === 1 && order.paymentStatus === 1 && (
                    <>
                      <button
                        className="btn-action btn-pay"
                        onClick={(e) => handlePay(e, order)}
                      >
                        💳 Thanh toán ngay
                      </button>
                      <button
                        className="btn-action btn-cancel"
                        onClick={(e) => handleCancel(e, order)}
                        disabled={actionLoading === order.orderId}
                      >
                        {actionLoading === order.orderId ? 'Đang hủy...' : '✕ Hủy đơn'}
                      </button>
                    </>
                  )}
                  {order.status !== 1 && (
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
