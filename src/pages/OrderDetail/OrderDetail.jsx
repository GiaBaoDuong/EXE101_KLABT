import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOrderById, cancelOrder, getStatusLabel, getPaymentStatusLabel, getOrderTypeLabel } from '../../services/orderService'
import SharedNav from '../../components/SharedNav/SharedNav'
import './OrderDetail.css'

// OrderStatus: 1=Pending, 2=Processing, 3=Completed, 4=Cancelled
const ORDER_STATUS_CONFIG = {
  1: { label: 'Chờ xác nhận', bg: '#fff3e0', color: '#e65100' },
  2: { label: 'Đang xử lý', bg: '#e3f2fd', color: '#0d47a1' },
  3: { label: 'Đã hoàn thành', bg: '#e8f5e9', color: '#1b5e20' },
  4: { label: 'Đã hủy', bg: '#fce4ec', color: '#b71c1c' },
}

// PaymentStatus: 1=Unpaid, 2=Paid, 3=Refunded, 4=Failed
const PAYMENT_STATUS_CONFIG = {
  1: { label: 'Chưa thanh toán', bg: '#fff3e0', color: '#e65100' },
  2: { label: 'Đã thanh toán', bg: '#e8f5e9', color: '#1b5e20' },
  3: { label: 'Đã hoàn tiền', bg: '#f3e5f5', color: '#4a148c' },
  4: { label: 'Thất bại', bg: '#fce4ec', color: '#b71c1c' },
}

const ORDER_TYPE_CONFIG = {
  1: 'Sản phẩm',
  2: 'Dịch vụ',
  3: 'Hỗn hợp',
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [id])

  const loadOrder = async () => {
    setLoading(true)
    setError('')
    const res = await getOrderById(id)
    if (res.success) {
      setOrder(res.data)
    } else {
      setError(res.message || 'Không tải được đơn hàng')
    }
    setLoading(false)
  }

  const handlePay = () => {
    navigate(`/checkout?orderId=${id}`)
  }

  const handleCancel = async () => {
    if (!window.confirm(`Bạn có chắc muốn hủy đơn ${order.orderCode || `#${id}`}?`)) return
    setActionLoading(true)
    const res = await cancelOrder(id)
    setActionLoading(false)
    if (res.success) {
      await loadOrder()
    } else {
      alert(res.message || 'Không thể hủy đơn')
    }
  }

  if (loading) {
    return (
      <div className="od-page">
        <SharedNav />
        <div className="od-container">
          <div className="od-loading">
            <div className="od-spinner" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="od-page">
        <SharedNav />
        <div className="od-container">
          <div className="od-error">
            <h3>{error}</h3>
            <button className="od-btn od-btn-primary" onClick={() => navigate(-1)}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statusCfg = ORDER_STATUS_CONFIG[order.status] || { label: '—', bg: '#f5f5f5', color: '#111' }
  const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus] || { label: '—', bg: '#f5f5f5', color: '#111' }
  const canCancel = order.status === 1 && order.paymentStatus === 1
  const canPay = order.status === 1 && order.paymentStatus === 1

  return (
    <div className="od-page">
      <SharedNav />

      <div className="od-container">
        {/* Back */}
        <button className="od-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Quay lại
        </button>

        {/* Header */}
        <div className="od-header">
          <div className="od-header__left">
            <p className="od-header__eyebrow">Order Detail</p>
            <h1 className="od-header__title">{order.orderCode || `Order #${order.orderId}`}</h1>
            <span className="od-header__date">{formatDate(order.createdAt)}</span>
          </div>
          <div className="od-header__badges">
            <span
              className="od-badge"
              style={{ background: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </span>
            <span
              className="od-badge"
              style={{ background: paymentCfg.bg, color: paymentCfg.color }}
            >
              {paymentCfg.label}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="od-section">
          <h2 className="od-section__title">Sản phẩm</h2>
          <div className="od-items">
            {(order.items || []).map((item, idx) => (
              <div key={item.orderItemId || idx} className="od-item">
                <div className="od-item__img">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=120&q=80'}
                    alt={item.productName || item.ProductName}
                  />
                </div>
                <div className="od-item__info">
                  <span className="od-item__name">{item.productName || item.ProductName}</span>
                  <span className="od-item__meta">
                    {formatPrice(item.unitPrice || item.UnitPrice)} × {item.quantity || item.Quantity}
                  </span>
                </div>
                <span className="od-item__price">
                  {formatPrice(item.subTotal || item.SubTotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="od-section od-summary">
          <div className="od-summary__row">
            <span>Tổng tiền hàng</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
          {(order.discountAmount || 0) > 0 && (
            <div className="od-summary__row od-summary__discount">
              <span>Giảm giá</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="od-summary__divider" />
          <div className="od-summary__row od-summary__final">
            <span>Thành tiền</span>
            <span>{formatPrice(order.finalAmount)}</span>
          </div>
        </div>

        {/* Info */}
        <div className="od-section od-info">
          <div className="od-info__row">
            <span className="od-info__label">Loại đơn</span>
            <span className="od-info__value">
              {ORDER_TYPE_CONFIG[order.orderType] || getOrderTypeLabel(order.orderType)}
            </span>
          </div>
          <div className="od-info__row">
            <span className="od-info__label">Địa chỉ giao hàng</span>
            <span className="od-info__value">{order.shippingAddress || '—'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="od-actions">
          {canPay && (
            <button className="od-btn od-btn-primary" onClick={handlePay}>
              Thanh toán ngay
            </button>
          )}
          {canCancel && (
            <button
              className="od-btn od-btn-outline"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              {actionLoading ? 'Đang hủy...' : 'Hủy đơn hàng'}
            </button>
          )}
          {!canPay && !canCancel && (
            <button className="od-btn od-btn-outline" onClick={() => navigate('/purchases')}>
              Xem danh sách đơn hàng
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
