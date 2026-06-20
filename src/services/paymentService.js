// Payment Service - Real API integration for SePay
// Base URL from env or fallback to localhost

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

// Helper: fetch co auth token
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  return res
}

// Helper: goi KHONG co auth (cho webhook endpoint)
async function apiFetchNoAuth(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  return res
}

// POST /api/Payment/create-payment
// Body: { orderId, bookingId, bankCode }
export async function createPayment({ orderId, bookingId, bankCode = 'MB' }) {
  try {
    const body = { bankCode }
    if (orderId) body.orderId = Number(orderId)
    if (bookingId) body.bookingId = Number(bookingId)

    const res = await apiFetch('/api/Payment/create-payment', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!res.ok) return { success: false, message: data.message || data.raw || 'Failed to create payment' }
    return { success: true, message: 'Tao ma QR thanh toan thanh cong', data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// POST /api/Payment/sepay-webhook
// Gui kem auth token vi endpoint yeu cau dang nhap tren production
export async function simulateSepayWebhook(payload) {
  try {
    const token = localStorage.getItem('token')
    console.log('token hien tai:', token ? `${token.substring(0, 20)}...` : 'NULL')
    const res = await fetch(`${API_BASE_URL}/api/Payment/sepay-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!res.ok) return { success: false, message: data.message || data.raw || 'Webhook failed', data }
    return { success: true, message: 'Webhook processed', data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// GET /api/Payment/{code} - Kiem tra trang thai thanh toan
export async function checkPaymentStatus(paymentCode) {
  try {
    const res = await apiFetch(`/api/Payment/${paymentCode}`)
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!res.ok) return { success: false, message: data.message || data.raw || 'Payment not found', data }
    return { success: true, data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// DELETE /api/Payment/{code} - Huy thanh toan
export async function cancelPayment(paymentCode) {
  try {
    const res = await apiFetch(`/api/Payment/${paymentCode}`, { method: 'DELETE' })
    const text = await res.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    if (!res.ok) return { success: false, message: data.message || data.raw || 'Failed to cancel payment', data }
    return { success: true, message: 'Payment cancelled' }
  } catch (e) {
    return { success: false, message: e.message }
  }
}
