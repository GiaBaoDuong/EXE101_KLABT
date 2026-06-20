// Mock Order Service - Simulates /api/Order endpoints
// Schema match đúng với API thật của backend

const STORAGE_KEY = 'mock_orders'
const COUNTER_KEY = 'mock_order_counter'

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function _getOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

function getNextId() {
  const current = Number(localStorage.getItem(COUNTER_KEY) || '1000')
  const next = current + 1
  localStorage.setItem(COUNTER_KEY, String(next))
  return next
}

// Mock product catalog (để tra productName, unitPrice khi tạo order)
const MOCK_PRODUCTS = {
  1: { name: 'Royal Canin Adult Dog Food', price: 450000 },
  2: { name: 'Cat Toy Mouse', price: 50000 },
  3: { name: 'Pedigree Dog Treats', price: 120000 },
  4: { name: 'Whiskas Cat Food 1.2kg', price: 180000 },
  5: { name: 'Dog Shampoo Premium', price: 180000 },
  6: { name: 'Cat Litter 10L', price: 250000 },
  7: { name: 'Dog Collar Leather', price: 150000 },
  8: { name: 'Cat Scratching Post', price: 320000 },
  9: { name: 'Bird Cage Medium', price: 480000 },
  10: { name: 'Fish Tank 20L', price: 650000 },
}

function seedDemoOrders() {
  const existing = _getOrders()
  if (existing.length > 0) return

  const demo = [
    {
      orderId: 1001,
      orderCode: 'ORD-20260620-1001',
      totalAmount: 580000,
      discountAmount: 0,
      finalAmount: 580000,
      orderType: 1,
      status: 2,
      paymentStatus: 1,
      shippingAddress: '123 Nguyễn Văn A, Q1, TP.HCM',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      items: [
        { orderItemId: 1, productId: 1, productName: 'Royal Canin Adult Dog Food', quantity: 1, unitPrice: 450000, subTotal: 450000 },
        { orderItemId: 2, productId: 2, productName: 'Cat Toy Mouse', quantity: 2, unitPrice: 50000, subTotal: 100000 },
        { orderItemId: 3, productId: 5, productName: 'Dog Shampoo Premium', quantity: 1, unitPrice: 30000, subTotal: 30000 },
      ],
    },
    {
      orderId: 1002,
      orderCode: 'ORD-20260615-1002',
      totalAmount: 360000,
      discountAmount: 10000,
      finalAmount: 350000,
      orderType: 1,
      status: 1,
      paymentStatus: 1,
      shippingAddress: '456 Lê Lợi, Q3, TP.HCM',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      items: [
        { orderItemId: 4, productId: 3, productName: 'Pedigree Dog Treats', quantity: 3, unitPrice: 120000, subTotal: 360000 },
      ],
    },
    {
      orderId: 1003,
      orderCode: 'ORD-20260610-1003',
      totalAmount: 460000,
      discountAmount: 0,
      finalAmount: 460000,
      orderType: 1,
      status: 3,
      paymentStatus: 1,
      shippingAddress: '789 Trần Hưng Đạo, Q5, TP.HCM',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      items: [
        { orderItemId: 5, productId: 5, productName: 'Dog Shampoo Premium', quantity: 1, unitPrice: 180000, subTotal: 180000 },
        { orderItemId: 6, productId: 6, productName: 'Cat Litter 10L', quantity: 1, unitPrice: 250000, subTotal: 250000 },
        { orderItemId: 7, productId: 4, productName: 'Whiskas Cat Food 1.2kg', quantity: 1, unitPrice: 30000, subTotal: 30000 },
      ],
    },
  ]
  saveOrders(demo)
  localStorage.setItem(COUNTER_KEY, '1003')
}

seedDemoOrders()

function generateOrderCode() {
  const now = new Date()
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const orderId = getNextId()
  return { orderId, orderCode: `ORD-${ymd}-${orderId}` }
}

// Mock product catalog — chỉ dùng khi không có productData được truyền vào
const FALLBACK_PRODUCTS = {
  1: { productName: 'Royal Canin Adult Dog Food', unitPrice: 450000 },
  2: { productName: 'Cat Toy Mouse', unitPrice: 50000 },
  3: { productName: 'Pedigree Dog Treats', unitPrice: 120000 },
  4: { productName: 'Whiskas Cat Food 1.2kg', unitPrice: 180000 },
  5: { productName: 'Dog Shampoo Premium', unitPrice: 180000 },
  6: { productName: 'Cat Litter 10L', unitPrice: 250000 },
  7: { productName: 'Dog Collar Leather', unitPrice: 150000 },
  8: { productName: 'Cat Scratching Post', unitPrice: 320000 },
  9: { productName: 'Bird Cage Medium', unitPrice: 480000 },
  10: { productName: 'Fish Tank 20L', unitPrice: 650000 },
}

function buildOrderItems(itemsInput) {
  let orderItemIdCounter = 1000 + Math.floor(Math.random() * 9000)
  return itemsInput.map(item => {
    // Ưu tiên dùng productData được truyền trực tiếp từ request
    const productInfo = item.productData
      ? {
          productName: item.productData.productName || item.productData.name || `Product #${item.productId}`,
          unitPrice: item.productData.unitPrice || item.productData.price || 0,
        }
      : FALLBACK_PRODUCTS[item.productId] || {
          productName: `Product #${item.productId}`,
          unitPrice: 50000,
        }
    const unitPrice = productInfo.unitPrice
    const subTotal = unitPrice * item.quantity
    return {
      orderItemId: orderItemIdCounter++,
      productId: item.productId,
      productName: productInfo.productName,
      quantity: item.quantity,
      unitPrice,
      subTotal,
    }
  })
}

function calculateTotals(items, discountAmount = 0) {
  const totalAmount = items.reduce((sum, item) => sum + item.subTotal, 0)
  const finalAmount = Math.max(0, totalAmount - discountAmount)
  return { totalAmount, finalAmount }
}

// GET /api/Order - Lấy tất cả orders của user
export async function getOrders() {
  await delay(500)
  const orders = _getOrders()
  return {
    success: true,
    data: orders,
  }
}

// GET /api/Order/{id} - Lấy chi tiết 1 order
export async function getOrderById(orderId) {
  await delay(300)
  const orders = _getOrders()
  const order = orders.find(o => o.orderId === Number(orderId))
  if (!order) {
    return { success: false, message: 'Order not found' }
  }
  return { success: true, data: order }
}

// POST /api/Order - Tạo order mới
// Request body: { items: [{productId, quantity}], bookingId?, shippingAddress, discountAmount? }
export async function createOrder(orderData) {
  await delay(700)

  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    return { success: false, message: 'Order must have at least one item' }
  }
  if (!orderData.shippingAddress) {
    return { success: false, message: 'Missing shippingAddress' }
  }

  for (const item of orderData.items) {
    if (!item.productId || !item.quantity || item.quantity < 1) {
      return { success: false, message: 'Invalid item: productId and quantity required' }
    }
  }

  const { orderId, orderCode } = generateOrderCode()
  const items = buildOrderItems(orderData.items)
  const discountAmount = orderData.discountAmount || 0
  const { totalAmount, finalAmount } = calculateTotals(items, discountAmount)

  const newOrder = {
    orderId,
    orderCode,
    totalAmount,
    discountAmount,
    finalAmount,
    orderType: orderData.bookingId ? 2 : 1,
    status: 1,
    paymentStatus: 1,
    shippingAddress: orderData.shippingAddress,
    createdAt: new Date().toISOString(),
    items,
  }

  const orders = _getOrders()
  orders.push(newOrder)
  saveOrders(orders)

  return {
    success: true,
    message: 'Order created successfully',
    data: newOrder,
  }
}

// PUT /api/Order/{id} - Cập nhật order (chỉ khi status=0, paymentStatus=0)
export async function updateOrder(orderId, updates) {
  await delay(500)

  const orders = _getOrders()
  const index = orders.findIndex(o => o.orderId === Number(orderId))

  if (index === -1) {
    return { success: false, message: 'Order not found' }
  }

  const order = orders[index]
  if (order.status !== 0 || order.paymentStatus !== 0) {
    return {
      success: false,
      message: 'Cannot update order that is not Pending/Unpaid',
    }
  }

  if (updates.items) {
    order.items = buildOrderItems(updates.items)
  }
  if (updates.shippingAddress !== undefined) {
    order.shippingAddress = updates.shippingAddress
  }
  if (updates.discountAmount !== undefined) {
    order.discountAmount = updates.discountAmount
  }
  if (updates.bookingId !== undefined) {
    order.orderType = updates.bookingId ? 2 : 1
  }

  const { totalAmount, finalAmount } = calculateTotals(order.items, order.discountAmount)
  order.totalAmount = totalAmount
  order.finalAmount = finalAmount

  saveOrders(orders)

  return {
    success: true,
    message: 'Order updated',
    data: order,
  }
}

// DELETE /api/Order/{id} - Xóa hẳn order (chỉ khi status=0, paymentStatus=0)
export async function deleteOrder(orderId) {
  await delay(300)

  const orders = _getOrders()
  const index = orders.findIndex(o => o.orderId === Number(orderId))

  if (index === -1) {
    return { success: false, message: 'Order not found' }
  }

  const order = orders[index]
  if (order.status !== 0 || order.paymentStatus !== 0) {
    return {
      success: false,
      message: 'Cannot delete order that is not Pending/Unpaid',
    }
  }

  orders.splice(index, 1)
  saveOrders(orders)

  return {
    success: true,
    message: 'Order deleted',
  }
}

// DELETE /api/Order/{id} - Hủy order (mark cancelled, giữ lại để audit)
export async function cancelOrder(orderId) {
  await delay(400)

  const orders = _getOrders()
  const index = orders.findIndex(o => o.orderId === Number(orderId))

  if (index === -1) {
    return { success: false, message: 'Order not found' }
  }

  const order = orders[index]
  if (order.status !== 0 || order.paymentStatus !== 0) {
    return {
      success: false,
      message: 'Cannot cancel order that is not Pending/Unpaid',
    }
  }

  orders[index] = {
    ...order,
    status: 4, // Cancelled
  }
  saveOrders(orders)

  return {
    success: true,
    message: 'Order cancelled',
    data: orders[index],
  }
}

// Helper: Mark order as paid (gọi sau khi webhook payment success)
export async function markOrderAsPaid(orderId) {
  const orders = _getOrders()
  const index = orders.findIndex(o => o.orderId === Number(orderId))
  if (index === -1) return { success: false }

  orders[index] = {
    ...orders[index],
    paymentStatus: 1, // Paid
    status: 1, // Pending
  }
  saveOrders(orders)
  return { success: true, data: orders[index] }
}

// Helper: Enum mapping cho UI
export const ORDER_STATUS = {
  1: 'Pending',
  2: 'Processing',
  3: 'Completed',
  4: 'Cancelled',
}

export const PAYMENT_STATUS = {
  1: 'Unpaid',
  2: 'Paid',
  3: 'Refunded',
  4: 'Failed',
}

export const ORDER_TYPE = {
  1: 'Product',
  2: 'Service',
  3: 'Mixed',
}

export function getStatusLabel(statusCode) {
  return ORDER_STATUS[statusCode] || `Unknown(${statusCode})`
}

export function getPaymentStatusLabel(paymentCode) {
  return PAYMENT_STATUS[paymentCode] || `Unknown(${paymentCode})`
}

export function getOrderTypeLabel(typeCode) {
  return ORDER_TYPE[typeCode] || `Unknown(${typeCode})`
}
