// Admin Dashboard Analytics Service
// 4 endpoints: summary, revenue, booking-stats, top-services
// Normalizers tuned to actual BE response format (confirmed via Debug panel)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

// =============================================================================
// HELPERS
// =============================================================================

function unwrap(payload) {
  if (payload == null) return null
  if (Array.isArray(payload)) return payload
  if (payload.data !== undefined && payload.data !== null && typeof payload.data === 'object') {
    return payload.data
  }
  const wrapperKeys = ['value', 'result', 'payload', 'body', 'response', 'content']
  for (const k of wrapperKeys) {
    if (payload[k] !== undefined && payload[k] !== null && typeof payload[k] === 'object') {
      return payload[k]
    }
  }
  return payload
}

function pick(obj, ...keys) {
  if (!obj) return undefined
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null) return v
  }
  return undefined
}

function num(v) {
  if (v === undefined || v === null || v === '') return 0
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

async function parseRes(res) {
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  return { ok: res.ok, status: res.status, data }
}

async function apiFetch(path) {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token')
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  return parseRes(res)
}

// =============================================================================
// ENDPOINTS
// =============================================================================

export async function getDashboardSummary(period = 'week') {
  try {
    const r = await apiFetch(`/api/admin/dashboard/summary?period=${period}`)
    if (!r.ok) return { success: false, message: r.data?.message || r.data?.raw || 'Failed to fetch summary' }
    return { success: true, data: r.data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

export async function getRevenueByPeriod(period = 'week') {
  try {
    const r = await apiFetch(`/api/admin/dashboard/revenue?period=${period}`)
    if (!r.ok) return { success: false, message: r.data?.message || r.data?.raw || 'Failed to fetch revenue' }
    return { success: true, data: r.data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

export async function getBookingStats(period = 'week') {
  try {
    const r = await apiFetch(`/api/admin/dashboard/booking-stats?period=${period}`)
    if (!r.ok) return { success: false, message: r.data?.message || r.data?.raw || 'Failed to fetch booking stats' }
    return { success: true, data: r.data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

export async function getTopServices(top = 10) {
  try {
    const r = await apiFetch(`/api/admin/dashboard/top-services?top=${top}`)
    if (!r.ok) return { success: false, message: r.data?.message || r.data?.raw || 'Failed to fetch top services' }
    return { success: true, data: r.data }
  } catch (e) {
    return { success: false, message: e.message }
  }
}

// =============================================================================
// PERIOD / STATUS LABELS
// =============================================================================
export const PERIOD_LABEL = {
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
}

// Booking status colors (matching the status field names BE uses: pending, confirmed, inProgress, completed, cancelled)
export const BOOKING_STATUS_META = {
  pending:    { label: 'Pending',     color: '#e65100', bg: '#fff3e0' },
  confirmed:  { label: 'Confirmed',   color: '#0d47a1', bg: '#e3f2fd' },
  inProgress: { label: 'In Progress', color: '#4527a0', bg: '#ede7f6' },
  completed:  { label: 'Completed',   color: '#1b5e20', bg: '#e8f5e9' },
  cancelled:  { label: 'Cancelled',   color: '#707072', bg: '#f5f5f5' },
}

export const BOOKING_STATUS_ORDER = ['pending', 'confirmed', 'inProgress', 'completed', 'cancelled']

// =============================================================================
// NORMALIZE: SUMMARY
// BE format:
//   {
//     totalRevenue, totalBookings, totalOrders, totalUsers, totalPets,
//     revenueGrowthPercent, bookingGrowthPercent, orderGrowthPercent, userGrowthPercent,
//     pendingBookings, confirmedBookings, inProgressBookings, completedBookings, cancelledBookings
//   }
// =============================================================================
export function normalizeSummary(payload) {
  if (!payload) return null
  const inner = unwrap(payload) || payload

  return {
    totalRevenue:     num(inner.totalRevenue),
    totalBookings:    num(inner.totalBookings),
    totalOrders:      num(inner.totalOrders),
    totalUsers:       num(inner.totalUsers),
    totalPets:        num(inner.totalPets),

    revenueGrowth:    num(inner.revenueGrowthPercent ?? inner.revenueGrowth),
    bookingsGrowth:   num(inner.bookingGrowthPercent ?? inner.bookingGrowth ?? inner.bookingsGrowthPercent),
    ordersGrowth:     num(inner.orderGrowthPercent ?? inner.orderGrowth ?? inner.ordersGrowthPercent),
    usersGrowth:      num(inner.userGrowthPercent ?? inner.userGrowth ?? inner.usersGrowthPercent),
    petsGrowth:       num(inner.petGrowthPercent ?? inner.petGrowth ?? inner.petsGrowthPercent ?? 0),

    // Per-status counts from summary (flat fields)
    pendingCount:     num(inner.pendingBookings),
    confirmedCount:   num(inner.confirmedBookings),
    inProgressCount:  num(inner.inProgressBookings),
    completedCount:   num(inner.completedBookings),
    cancelledCount:   num(inner.cancelledBookings),

    raw: payload,
  }
}

// =============================================================================
// NORMALIZE: REVENUE
// BE format:
//   {
//     period: 'week',
//     grandTotal, bookingTotal, orderTotal, membershipTotal,
//     dataPoints: [{ label, bookingRevenue, orderRevenue, membershipRevenue, totalRevenue }]
//   }
// =============================================================================
export function normalizeRevenue(payload, period = 'week') {
  if (!payload) return { points: [], grandTotal: 0, bookingTotal: 0, orderTotal: 0, membershipTotal: 0 }
  const inner = unwrap(payload) || payload

  const points = Array.isArray(inner.dataPoints) ? inner.dataPoints : (
    Array.isArray(inner) ? inner :
    Array.isArray(inner.data) ? inner.data :
    Array.isArray(inner.items) ? inner.items : []
  )

  const normalized = points.map((row, idx) => ({
    label: row.label || row.date || row.period || `#${idx + 1}`,
    booking:    num(row.bookingRevenue    ?? row.booking    ?? row.BookingRevenue),
    order:      num(row.orderRevenue      ?? row.order      ?? row.OrderRevenue),
    membership: num(row.membershipRevenue ?? row.membership ?? row.MembershipRevenue),
    total:      num(row.totalRevenue      ?? row.total      ?? row.TotalRevenue) || (
      num(row.bookingRevenue) + num(row.orderRevenue) + num(row.membershipRevenue)
    ),
    raw: row,
  }))

  return {
    points: normalized,
    grandTotal:     num(inner.grandTotal)     || normalized.reduce((s, p) => s + p.total, 0),
    bookingTotal:   num(inner.bookingTotal)   || normalized.reduce((s, p) => s + p.booking, 0),
    orderTotal:     num(inner.orderTotal)     || normalized.reduce((s, p) => s + p.order, 0),
    membershipTotal:num(inner.membershipTotal)|| normalized.reduce((s, p) => s + p.membership, 0),
    raw: payload,
  }
}

// =============================================================================
// NORMALIZE: BOOKING STATS
// BE format (time-series với status breakdown):
//   [{ label: '10/08', total, pending, confirmed, inProgress, completed, cancelled }]
//
// Returns:
//   { points: [{label, total, pending, ...}], breakdown: [{status, count, ...}], total }
// =============================================================================
export function normalizeBookingStats(payload) {
  if (!payload) return { points: [], breakdown: [], total: 0 }
  const inner = unwrap(payload)
  const arr = Array.isArray(inner) ? inner : (Array.isArray(payload) ? payload : [])

  // Aggregate totals across all periods
  const breakdownMap = {
    pending: 0, confirmed: 0, inProgress: 0, completed: 0, cancelled: 0,
  }
  const points = arr.map((row, idx) => {
    const pending    = num(row.pending    ?? row.Pending)
    const confirmed  = num(row.confirmed  ?? row.Confirmed)
    const inProgress = num(row.inProgress ?? row.InProgress)
    const completed  = num(row.completed  ?? row.Completed)
    const cancelled  = num(row.cancelled  ?? row.Cancelled)
    const total      = num(row.total ?? row.Total) || (pending + confirmed + inProgress + completed + cancelled)

    breakdownMap.pending    += pending
    breakdownMap.confirmed  += confirmed
    breakdownMap.inProgress += inProgress
    breakdownMap.completed  += completed
    breakdownMap.cancelled  += cancelled

    return {
      label: row.label || row.date || `#${idx + 1}`,
      total, pending, confirmed, inProgress, completed, cancelled,
      raw: row,
    }
  })

  // Build breakdown array with colors (in display order)
  const breakdown = BOOKING_STATUS_ORDER
    .filter(k => breakdownMap[k] > 0 || true) // show all statuses even if 0
    .map(k => ({
      status: k,
      count: breakdownMap[k],
      ...BOOKING_STATUS_META[k],
    }))

  const total = points.reduce((s, p) => s + p.total, 0)

  return { points, breakdown, total, raw: payload }
}

// =============================================================================
// NORMALIZE: TOP SERVICES
// BE format:
//   [{ serviceId, serviceName, totalBookings, totalRevenue }]
// =============================================================================
export function normalizeTopServices(payload) {
  if (!payload) return []
  const inner = unwrap(payload)
  const arr = Array.isArray(inner) ? inner : (Array.isArray(payload) ? payload : [])

  return arr.map(row => ({
    id: row.serviceId ?? row.ServiceId,
    name: row.serviceName ?? row.ServiceName ?? row.name ?? row.Name ?? '—',
    count: num(row.totalBookings ?? row.bookingCount ?? row.count),
    revenue: num(row.totalRevenue ?? row.revenue ?? row.amount),
    raw: row,
  })).sort((a, b) => b.revenue - a.revenue)
}

// =============================================================================
// DEBUG — call all 4 endpoints and log to console
// =============================================================================
export async function debugAllResponses() {
  const results = {}
  for (const [name, fn, arg] of [
    ['summary', getDashboardSummary, 'week'],
    ['revenue', getRevenueByPeriod, 'week'],
    ['bookingStats', getBookingStats, 'week'],
    ['topServices', getTopServices, 10],
  ]) {
    const r = await fn(arg)
    results[name] = r
    console.log(`[Analytics Debug] ${name}:`, r)
  }
  return results
}