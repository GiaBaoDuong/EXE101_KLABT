// Order Service - Real API integration
// Base URL from env or fallback to localhost

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

// Product image catalog — keyed by productId
// Populated lazily from /api/Product, falls back to hardcoded map
let productImageCache = {}
let cacheLoaded = false

async function ensureProductCache() {
  if (cacheLoaded) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/Product`)
    if (res.ok) {
      const products = await res.json()
      products.forEach(p => {
        productImageCache[p.productId] = p.thumbnailUrl || null
      })
    }
  } catch { /* ignore — fallback to hardcoded map */ }
  cacheLoaded = true
}

// Static fallback map (covers common productIds)
const FALLBACK_IMAGE_MAP = {
  1: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&q=80',
  2: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&q=80',
  3: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&q=80',
  4: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=200&q=80',
  5: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&q=80',
  6: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&q=80',
  7: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=200&q=80',
  8: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&q=80',
  9: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&q=80',
  10: 'https://images.unsplash.com/photo-1587764379873-97837921fd44?w=200&q=80',
  11: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=200&q=80',
  12: 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=200&q=80',
  13: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&q=80',
  14: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=200&q=80',
  15: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&q=80',
}

function getProductImage(productId) {
  return productImageCache[productId] || FALLBACK_IMAGE_MAP[productId] || null
}

// Enrich order items with product images
export function enrichOrderWithImages(order) {
  if (!order) return null
  return {
    ...order,
    items: (order.items || []).map(item => ({
      ...item,
      image: getProductImage(item.productId),
    })),
  }
}

// Enrich array of orders
export function enrichOrdersWithImages(orders) {
  return (orders || []).map(enrichOrderWithImages)
}

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
    await ensureProductCache()
    const r = await apiFetch('/api/Order')
    if (!r.ok) return { success: false, message: r.data.message || r.data.raw || 'Failed to fetch orders' }
    return { success: true, data: enrichOrdersWithImages(r.data) }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// GET /api/Order/{id} - Lấy chi tiết 1 order
export async function getOrderById(orderId) {
  try {
    await ensureProductCache()
    const r = await apiFetch(`/api/Order/${orderId}`)
    if (!r.ok) return { success: false, message: r.data.message || r.data.raw || 'Order not found' }
    return { success: true, data: enrichOrderWithImages(r.data) }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// GET /api/Booking/{id} - Lấy chi tiết 1 booking
export async function getBookingById(bookingId) {
  try {
    const r = await apiFetch(`/api/Booking/${bookingId}`)
    if (!r.ok) return { success: false, message: r.data.message || r.data.raw || 'Booking not found' }
    return { success: true, data: r.data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// GET /api/Booking - Lấy tất cả bookings của user (BE tự parse userId từ JWT)
export async function getMyBookings() {
  try {
    const r = await apiFetch('/api/Booking')
    if (!r.ok) return { success: false, message: r.data.message || r.data.raw || 'Failed to fetch bookings' }
    return { success: true, data: r.data || [] }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// DELETE /api/Booking/{id} - Hủy booking
export async function cancelBooking(bookingId) {
  try {
    const r = await apiFetch(`/api/Booking/${bookingId}`, { method: 'DELETE' })
    if (!r.ok) {
      const data = r.data
      return { success: false, message: (data && (data.message || data.raw)) || 'Failed to cancel booking' }
    }
    return { success: true, message: 'Booking cancelled' }
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

// Booking status (1-5)
export const BOOKING_STATUS = { 1: 'Pending', 2: 'Confirmed', 3: 'InProgress', 4: 'Completed', 5: 'Cancelled' }
export function getBookingStatusLabel(s) { return BOOKING_STATUS[s] || `Unknown(${s})` }

// Booking status config (label tieng Viet + mau - dung cho Purchases + BookingDetail)
export const BOOKING_STATUS_CONFIG = {
  1: { label: 'Chờ thanh toán', bg: '#fff3e0', color: '#e65100' },
  2: { label: 'Đã xác nhận',    bg: '#e3f2fd', color: '#0d47a1' },
  3: { label: 'Đang thực hiện', bg: '#ede7f6', color: '#4527a0' },
  4: { label: 'Hoàn thành',     bg: '#e8f5e9', color: '#1b5e20' },
  5: { label: 'Đã hủy',         bg: '#fce4ec', color: '#b71c1c' },
}
