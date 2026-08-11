import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getBookingById, getBookingStatusLabel } from '../../services/orderService'
import SharedNav from '../../components/SharedNav/SharedNav'
import './BookingConfirmation.css'

function BookingConfirmation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('bookingId')

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    if (!bookingId) {
      setError('Không có thông tin lịch hẹn')
      setLoading(false)
      return
    }

    getBookingById(bookingId).then(res => {
      if (res.success) {
        setBooking(res.data)
      } else {
        setError(res.message || 'Không tải được lịch hẹn')
      }
      setLoading(false)
    })
  }, [bookingId])

  const formatMoney = (v) => new Intl.NumberFormat('vi-VN').format(v || 0) + ' VND'

  const formatDateTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const handleGoCheckout = () => {
    navigate(`/checkout?bookingId=${bookingId}`)
  }

  const handleCancelBooking = async () => {
    setShowCancelModal(false)
    setCancelling(true)
    try {
      const token = localStorage.getItem('token')
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'
      const res = await fetch(`${API_BASE_URL}/api/Booking/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      if (res.ok) {
        navigate('/home')
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.message || 'Không thể hủy lịch hẹn. Vui lòng thử lại.')
        setCancelling(false)
      }
    } catch (e) {
      alert('Có lỗi xảy ra, vui lòng thử lại.')
      setCancelling(false)
    }
  }

  const getStatusBadgeClass = (s) => {
    return { 1: 'pending', 2: 'confirmed', 3: 'inprogress', 4: 'completed', 5: 'cancelled' }[s] || 'pending'
  }

  if (loading) {
    return (
      <div className="bc-page">
        <div className="bc-container">
          <div className="bc-loading">
            <div className="bc-spinner" />
            Đang tải thông tin lịch hẹn...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bc-page">
        <div className="bc-container">
          <div className="bc-error-card">
            <div className="bc-error-text">{error}</div>
            <button className="bc-btn bc-btn-primary" onClick={() => navigate('/home')}>
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  const bookingStatus = booking?.status ?? booking?.Status ?? 1
  const isPending = bookingStatus === 1

  return (
    <div className="bc-page">
      <SharedNav />

      {/* Hero */}
      <div className="bc-hero">
        <div className="bc-hero__check-wrap">
          <svg className="bc-hero__check" viewBox="0 0 28 28" fill="none">
            <polyline points="5,14 11,20 23,8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="bc-hero__title">Đặt lịch thành công</h1>
        <p className="bc-hero__subtitle">Cảm ơn bạn đã đặt lịch dịch vụ tại Pet Shop</p>
      </div>

      <div className="bc-container">
        {/* Booking Header */}
        <div className="bc-booking-header">
          <div className="bc-booking-header__left">
            <span className="bc-booking-header__label">Mã lịch hẹn</span>
            <span className="bc-booking-header__code">{booking?.bookingCode || `#${booking?.bookingId}`}</span>
            <span className="bc-booking-header__date">{formatDateTime(booking?.createdAt)}</span>
          </div>
          <div className="bc-booking-header__badges">
            <span className={`bc-badge bc-badge--${getStatusBadgeClass(bookingStatus)}`}>
              {getBookingStatusLabel(bookingStatus)}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="bc-body">
          {/* Services */}
          <div className="bc-services-section">
            <p className="bc-section-label">Dịch vụ</p>
            {(booking?.services || []).map(s => (
              <div key={s.bookingDetailId || s.serviceId} className="bc-service-card">
                <div className="bc-service-card__info">
                  <p className="bc-service-card__name">{s.serviceName}</p>
                  <p className="bc-service-card__meta">
                    {formatMoney(s.unitPrice)} × {s.quantity || 1}
                  </p>
                </div>
                <div className="bc-service-card__right">
                  <span className="bc-service-card__price">{formatMoney(s.subTotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="bc-summary">
            <div className="bc-summary-card">
              <div className="bc-summary-total">
                <span className="bc-summary-total__label">Tổng cộng</span>
                <span className="bc-summary-total__amount">{formatMoney(booking?.totalPrice)}</span>
              </div>
            </div>

            <div className="bc-info-rows">
              <div className="bc-info-section">
                <p className="bc-section-label">Thông tin lịch hẹn</p>
                <div className="bc-info-row">
                  <span className="bc-info-row__label">Thú cưng</span>
                  <span className="bc-info-row__value">{booking?.petName || '—'}</span>
                </div>
                <div className="bc-info-row">
                  <span className="bc-info-row__label">Ngày hẹn</span>
                  <span className="bc-info-row__value">{formatDate(booking?.bookingDate)}</span>
                </div>
                <div className="bc-info-row">
                  <span className="bc-info-row__label">Giờ bắt đầu</span>
                  <span className="bc-info-row__value">
                    {booking?.startTime ? new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
                {booking?.endTime && (
                  <div className="bc-info-row">
                    <span className="bc-info-row__label">Giờ kết thúc</span>
                    <span className="bc-info-row__value">
                      {new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {booking?.note && (
                  <div className="bc-info-row">
                    <span className="bc-info-row__label">Ghi chú</span>
                    <span className="bc-info-row__value">{booking.note}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bc-actions">
          <button
            className="bc-btn bc-btn-primary"
            onClick={handleGoCheckout}
            disabled={!isPending}
          >
            {isPending ? 'Xác nhận thanh toán' : 'Đã thanh toán'}
          </button>
          {isPending && (
            <button
              className="bc-btn bc-btn-secondary"
              onClick={() => setShowCancelModal(true)}
              disabled={cancelling}
            >
              {cancelling ? 'Đang hủy...' : 'Hủy lịch hẹn'}
            </button>
          )}
          <button className="bc-btn bc-btn-ghost" onClick={() => navigate('/home')}>
            Về trang chủ
          </button>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="bc-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="bc-modal" onClick={e => e.stopPropagation()}>
            <div className="bc-modal__icon-wrap">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#111111" strokeWidth="1.5" />
                <path d="M16 9v8.5" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="21.5" r="1.25" fill="#111111" />
              </svg>
            </div>
            <h2 className="bc-modal__title">Hủy lịch hẹn</h2>
            <p className="bc-modal__body">
              Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể hoàn tác.
            </p>
            <div className="bc-modal__actions">
              <button className="bc-btn bc-btn-secondary" onClick={() => setShowCancelModal(false)}>
                Giữ lịch hẹn
              </button>
              <button className="bc-btn bc-btn-primary" onClick={handleCancelBooking}>
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingConfirmation
