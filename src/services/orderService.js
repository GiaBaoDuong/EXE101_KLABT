// Order Service - Real API integration
// Base URL from env or fallback to localhost

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

// Helper: parse response, chấp nhận cả JSON lẫn plain text
async function parseRes(res) {
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  return { ok: res.ok, status: res.status, data }
}

// Helper: fetch với auth token
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  return parseRes(res)
}

// GET /api/Order - Lấy tất cả orders của user
export async function getOrders() {
  try {
    const r = await apiFetch('/api/Order')
    if (!r.ok) return { success: false, message: r.data.message || r.data.raw || 'Failed to fetch orders' }
    return { success: true, data: r.data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// GET /api/Order/{id} - Lấy chi tiết 1 order
export async function getOrderById(orderId) {
  try {
    const r = await apiFetch(`/api/Order/${orderId}`)
    if (!r.ok) return { success: false, message: r.data.message || r.data.raw || 'Order not found' }
    return { success: true, data: r.data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// POST /api/Order - Tạo order mới
export async function createOrder(orderData) {
  try {
    const r = await apiFetch('/api/Order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
    if (!r.ok) return { success: false, message: r.data.message || r.data.raw || 'Failed to create order' }
    return { success: true, message: 'Order created successfully', data: r.data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// PUT /api/Order/{id} - Cập nhật order
export async function updateOrder(orderId, updates) {
  try {
    const r = await apiFetch(`/api/Order/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    if (!r.ok) return { success: false, message: r.data.message || r.data.raw || 'Failed to update order' }
    return { success: true, message: 'Order updated', data: r.data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// DELETE /api/Order/{id} - Hủy order
export async function deleteOrder(orderId) {
  try {
    const r = await apiFetch(`/api/Order/${orderId}`, { method: 'DELETE' })
    if (!r.ok) return { success: false, message: r.data.message || r.data.raw || 'Failed to cancel order' }
    return { success: true, message: 'Order cancelled', data: r.data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// Alias: cancelOrder = deleteOrder
export { deleteOrder as cancelOrder }

// Helper: markOrderAsPaid via PUT /api/Order/{id}
export async function markOrderAsPaid(orderId) {
  return updateOrder(orderId, {})
}

// Enum helpers (giữ lại để UI dùng)
export const ORDER_STATUS = { 1: 'Pending', 2: 'Processing', 3: 'Completed', 4: 'Cancelled' }
export const PAYMENT_STATUS = { 1: 'Unpaid', 2: 'Paid', 3: 'Refunded', 4: 'Failed' }
export const ORDER_TYPE = { 1: 'Product', 2: 'Service', 3: 'Mixed' }

export function getStatusLabel(s) { return ORDER_STATUS[s] || `Unknown(${s})` }
export function getPaymentStatusLabel(s) { return PAYMENT_STATUS[s] || `Unknown(${s})` }
export function getOrderTypeLabel(s) { return ORDER_TYPE[s] || `Unknown(${s})` }
