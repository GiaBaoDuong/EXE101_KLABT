import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getOrderById, deleteOrder, getStatusLabel, getPaymentStatusLabel, getOrderTypeLabel } from '../../services/orderService'
import './OrderConfirmation.css'

function OrderConfirmation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!orderId) {
      setError('Không có thông tin đơn hàng')
      setLoading(false)
      return
    }

    getOrderById(orderId).then(res => {
      if (res.success) {
        setOrder(res.data)
      } else {
        setError(res.message || 'Không tải được đơn hàng')
      }
      setLoading(false)
    })
  }, [orderId])

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

  const handleGoCheckout = () => {
    navigate(`/checkout?orderId=${orderId}`)
  }

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    setCancelling(true)
    try {
      const res = await deleteOrder(orderId)
      if (res.success) {
        navigate('/products')
      } else {
        alert(res.message || 'Không thể hủy đơn. Vui lòng thử lại.')
        setCancelling(false)
      }
    } catch (e) {
      alert('Có lỗi xảy ra, vui lòng thử lại.')
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="oc-page">
        <div className="oc-container">
          <div className="oc-loading">
            <div className="oc-spinner" />
            Đang tải thông tin đơn hàng...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="oc-page">
        <div className="oc-container">
          <div className="oc-error-card">
            <div className="oc-error-text">{error}</div>
            <button
              className="oc-btn oc-btn-primary"
              onClick={() => navigate('/products')}
            >
              Quay lại cửa hàng
            </button>
          </div>
        </div>
      </div>
    )
  }

  const paymentStatus = order?.paymentStatus ?? order?.PaymentStatus
  const orderStatus = order?.status ?? order?.Status ?? 1

  return (
    <div className="oc-page">
      <div className="oc-container">
        <div className="oc-header">
          <button className="oc-back" onClick={() => navigate('/products')}>
            ← Tiếp tục mua sắm
          </button>
          <h1>Xác nhận đơn hàng</h1>
          <p className="oc-subtitle">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
        </div>

        <div className="oc-card">
          <div className="oc-card-header">
            <div className="oc-order-info">
              <span className="oc-order-code">{order?.orderCode}</span>
              <span className="oc-order-date">{formatDate(order?.createdAt || order?.CreatedAt)}</span>
            </div>
            <div className="oc-badges">
              <span className={`badge badge-${getStatusBadgeClass(orderStatus)}`}>
                {getStatusLabel(orderStatus)}
              </span>
              <span className={`badge badge-${getPaymentBadgeClass(paymentStatus)}`}>
                {getPaymentStatusLabel(paymentStatus)}
              </span>
            </div>
          </div>

          <div className="oc-items">
            <h3>Sản phẩm</h3>
            {(order?.items || []).map(item => (
              <div key={item.orderItemId || item.OrderItemId} className="oc-item-row">
                <div className="oc-item-left">
                  <span className="oc-item-name">{item.productName || item.ProductName}</span>
                  <span className="oc-item-meta">
                    {formatMoney(item.unitPrice || item.UnitPrice)} &times; {item.quantity || item.Quantity}
                  </span>
                </div>
                <span className="oc-item-subtotal">
                  {formatMoney(item.subTotal || item.SubTotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="oc-summary">
            <div className="oc-summary-row">
              <span>Tổng tiền hàng</span>
              <span>{formatMoney(order?.totalAmount || order?.TotalAmount || 0)}</span>
            </div>
            {(order?.discountAmount || order?.DiscountAmount || 0) > 0 && (
              <div className="oc-summary-row oc-discount">
                <span>Giảm giá</span>
                <span>-{formatMoney(order?.discountAmount || order?.DiscountAmount)}</span>
              </div>
            )}
            <div className="oc-summary-row oc-final">
              <span>Thành tiền</span>
              <span className="oc-final-amount">
                {formatMoney(order?.finalAmount || order?.FinalAmount || 0)}
              </span>
            </div>
          </div>

          <div className="oc-address">
            <h3>Địa chỉ giao hàng</h3>
            <p>{order?.shippingAddress || order?.ShippingAddress || 'Chưa cung cấp'}</p>
          </div>

          <div className="oc-info-row">
            <span>Loại đơn:</span>
            <span>{getOrderTypeLabel(order?.orderType ?? order?.OrderType ?? 0)}</span>
          </div>
        </div>

        <div className="oc-actions">
          <button
            className="oc-btn oc-btn-primary"
            onClick={handleGoCheckout}
          >
            Xác nhận thanh toán
          </button>
          <button
            className="oc-btn oc-btn-cancel"
            onClick={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? 'Đang hủy...' : 'Hủy đơn'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
