import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Services.css'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import SharedNav from '../../components/SharedNav/SharedNav'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const BOOKING_STATUSES = {
  1: { label: 'Pending', color: '#f59e0b' },
  2: { label: 'Confirmed', color: '#3b82f6' },
  3: { label: 'In Progress', color: '#8b5cf6' },
  4: { label: 'Completed', color: '#22c55e' },
  5: { label: 'Cancelled', color: '#ef4444' },
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)
const CloseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 1l12 12M13 1L1 13" />
  </svg>
)
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

function Services() {
  const { logout, user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    let filtered = [...services]

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredServices(filtered)
  }, [services, searchTerm])

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/Service`)
      if (res.ok) {
        const data = await res.json()
        setServices(data)
      }
    } catch (e) {
      console.log('Failed to fetch services')
    }
    setIsLoading(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  }

  return (
    <main className="services-page">
      <SharedNav cartCount={0} />

      {/* Campaign Hero */}
      <section className="services-hero">
        <img
          src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=1600&q=80"
          alt="Pet care service"
          className="services-hero__bg"
        />
        <div className="services-hero__overlay" />
        <div className="services-hero__content">
          <p className="services-hero__eyebrow">Premium Pet Services</p>
          <h1 className="services-hero__title">Pet Services</h1>
          <p className="services-hero__sub">
            Expert care for your beloved pet. Book online in seconds.
          </p>
          <Link to="/grooming" className="services-hero__cta">
            Book a Service
          </Link>
        </div>
      </section>

      {/* Subnav Bar */}
      <nav className="services-subnav">
        <div className="services-subnav__inner">
          <span className="services-subnav__breadcrumb">
            Home / Services <span>/ All</span>
          </span>
          <div className="services-subnav__right">
            <span className="services-subnav__count">
              {filteredServices.length} Services
            </span>
          </div>
        </div>
      </nav>

      {/* Search */}
      <div className="services-search">
        <div className="services-search-pill">
          <span className="services-search-pill__icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="services-search-pill__input"
          />
          {searchTerm && (
            <button
              className="services-search-pill__clear"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="services-loading">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ aspectRatio: '16/9', background: 'var(--color-soft-cloud)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
              <div style={{ paddingTop: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <div style={{ height: 12, width: '30%', background: 'var(--color-hairline-soft)', borderRadius: 4, animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
                <div style={{ height: 16, width: '75%', background: 'var(--color-hairline-soft)', borderRadius: 4, animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
                <div style={{ height: 12, width: '90%', background: 'var(--color-hairline-soft)', borderRadius: 4, animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
                <div style={{ height: 40, borderRadius: 9999, marginTop: 'var(--spacing-lg)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="services-empty">
          <p className="services-empty__title">No Results</p>
          <p className="services-empty__sub">Try adjusting your search to find what you're looking for.</p>
          <button className="services-empty__action" onClick={() => setSearchTerm('')}>
            Clear Search
          </button>
        </div>
      ) : (
        <div className="services-grid-wrapper">
          <div className="services-grid">
            {filteredServices.map(service => (
              <article key={service.serviceId} className="pp-card service-card">
                <div className="pp-card__image-wrap">
                  {service.thumbnailUrl || service.images?.[0] ? (
                    <img
                      src={service.thumbnailUrl || service.images[0]}
                      alt={service.name}
                      className="pp-card__image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="pp-card__placeholder">
                      <span className="pp-card__placeholder-icon">🐾</span>
                    </div>
                  )}
                </div>
                <div className="pp-card__body">
                  <div className="pp-card__head">
                    <div>
                      <h3 className="pp-card__title">{service.name}</h3>
                      <p className="pp-card__species">{service.category || 'Grooming'}</p>
                    </div>
                  </div>
                  <p className="service-card__desc">{service.description}</p>
                  <div className="pp-card__actions">
                    <span className="service-card__price">{formatPrice(service.price)}</span>
                    <Link to="/grooming" className="pp-btn-primary">
                      Book Now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="products-footer">
        <div className="products-footer__inner">
          <div className="products-footer__grid">
            <div className="products-footer__brand">
              <Link to="/home" className="products-footer__logo">K-LABT</Link>
              <p className="products-footer__tagline">
                Premium care products for your beloved pets. Quality you can trust.
              </p>
            </div>
            <div>
              <h4 className="products-footer__col-title">Shop</h4>
              <ul className="products-footer__links">
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/products?cat=1">Food</Link></li>
                <li><Link to="/products?cat=2">Toys</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="products-footer__col-title">Services</h4>
              <ul className="products-footer__links">
                <li><Link to="/services">All Services</Link></li>
                <li><Link to="/grooming">Grooming</Link></li>
                <li><Link to="/doctor">Pet Doctor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="products-footer__col-title">Pet Care</h4>
              <ul className="products-footer__links">
                <li><Link to="/pet-profile">Pet Profile</Link></li>
                <li><Link to="/purchases">Purchases</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="products-footer__col-title">Help</h4>
              <ul className="products-footer__links">
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Shipping</a></li>
                <li><a href="#">Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="products-footer__bottom">
            <p className="products-footer__copyright">© 2026 K-LABT. All rights reserved.</p>
            <div className="products-footer__legal">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Services
