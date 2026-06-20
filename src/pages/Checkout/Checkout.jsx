import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createPayment, checkPaymentStatus, simulateSepayWebhook } from '../../services/paymentService'
import { getOrderById, getStatusLabel, getPaymentStatusLabel, getOrderTypeLabel } from '../../services/orderService'
import SharedNav from '../../components/SharedNav/SharedNav'
import './Checkout.css'

const BANK_OPTIONS = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPB', name: 'VPBank' },
]

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`toast toast-${type}`}>
      <span>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>{message}</span>
    </div>
  )
}

function Checkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderIdFromUrl = searchParams.get('orderId')
  const bookingIdFromUrl = searchParams.get('bookingId')
  const mode = orderIdFromUrl || bookingIdFromUrl ? 'embedded' : 'dev'

  const [orderId, setOrderId] = useState(orderIdFromUrl || '')
  const [bookingId, setBookingId] = useState(bookingIdFromUrl || '')
  const [bankCode, setBankCode] = useState('MB')
  const [amount, setAmount] = useState(() => {
    const a = searchParams.get('amount')
    return a ? Number(a) : 350000
  })
  const [payment, setPayment] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(900)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [toast, setToast] = useState(null)
  const [phase, setPhase] = useState('idle')
  const countdownRef = useRef(null)
  const autoCheckRef = useRef(null)
  const navigateRef = useRef(null)
  useEffect(() => { navigateRef.current = navigate }, [navigate])

  const showToast = (message, type = 'info') => setToast({ message, type })
  const formatMoney = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' VND'

  // Load order details
  useEffect(() => {
    if (orderIdFromUrl) {
      getOrderById(orderIdFromUrl).then(res => {
        if (res.success) {
          setOrder(res.data)
          setOrderId(String(res.data.orderId || res.data.OrderId))
          setAmount(res.data.finalAmount)
        }
      })
    }
  }, [orderIdFromUrl])

  // Auto-create payment QR when coming from Buy Now
  useEffect(() => {
    if (mode === 'embedded' && orderIdFromUrl && orderId && phase === 'idle') {
      handleCreatePayment()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // Countdown timer
  useEffect(() => {
    if (phase !== 'PENDING') {
      if (countdownRef.current) clearInterval(countdownRef.current)
      return
    }
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current)
          setPhase('EXPIRED')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(countdownRef.current)
  }, [phase])

  // Auto-check: goi webhook kich hoat SePay roi lay lai order moi 10s
  useEffect(() => {
    if (phase !== 'PENDING') {
      if (autoCheckRef.current) clearInterval(autoCheckRef.current)
      return
    }
    const orderId = order?.orderId || order?.OrderId
    const doCheck = async () => {
      const currentOrderId = orderId || orderIdFromUrl
      if (!currentOrderId) return
      const paymentCode = payment?.content || payment?.code || payment?.paymentCode
      const amt = order?.finalAmount || Number(amount) || 0
      if (paymentCode) {
        await simulateSepayWebhook({
          code: paymentCode,
          content: payment?.content || paymentCode,
          transferAmount: amt,
          accountNumber: payment?.accountNumber || '',
          transactionDate: new Date().toISOString(),
          gateway: 'SePay',
          transferType: 'in',
          description: `Thanh toan don hang ${paymentCode}`,
        })
      }
      await new Promise(r => setTimeout(r, 500))
      const res = await getOrderById(currentOrderId)
      if (res.success) {
        const payStatus = res.data?.paymentStatus ?? res.data?.PaymentStatus
        if (payStatus === 2 || payStatus === 'PAID' || String(payStatus ?? '').toUpperCase() === 'PAID') {
          clearInterval(autoCheckRef.current)
          setPhase('COMPLETED')
          showToast('Thanh toán thành công!', 'success')
          setTimeout(() => navigateRef.current?.('/purchases'), 1500)
        }
      }
    }
    autoCheckRef.current = setInterval(doCheck, 10000)
    return () => clearInterval(autoCheckRef.current)
  }, [phase, orderIdFromUrl, payment?.content, payment?.code, payment?.paymentCode, amount])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(countdownRef.current)
      clearInterval(autoCheckRef.current)
    }
  }, [])

  const handleCreatePayment = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = { bankCode }
      if (bookingId) {
        payload.bookingId = Number(bookingId)
      } else {
        payload.orderId = Number(orderId)
      }
      const res = await createPayment(payload)
      if (res.success) {
        // Parse content tu paymentUrl neu backend khong tra ve
        let data = res.data
        if (data?.paymentUrl && !data?.content) {
          const params = new URLSearchParams(data.paymentUrl.split('?')[1])
          data = { ...data, content: params.get('des') || String(orderId) }
        }
        setPayment(data)
        setPhase('PENDING')
        setCountdown(900)
      } else {
        setError(res.message || 'Tạo thanh toán thất bại')
      }
    } catch (e) {
      setError(e.message || 'Có lỗi xảy ra')
    }
    setLoading(false)
  }

  const handleCheckStatus = async () => {
    const currentOrderId = order?.orderId || order?.OrderId || orderIdFromUrl
    if (!currentOrderId) return
    setCheckingPayment(true)
    setError('')

    // Thu tu kiem tra: 1) goi webhook kich hoat SePay, 2) lay lai order
    const paymentCode = payment?.content || payment?.code || payment?.paymentCode
    let webhookOk = false
    if (paymentCode) {
      // Day đủ payload theo schema SePay webhook
      const webhookPayload = {
        code: paymentCode,
        content: payment?.content || paymentCode,
        transferAmount: order?.finalAmount || Number(amount) || 0,
        accountNumber: payment?.accountNumber || '',
        transactionDate: new Date().toISOString(),
        gateway: 'SePay',
        transferType: 'in',
        description: `Thanh toan don hang ${paymentCode}`,
      }
      const webhookRes = await simulateSepayWebhook(webhookPayload)
      webhookOk = webhookRes.success
      if (!webhookOk) showToast('Webhook không phản hồi. Đang lấy trạng thái...', 'info')
    } else {
      showToast('Không có mã thanh toán để kiểm tra.', 'error')
    }

    // Buoc 2: lay lai trang thai order tu backend
    await new Promise(r => setTimeout(r, 1000)) // cho SePay xu ly
    const res = await getOrderById(currentOrderId)
    if (res.success) {
      const payStatus = res.data?.paymentStatus ?? res.data?.PaymentStatus
      if (payStatus === 2 || payStatus === 'PAID' || String(payStatus ?? '').toUpperCase() === 'PAID') {
        setPhase('COMPLETED')
        showToast('Thanh toán thành công!', 'success')
        setTimeout(() => navigate('/purchases'), 1500)
      } else {
        showToast('Chưa nhận được thanh toán. Vui lòng chờ SePay xác nhận (1-5 phút) hoặc kiểm tra lại sau.', 'info')
      }
    } else {
      setError(res.message || 'Không kiểm tra được trạng thái thanh toán')
    }
    setCheckingPayment(false)
  }

  const handleReset = () => {
    setPayment(null)
    setPhase('idle')
    setError('')
    setCountdown(900)
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const getPaymentBadgeClass = (status) => {
    const s = typeof status === 'string' ? status.toUpperCase() : String(status ?? 1)
    if (s === 'PAID' || s === '2') return 'paid'
    if (s === 'REFUNDED' || s === '3') return 'refunded'
    if (s === 'FAILED' || s === '4') return 'failed'
    return 'unpaid'
  }

  const getPaymentLabel = (status) => {
    if (typeof status === 'string') return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    return getPaymentStatusLabel(status ?? 1)
  }

  // ===== RENDER: ORDER SUMMARY =====
  const renderOrderSummary = () => (
    <div className="order-summary">
      <div className="order-summary-header">
        <h3>Đơn hàng {order?.orderCode}</h3>
        <span className="order-id">#{order?.orderId}</span>
      </div>
      <div className="order-items">
        {order?.items?.map((item) => (
          <div key={item.orderItemId} className="order-item">
            <div className="item-info">
              <span className="item-name">{item.productName}</span>
              <span className="item-qty">{formatMoney(item.unitPrice)} × {item.quantity}</span>
            </div>
            <span className="item-price">{formatMoney(item.subTotal)}</span>
          </div>
        ))}
      </div>
      <div className="order-totals">
        <div className="total-row">
          <span>Tổng tiền hàng</span>
          <span>{formatMoney(order?.totalAmount || 0)}</span>
        </div>
        {(order?.discountAmount || 0) > 0 && (
          <div className="total-row discount">
            <span>Giảm giá</span>
            <span>-{formatMoney(order.discountAmount)}</span>
          </div>
        )}
        <div className="total-row final">
          <span>Thành tiền</span>
          <span>{formatMoney(order?.finalAmount || 0)}</span>
        </div>
      </div>
      <div className="order-meta">
        <div><strong>Địa chỉ:</strong> {order?.shippingAddress}</div>
        <div>
          <strong>Loại:</strong> {getOrderTypeLabel(order?.orderType ?? 1)} ·{' '}
          <strong>Trạng thái:</strong>{' '}
          <span className={`badge badge-${['', 'pending', 'processing', 'completed', 'cancelled'][order?.status ?? 1]}`}>
            {getStatusLabel(order?.status ?? 1)}
          </span>{' '}
          ·{' '}
          <strong>Thanh toán:</strong>{' '}
          <span className={`badge badge-${getPaymentBadgeClass(order?.paymentStatus ?? order?.PaymentStatus)}`}>
            {getPaymentLabel(order?.paymentStatus ?? order?.PaymentStatus)}
          </span>
        </div>
      </div>
    </div>
  )

  // ===== STATE: IDLE =====
  const renderIdle = () => (
    <div className="checkout-form">
      {order && renderOrderSummary()}

      <div className="form-group">
        <label>Order ID</label>
        <input
          type="number"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          disabled={!!bookingId || mode === 'embedded'}
          placeholder="VD: 1001"
        />
      </div>

      <div className="form-divider">hoặc</div>

      <div className="form-group">
        <label>Booking ID</label>
        <input
          type="number"
          value={bookingId}
          onChange={e => setBookingId(e.target.value)}
          disabled={!!orderId && mode !== 'embedded'}
          placeholder="VD: 2001"
        />
      </div>

      <div className="form-group">
        <label>Số tiền (VND)</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="350000"
        />
      </div>

      <div className="form-group">
        <label>Ngân hàng</label>
        <select value={bankCode} onChange={e => setBankCode(e.target.value)}>
          {BANK_OPTIONS.map(b => (
            <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
          ))}
        </select>
      </div>

      {error && <div className="checkout-error">{error}</div>}

      <button
        className="btn btn-primary btn-pay"
        onClick={handleCreatePayment}
        disabled={loading || (!orderId && !bookingId)}
      >
        {loading ? 'Đang tạo...' : 'Thanh toán bằng chuyển khoản'}
      </button>
    </div>
  )

  // ===== STATE: PENDING =====
  const renderPending = () => {
    const paymentDes = payment?.paymentUrl
      ? new URL(payment.paymentUrl).searchParams.get('des') || ''
      : ''

    return (
      <div className="checkout-qr">
        <div className="qr-header">
          <div className="qr-status pending">
            <span className="spinner" />
            Đang chờ thanh toán...
          </div>
          <div className="qr-countdown">
            QR hết hạn sau: <strong>{formatTime(countdown)}</strong>
          </div>
        </div>

        {order && (
          <div className="order-summary-mini">
            <div className="order-summary-mini__row">
              <span>Đơn hàng</span>
              <span className="order-summary-mini__val">#{order?.orderCode || order?.orderId}</span>
            </div>
            <div className="order-summary-mini__row">
              <span>Tổng tiền</span>
              <span className="order-summary-mini__val order-summary-mini__val--green">
                {formatMoney(order?.finalAmount || Number(amount))}
              </span>
            </div>
          </div>
        )}

        <div className="qr-content">
          <div className="qr-image-wrapper">
            {payment?.qrCode ? (
              <img src={payment.qrCode} alt="QR Code" className="qr-image" />
            ) : (
              <img src={payment?.paymentUrl} alt="QR Code" className="qr-image" />
            )}
            <p className="qr-hint">Quét mã QR bằng app ngân hàng để thanh toán</p>
          </div>

          <div className="qr-info">
            <div className="info-row">
              <span className="info-label">Số tiền</span>
              <span className="info-value highlight">{formatMoney(order?.finalAmount || Number(amount))}</span>
            </div>
            {paymentDes && (
              <div className="info-row">
                <span className="info-label">Nội dung CK</span>
                <span className="info-value">{paymentDes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="qr-actions">
          {error && <div className="checkout-error" style={{marginBottom: '12px'}}>{error}</div>}
          <button className="btn btn-primary btn-check-payment" onClick={handleCheckStatus} disabled={checkingPayment}>
            {checkingPayment ? 'Đang kiểm tra...' : 'Kiểm tra thanh toán'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const paymentCode = payment?.content || payment?.code || payment?.paymentCode
              const debugPayload = {
                code: paymentCode,
                content: payment?.content || paymentCode,
                transferAmount: order?.finalAmount || Number(amount) || 0,
                accountNumber: payment?.accountNumber || '',
                transactionDate: new Date().toISOString(),
                gateway: 'SePay',
                transferType: 'in',
                description: `Thanh toan don hang ${paymentCode}`,
              }
              console.group('=== DEBUG PAYMENT ===')
              console.log('payment object:', payment)
              console.log('order object:', order)
              console.log('paymentCode:', paymentCode)
              console.log('orderId:', order?.orderId || order?.OrderId || orderIdFromUrl)
              console.log('webhook payload sẽ gửi:', debugPayload)
              console.groupEnd()
              alert(`Debug:\norderId: ${order?.orderId || order?.OrderId || orderIdFromUrl}\npaymentCode: ${paymentCode}\ntransferAmount: ${order?.finalAmount || Number(amount) || 0}`)
            }}
            style={{marginTop: '8px', fontSize: '12px'}}
          >
            Debug Log
          </button>
        </div>
      </div>
    )
  }

  // ===== STATE: COMPLETED =====
  const renderCompleted = () => (
    <div className="checkout-success">
      <div className="success-icon">✓</div>
      <h2>Thanh toán thành công!</h2>
      <p>Giao dịch đã được xác nhận.</p>
      <p className="success-amount">{formatMoney(order?.finalAmount || Number(amount))}</p>

      <div className="success-actions">
        <button className="btn btn-primary" onClick={() => navigate('/purchases')}>
          Xem đơn hàng
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          Tạo thanh toán mới
        </button>
      </div>
    </div>
  )

  // ===== STATE: EXPIRED =====
  const renderExpired = () => (
    <div className="checkout-cancelled">
      <div className="cancelled-icon">⏱</div>
      <h2>QR hết hạn</h2>
      <p>Mã QR thanh toán đã hết hiệu lực. Vui lòng tạo mã mới.</p>
      <div className="success-actions">
        <button className="btn btn-primary" onClick={handleReset}>
          Tạo mã QR mới
        </button>
      </div>
    </div>
  )

  return (
    <div className="checkout-page">
      <SharedNav />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="checkout-container">
        <h1 className="checkout-title">Thanh toán SePay</h1>
        <p className="checkout-subtitle">Quét mã QR để thanh toán</p>

        {phase === 'idle' && renderIdle()}
        {phase === 'PENDING' && renderPending()}
        {phase === 'COMPLETED' && renderCompleted()}
        {phase === 'EXPIRED' && renderExpired()}
      </div>
    </div>
  )
}

export default Checkout
