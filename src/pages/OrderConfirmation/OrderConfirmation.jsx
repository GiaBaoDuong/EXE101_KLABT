import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getOrderById, updateOrder, deleteOrder, getStatusLabel, getPaymentStatusLabel, getOrderTypeLabel } from '../../services/orderService'
import SharedNav from '../../components/SharedNav/SharedNav'
import Footer from '../../components/Footer/Footer'
import './OrderConfirmation.css'

function OrderConfirmation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressInput, setAddressInput] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)

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
    setShowCancelModal(false)
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

  const startEditAddress = () => {
    setAddressInput(order?.shippingAddress || order?.ShippingAddress || '')
    setEditingAddress(true)
  }

  const cancelEditAddress = () => {
    setEditingAddress(false)
    setAddressInput('')
  }

  const saveAddress = async () => {
    if (!addressInput.trim()) return
    setSavingAddress(true)
    try {
      const res = await updateOrder(orderId, { shippingAddress: addressInput.trim() })
      if (res.success) {
        setOrder(prev => ({ ...prev, shippingAddress: addressInput.trim() }))
        setEditingAddress(false)
      } else {
        alert(res.message || 'Không thể cập nhật địa chỉ')
      }
    } catch (e) {
      alert('Có lỗi xảy ra, vui lòng thử lại.')
    }
    setSavingAddress(false)
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
      <SharedNav />

      {/* Hero */}
      <div className="oc-hero">
        <div className="oc-hero__check-wrap">
          <svg className="oc-hero__check" viewBox="0 0 28 28" fill="none">
            <polyline points="5,14 11,20 23,8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="oc-hero__title">Đơn hàng đã tạo</h1>
        <p className="oc-hero__subtitle">Cảm ơn bạn đã đặt hàng tại Pet Shop</p>
      </div>

      <div className="oc-container">
        {/* Order Header */}
        <div className="oc-order-header">
          <div className="oc-order-header__left">
            <span className="oc-order-header__label">Mã đơn hàng</span>
            <span className="oc-order-header__code">{order?.orderCode}</span>
            <span className="oc-order-header__date">{formatDate(order?.createdAt || order?.CreatedAt)}</span>
          </div>
          <div className="oc-order-header__badges">
            <span className={`oc-badge oc-badge--${getStatusBadgeClass(orderStatus)}`}>
              {getStatusLabel(orderStatus)}
            </span>
            <span className={`oc-badge oc-badge--${getPaymentBadgeClass(paymentStatus)}`}>
              {getPaymentStatusLabel(paymentStatus)}
            </span>
          </div>
        </div>

        {/* Two-column body */}
        <div className="oc-body">
          {/* Items */}
          <div className="oc-items-section">
            <p className="oc-section-label">Sản phẩm</p>
            {(order?.items || []).map(item => (
              <div key={item.orderItemId || item.OrderItemId} className="oc-item-card">
                <img
                  className="oc-item-card__img"
                  src={item.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=144&q=80'}
                  alt={item.productName || item.ProductName}
                />
                <div className="oc-item-card__info">
                  <p className="oc-item-card__name">{item.productName || item.ProductName}</p>
                  <p className="oc-item-card__meta">
                    {formatMoney(item.unitPrice || item.UnitPrice)} &times; {item.quantity || item.Quantity}
                  </p>
                </div>
                <div className="oc-item-card__right">
                  <span className="oc-item-card__price">
                    {formatMoney(item.subTotal || item.SubTotal)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="oc-summary">
            <div className="oc-summary-card">
              <div className="oc-summary-row">
              <span className="oc-summary-row__label">Tổng tiền hàng</span>
              <span className="oc-summary-row__value">{formatMoney(order?.totalAmount || order?.TotalAmount || 0)}</span>
            </div>
            {(order?.discountAmount || order?.DiscountAmount || 0) > 0 && (
              <div className="oc-summary-row oc-summary-row--discount">
                <span className="oc-summary-row__label">Giảm giá</span>
                <span className="oc-summary-row__value">-{formatMoney(order?.discountAmount || order?.DiscountAmount)}</span>
              </div>
            )}
              <div className="oc-summary-divider" />
              <div className="oc-summary-total">
                <span className="oc-summary-total__label">Thành tiền</span>
                <span className="oc-summary-total__amount">
                  {formatMoney(order?.finalAmount || order?.FinalAmount || 0)}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="oc-info-rows">
              <div className="oc-info-section">
                <div className="oc-address-header">
                  <p className="oc-section-label">Địa chỉ giao hàng</p>
                  {!editingAddress && (
                    <button className="oc-edit-btn" onClick={startEditAddress} title="Sửa địa chỉ">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                </div>

                {editingAddress ? (
                  <div className="oc-address-edit">
                    <input
                      className="oc-address-input"
                      type="text"
                      value={addressInput}
                      onChange={e => setAddressInput(e.target.value)}
                      placeholder="Nhập địa chỉ giao hàng"
                      autoFocus
                    />
                    <div className="oc-address-edit-actions">
                      <button
                        className="oc-btn oc-btn-secondary oc-btn-sm"
                        onClick={cancelEditAddress}
                        disabled={savingAddress}
                      >
                        Hủy
                      </button>
                      <button
                        className="oc-btn oc-btn-primary oc-btn-sm"
                        onClick={saveAddress}
                        disabled={savingAddress || !addressInput.trim()}
                      >
                        {savingAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="oc-info-row">
                    <span className="oc-info-row__label">Nơi giao hàng</span>
                    <span className="oc-info-row__value">{order?.shippingAddress || order?.ShippingAddress || 'Chưa cung cấp'}</span>
                  </div>
                )}
              </div>
              <div className="oc-info-section">
                <div className="oc-info-row">
                  <span className="oc-info-row__label">Loại đơn</span>
                  <span className="oc-info-row__value">{getOrderTypeLabel(order?.orderType ?? order?.OrderType ?? 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="oc-actions">
          <button
            className="oc-btn oc-btn-primary"
            onClick={handleGoCheckout}
          >
            Xác nhận thanh toán
          </button>
          <button
            className="oc-btn oc-btn-secondary"
            onClick={() => setShowCancelModal(true)}
            disabled={cancelling}
          >
            {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
          </button>
          <button
            className="oc-btn oc-btn-ghost"
            onClick={() => navigate('/products')}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="oc-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="oc-modal" onClick={e => e.stopPropagation()}>
            <div className="oc-modal__icon-wrap">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#111111" strokeWidth="1.5" />
                <path d="M16 9v8.5" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="21.5" r="1.25" fill="#111111" />
              </svg>
            </div>
            <h2 className="oc-modal__title">Hủy đơn hàng</h2>
            <p className="oc-modal__body">
              Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
            </p>
            <div className="oc-modal__actions">
              <button
                className="oc-btn oc-btn-secondary"
                onClick={() => setShowCancelModal(false)}
              >
                Giữ đơn hàng
              </button>
              <button
                className="oc-btn oc-btn-primary"
                onClick={handleCancelOrder}
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderConfirmation
