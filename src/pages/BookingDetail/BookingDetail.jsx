import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getBookingById,
  cancelBooking,
  BOOKING_STATUS_CONFIG,
} from '../../services/orderService'
import SharedNav from '../../components/SharedNav/SharedNav'
import './BookingDetail.css'

// Format helpers -----------------------------------------------------------
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND' }).format(price || 0)
}

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// Service icons (flat stroke, ink color) -----------------------------------
const IconCalendar = (props) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="1"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconPet = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/>
    <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/>
    <path d="M8 14v.5"/>
    <path d="M16 14v.5"/>
    <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/>
    <path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"/>
  </svg>
)

const IconHash = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/>
    <line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/>
    <line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
)

// Status label mapping (English)
const STATUS_LABEL_EN = {
  1: 'Awaiting Payment',
  2: 'Confirmed',
  3: 'In Progress',
  4: 'Completed',
  5: 'Cancelled',
}

const STATUS_TONE = {
  1: { bg: '#fff3e0', color: '#e65100' },
  2: { bg: '#e3f2fd', color: '#0d47a1' },
  3: { bg: '#ede7f6', color: '#4527a0' },
  4: { bg: '#e8f5e9', color: '#1b5e20' },
  5: { bg: '#f5f5f5', color: '#707072' },
}

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadBooking()
  }, [id])

  const loadBooking = async () => {
    setLoading(true)
    setError('')
    const res = await getBookingById(id)
    if (res.success) {
      setBooking(res.data)
    } else {
      setError(res.message || 'Could not load booking')
    }
    setLoading(false)
  }

  const handlePay = () => navigate(`/checkout?bookingId=${id}`)

  const handleCancel = async () => {
    if (!window.confirm(`Cancel booking #${id}? This action cannot be undone.`)) return
    setActionLoading(true)
    const res = await cancelBooking(id)
    setActionLoading(false)
    if (res.success) await loadBooking()
    else alert(res.message || 'Could not cancel booking')
  }

  // =============================================================
  // LOADING STATE
  // =============================================================
  if (loading) {
    return (
      <div className="bkd-page">
        <SharedNav />
        <div className="bkd-container">
          <div className="bkd-loading">
            <div className="bkd-spinner" />
          </div>
        </div>
      </div>
    )
  }

  // =============================================================
  // ERROR STATE
  // =============================================================
  if (error || !booking) {
    return (
      <div className="bkd-page">
        <SharedNav />
        <div className="bkd-container">
          <button className="bkd-back" onClick={() => navigate(-1)}>
            <IconArrowLeft />
          </button>
          <div className="bkd-error">
            <h3>{error || 'Booking not found'}</h3>
            <button className="bkd-btn bkd-btn-primary" onClick={() => navigate('/purchases')}>
              View All Bookings
            </button>
          </div>
        </div>
      </div>
    )
  }

  // =============================================================
  // DATA EXTRACTION
  // =============================================================
  const status = booking.status ?? booking.Status
  const statusTone = STATUS_TONE[status] || { bg: '#f5f5f5', color: '#111' }
  const statusLabel = STATUS_LABEL_EN[status] || '—'
  const services = booking.bookingServices || booking.BookingServices || []
  const total = booking.totalPrice || booking.totalAmount || booking.TotalPrice || booking.TotalAmount || 0
  const petName = booking.petName || booking.PetName || (booking.pet && (booking.pet.name || booking.pet.Name)) || '—'
  const petSpecies = booking.petSpecies || booking.PetSpecies || (booking.pet && (booking.pet.species || booking.pet.Species)) || ''
  const notes = booking.notes || booking.Notes || ''
  const bookingDate = booking.bookingDate || booking.BookingDate || booking.createdAt
  const createdAt = booking.createdAt || booking.CreatedAt
  const firstService = services[0] || {}
  const serviceName = firstService.serviceName || firstService.ServiceName || 'Pet Care Service'

  const canCancel = status === 1 || status === 2
  const canPay = status === 1

  // Hero title — uppercase display
  const heroTitle = serviceName

  return (
    <div className="bkd-page">
      <SharedNav />

      <div className="bkd-container">

        {/* Back button — circular icon */}
        <button className="bkd-back" onClick={() => navigate(-1)} aria-label="Back">
          <IconArrowLeft />
        </button>

        {/* =========================================================
           HERO LOCKUP — extreme typographic contrast
           - Eyebrow: 12px muted uppercase
           - Title: 96px Bebas Neue uppercase (display tier)
           - Status badge: pill with semantic tone
           ========================================================= */}
        <section className="bkd-hero">
          <div className="bkd-hero__content">
            <p className="bkd-hero__eyebrow">Service Booking</p>
            <h1 className="bkd-hero__title">{heroTitle}</h1>
            <p className="bkd-hero__subtitle">
              Booked for <strong className="bkd-hero__highlight">{petName}</strong>
              {petSpecies ? <span className="bkd-hero__sep"> · </span> : null}
              {petSpecies}
            </p>
          </div>
          <div
            className="bkd-status-pill"
            style={{ background: statusTone.bg, color: statusTone.color }}
          >
            <span className="bkd-status-pill__dot" style={{ background: statusTone.color }} />
            {statusLabel}
          </div>
        </section>

        {/* =========================================================
           SUMMARY METRICS — 3 large numbers in soft-cloud cards
           Strong visual hierarchy: huge value, tiny label
           ========================================================= */}
        <section className="bkd-metrics">
          <div className="bkd-metric">
            <div className="bkd-metric__icon"><IconCalendar /></div>
            <span className="bkd-metric__label">Appointment</span>
            <span className="bkd-metric__value">{formatDate(bookingDate)}</span>
            <span className="bkd-metric__sub">{formatTime(bookingDate)}</span>
          </div>
          <div className="bkd-metric">
            <div className="bkd-metric__icon"><IconPet /></div>
            <span className="bkd-metric__label">Pet</span>
            <span className="bkd-metric__value">{petName}</span>
            <span className="bkd-metric__sub">{petSpecies || 'Companion'}</span>
          </div>
          <div className="bkd-metric">
            <div className="bkd-metric__icon"><IconHash /></div>
            <span className="bkd-metric__label">Reference</span>
            <span className="bkd-metric__value">#{booking.bookingId}</span>
            <span className="bkd-metric__sub">Placed {formatDate(createdAt)}</span>
          </div>
        </section>

        {/* =========================================================
           SERVICES — disclosure list
           Strong hierarchy: big service name + small meta
           ========================================================= */}
        <section className="bkd-block">
          <div className="bkd-block__head">
            <h2 className="bkd-block__title">Services Included</h2>
            <span className="bkd-block__count">{services.length || 1}</span>
          </div>
          <div className="bkd-services">
            {services.length > 0 ? (
              services.map((s, idx) => (
                <div key={s.bookingServiceId || s.BookingServiceId || idx} className="bkd-service">
                  <div className="bkd-service__index">{(idx + 1).toString().padStart(2, '0')}</div>
                  <div className="bkd-service__body">
                    <span className="bkd-service__name">{s.serviceName || s.ServiceName}</span>
                    <span className="bkd-service__meta">
                      <IconClock /> {formatDateTime(s.scheduledAt || s.ScheduledAt || bookingDate)}
                    </span>
                  </div>
                  <span className="bkd-service__price">{formatPrice(s.price || s.Price)}</span>
                </div>
              ))
            ) : (
              <div className="bkd-service">
                <div className="bkd-service__index">01</div>
                <div className="bkd-service__body">
                  <span className="bkd-service__name">{serviceName}</span>
                  <span className="bkd-service__meta">
                    <IconClock /> {formatDateTime(bookingDate)}
                  </span>
                </div>
                <span className="bkd-service__price">{formatPrice(total)}</span>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================
           NOTES — optional
           ========================================================= */}
        {notes && (
          <section className="bkd-block">
            <h2 className="bkd-block__title">Notes</h2>
            <p className="bkd-notes">{notes}</p>
          </section>
        )}

        {/* =========================================================
           TOTAL — full-bleed ink block
           ========================================================= */}
        <section className="bkd-total">
          <div className="bkd-total__left">
            <span className="bkd-total__label">Total Amount</span>
            <span className="bkd-total__sub">Tax included · All fees applied</span>
          </div>
          <span className="bkd-total__value">{formatPrice(total)}</span>
        </section>

        {/* =========================================================
           INFO — disclosure rows (pdp-disclosure-row)
           ========================================================= */}
        <section className="bkd-info">
          <div className="bkd-info__row">
            <span className="bkd-info__label">Status</span>
            <span
              className="bkd-info__value bkd-info__value--bold"
              style={{ color: statusTone.color }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="bkd-info__row">
            <span className="bkd-info__label">Location</span>
            <span className="bkd-info__value">
              <IconPin /> PetCare Studio
            </span>
          </div>
          <div className="bkd-info__row">
            <span className="bkd-info__label">Guarantee</span>
            <span className="bkd-info__value bkd-info__value--ok">
              <IconCheck /> Booking Confirmed
            </span>
          </div>
        </section>

        {/* =========================================================
           ACTIONS — pill CTAs, primary + secondary only
           ========================================================= */}
        <div className="bkd-actions">
          {canPay && (
            <button className="bkd-btn bkd-btn-primary" onClick={handlePay}>
              Pay Now
            </button>
          )}
          {canCancel && (
            <button
              className="bkd-btn bkd-btn-secondary"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              {actionLoading ? 'Cancelling…' : 'Cancel Booking'}
            </button>
          )}
          {!canPay && !canCancel && (
            <button className="bkd-btn bkd-btn-secondary" onClick={() => navigate('/purchases')}>
              View All Bookings
            </button>
          )}
        </div>
      </div>
    </div>
  )
}