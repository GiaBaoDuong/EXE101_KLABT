// Mock Doctor Service - Simulates /api/doctor/* endpoints

const BOOKING_STORAGE_KEY = 'mock_doctor_bookings'
const COUNTER_KEY = 'mock_doctor_booking_counter'

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function _getBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKING_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings))
}

function getNextId() {
  const current = Number(localStorage.getItem(COUNTER_KEY) || '2000')
  const next = current + 1
  localStorage.setItem(COUNTER_KEY, String(next))
  return next
}

// Seed demo bookings
function seedDemoBookings() {
  const existing = _getBookings()
  if (existing.length > 0) return

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 86400000)
  const yesterday = new Date(now.getTime() - 86400000)

  const demo = [
    {
      bookingId: 2001,
      bookingCode: 'BK-20260810-2001',
      customerName: 'Nguyễn Văn A',
      customerEmail: 'nva@email.com',
      customerPhone: '0912345678',
      petName: 'Mèo Mun',
      petType: 'Cat',
      petBreed: 'Mèo ta',
      petAge: '2 years',
      bookingDate: tomorrow.toISOString(),
      startTime: tomorrow.toISOString(),
      endTime: new Date(tomorrow.getTime() + 3600000).toISOString(),
      status: 2, // Confirmed
      totalPrice: 350000,
      note: 'Khám định kỳ',
      services: [
        { serviceId: 1, serviceName: 'Pet Health Checkup', price: 200000 },
        { serviceId: 2, serviceName: 'Vaccination', price: 150000 },
      ],
      medicalNote: null,
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
    {
      bookingId: 2002,
      bookingCode: 'BK-20260809-2002',
      customerName: 'Trần Thị B',
      customerEmail: 'ttb@email.com',
      customerPhone: '0923456789',
      petName: 'Chó Phú Quốc',
      petType: 'Dog',
      petBreed: 'Phú Quốc',
      petAge: '3 years',
      bookingDate: yesterday.toISOString(),
      startTime: yesterday.toISOString(),
      endTime: new Date(yesterday.getTime() + 3600000).toISOString(),
      status: 3, // InProgress
      totalPrice: 500000,
      note: 'Triệt sản',
      services: [
        { serviceId: 3, serviceName: 'Minor Surgery', price: 500000 },
      ],
      medicalNote: null,
      createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
    },
    {
      bookingId: 2003,
      bookingCode: 'BK-20260808-2003',
      customerName: 'Lê Văn C',
      customerEmail: 'lvc@email.com',
      customerPhone: '0934567890',
      petName: 'Chó Corgi',
      petType: 'Dog',
      petBreed: 'Corgi',
      petAge: '1 year',
      bookingDate: new Date(now.getTime() - 86400000 * 2).toISOString(),
      startTime: new Date(now.getTime() - 86400000 * 2).toISOString(),
      endTime: new Date(now.getTime() - 86400000 * 2 + 3600000).toISOString(),
      status: 4, // Completed
      totalPrice: 450000,
      note: 'Tiêm vaccine dại',
      services: [
        { serviceId: 4, serviceName: 'Vaccination - Rabies', price: 450000 },
      ],
      medicalNote: 'Pet is healthy. Vaccine administered. Next appointment in 1 year.',
      createdAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
    },
    {
      bookingId: 2004,
      bookingCode: 'BK-20260807-2004',
      customerName: 'Phạm Thị D',
      customerEmail: 'ptd@email.com',
      customerPhone: '0945678901',
      petName: 'Mèo Anh',
      petType: 'Cat',
      petBreed: 'British Shorthair',
      petAge: '4 years',
      bookingDate: new Date(now.getTime() - 86400000 * 3).toISOString(),
      startTime: new Date(now.getTime() - 86400000 * 3).toISOString(),
      endTime: new Date(now.getTime() - 86400000 * 3 + 3600000).toISOString(),
      status: 2, // Confirmed
      totalPrice: 300000,
      note: 'Kiểm tra tai',
      services: [
        { serviceId: 5, serviceName: 'ENT Checkup', price: 300000 },
      ],
      medicalNote: null,
      createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
    },
  ]

  saveBookings(demo)
  localStorage.setItem(COUNTER_KEY, '2004')
}

seedDemoBookings()

// GET /api/doctor/my-bookings - Lấy danh sách lịch hẹn của doctor
export async function getDoctorBookings() {
  await delay(500)
  const bookings = _getBookings()
  return {
    success: true,
    data: bookings,
  }
}

// PUT /api/doctor/bookings/{bookingId}/status - Cập nhật trạng thái
export async function updateBookingStatus(bookingId, newStatus) {
  await delay(400)

  const bookings = _getBookings()
  const index = bookings.findIndex(b => b.bookingId === Number(bookingId))

  if (index === -1) {
    return { success: false, message: 'Booking not found' }
  }

  const booking = bookings[index]

  // Validate status transition
  if (newStatus === 3 && booking.status !== 2) {
    return { success: false, message: 'Can only start exam for Confirmed bookings' }
  }

  bookings[index] = { ...booking, status: newStatus }
  saveBookings(bookings)

  return {
    success: true,
    message: 'Status updated successfully',
    data: bookings[index],
  }
}

// POST /api/doctor/bookings/{bookingId}/complete - Hoàn tất lịch hẹn
export async function completeBooking(bookingId, medicalNote) {
  await delay(500)

  if (!medicalNote || !medicalNote.trim()) {
    return { success: false, message: 'Medical notes are required' }
  }

  const bookings = _getBookings()
  const index = bookings.findIndex(b => b.bookingId === Number(bookingId))

  if (index === -1) {
    return { success: false, message: 'Booking not found' }
  }

  const booking = bookings[index]

  if (booking.status !== 3) {
    return { success: false, message: 'Can only complete InProgress bookings' }
  }

  bookings[index] = {
    ...booking,
    status: 4, // Completed
    medicalNote: medicalNote.trim(),
    completedAt: new Date().toISOString(),
  }
  saveBookings(bookings)

  return {
    success: true,
    message: 'Booking completed successfully',
    data: bookings[index],
  }
}

// Helper: Reset mock data (for testing)
export function resetMockData() {
  localStorage.removeItem(BOOKING_STORAGE_KEY)
  localStorage.removeItem(COUNTER_KEY)
  seedDemoBookings()
  return { success: true, message: 'Mock data reset' }
}
