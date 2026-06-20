// Mock Payment Service - Simulates SePay QR Payment API
// Schema match đúng với API thật của backend

const MOCK_QR_BASE = 'data:image/svg+xml;base64,'

function generateMockQR(data) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="white"/>
    <g fill="black">
      <rect x="10" y="10" width="60" height="60"/>
      <rect x="20" y="20" width="40" height="40" fill="white"/>
      <rect x="30" y="30" width="20" height="20"/>
      <rect x="130" y="10" width="60" height="60"/>
      <rect x="140" y="20" width="40" height="40" fill="white"/>
      <rect x="150" y="30" width="20" height="20"/>
      <rect x="10" y="130" width="60" height="60"/>
      <rect x="20" y="140" width="40" height="40" fill="white"/>
      <rect x="30" y="150" width="20" height="20"/>
      ${Array.from({ length: 80 }, (_, i) => {
        const x = 10 + (i % 20) * 9
        const y = 90 + Math.floor(i / 20) * 9
        return Math.random() > 0.5 ? `<rect x="${x}" y="${y}" width="7" height="7"/>` : ''
      }).join('')}
    </g>
    <text x="100" y="195" text-anchor="middle" font-size="8" fill="black">${data}</text>
  </svg>`
  return MOCK_QR_BASE + btoa(unescape(encodeURIComponent(svg)))
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const STORAGE_KEY = 'mock_sepay_payments'

// Thông tin tài khoản SePay mock cho từng ngân hàng
const BANK_ACCOUNTS = {
  VCB: { accountNumber: '1234567890', accountName: 'CONG TY TNHH PETCARE' },
  TCB: { accountNumber: '2345678901', accountName: 'CONG TY TNHH PETCARE' },
  MB:  { accountNumber: '3456789012', accountName: 'CONG TY TNHH PETCARE' },
  ACB: { accountNumber: '4567890123', accountName: 'CONG TY TNHH PETCARE' },
  VPB: { accountNumber: '5678901234', accountName: 'CONG TY TNHH PETCARE' },
}

const BANK_NAMES = {
  VCB: 'Vietcombank',
  TCB: 'Techcombank',
  MB:  'MB Bank',
  ACB: 'ACB',
  VPB: 'VPBank',
}

function getStoredPayments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function setStoredPayments(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// POST /api/Payment/create-payment
// Request: { orderId, bookingId, bankCode }
// Response:
// {
//   "paymentUrl": "...",
//   "qrCode": "...",
//   "amount": 500000,
//   "accountNumber": "...",
//   "bankName": "...",
//   "content": "ORDER123"
// }
export async function createPayment({ orderId, bookingId, bankCode = 'VCB' }) {
  await delay(800)

  if (!orderId && !bookingId) {
    return { success: false, message: 'Phải cung cấp orderId hoặc bookingId' }
  }

  const type = orderId ? 'order' : 'booking'
  const refId = orderId || bookingId
  const paymentCode = `${type.toUpperCase()}${refId}`

  const bankInfo = BANK_ACCOUNTS[bankCode] || BANK_ACCOUNTS.VCB

  const paymentData = {
    paymentUrl: `https://sepay.vn/checkout/${paymentCode}`,
    qrCode: generateMockQR(paymentCode),
    amount: 0, // backend sẽ lấy từ order/booking
    accountNumber: bankInfo.accountNumber,
    bankName: BANK_NAMES[bankCode] || bankCode,
    content: paymentCode, // nội dung chuyển khoản
    orderId: orderId || null,
    bookingId: bookingId || null,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  }

  const stored = getStoredPayments()
  stored[paymentCode] = { ...paymentData, bankCode }
  setStoredPayments(stored)

  return {
    success: true,
    message: 'Tạo mã QR thanh toán thành công',
    data: paymentData,
  }
}

// POST /api/Payment/sepay-webhook
// SePay gửi webhook xác nhận thanh toán
export async function simulateSepayWebhook(payload) {
  await delay(500)

  const webhookPayload = {
    id: payload.id || Date.now(),
    gateway: payload.gateway || 'SePay',
    transactionDate: payload.transactionDate || new Date().toISOString(),
    accountNumber: payload.accountNumber || '0123456789',
    subAccount: payload.subAccount || '',
    code: payload.code || '',
    content: payload.content || '',
    transferType: payload.transferType || 'in',
    description: payload.description || '',
    transferAmount: payload.transferAmount || 0,
    accumulated: payload.accumulated || 0,
    referenceCode: payload.referenceCode || `REF${Date.now()}`,
  }

  return {
    success: true,
    message: 'Webhook processed successfully',
    data: webhookPayload,
  }
}

// Check payment status by code
export async function checkPaymentStatus(paymentCode) {
  await delay(200)

  const stored = getStoredPayments()
  const payment = stored[paymentCode]

  if (!payment) {
    return { success: false, message: 'Payment not found' }
  }

  return {
    success: true,
    data: {
      paymentCode,
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paidAt,
    },
  }
}

// Cancel a pending payment
export async function cancelPayment(paymentCode) {
  await delay(300)

  const stored = getStoredPayments()
  if (stored[paymentCode]) {
    stored[paymentCode].status = 'CANCELLED'
    stored[paymentCode].cancelledAt = new Date().toISOString()
    setStoredPayments(stored)
  }

  return {
    success: true,
    message: 'Payment cancelled',
  }
}

// Helper: Auto-poll for payment completion
export function startMockPaymentWatcher(paymentCode, onSuccess, timeoutMs = 30000) {
  const interval = setInterval(async () => {
    const status = await checkPaymentStatus(paymentCode)
    if (status.data?.status === 'COMPLETED') {
      clearInterval(interval)
      onSuccess(status.data)
    }
  }, 2000)

  setTimeout(() => {
    clearInterval(interval)
  }, timeoutMs)

  return () => clearInterval(interval)
}
