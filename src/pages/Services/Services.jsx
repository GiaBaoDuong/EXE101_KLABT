import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Services.css'
import AppHeader from '../../components/AppHeader/AppHeader'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

function Services() {
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
      {/* App Header */}
      <AppHeader
        leftText="About"
        nav={[
          { label: 'Pet Profile', to: '/pet-profile' },
          { label: 'Product', to: '/products' },
          { label: 'Service', to: '/services' },
          { label: 'Grooming Booking', to: '/grooming' },
          { label: 'Purchases', to: '/purchases' },
        ]}
        cartCount={0}
      />

      {/* Hero Banner */}
      <section className="services-hero">
        <div className="hero-content">
          <p className="hero-subtitle">Premium pet services</p>
          <h1 className="hero-title">Pet Services</h1>
          <div className="hero-stats-mini">
            <div className="stat-item">
              <span className="stat-num">{services.length}</span>
              <span className="stat-lbl">Dịch vụ</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">⭐</span>
              <span className="stat-lbl">Chất lượng</span>
            </div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600" alt="Pet care service" className="hero-image" />
        </div>
      </section>

      {/* Main Container */}
      <div className="services-container">
        {/* Search */}
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>

        {/* Results Info */}
        <div className="results-info">
          <span className="results-count">
            Tìm thấy <strong>{filteredServices.length}</strong> dịch vụ
          </span>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dịch vụ...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="empty-container">
            <span className="empty-icon">⚙️</span>
            <h3>Không tìm thấy dịch vụ</h3>
            <p>Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map(service => (
              <article key={service.serviceId} className="service-card">
                <div className="service-image">
                  {service.thumbnailUrl || service.images?.[0] ? (
                    <img src={service.thumbnailUrl || service.images[0]} alt={service.name} />
                  ) : (
                    <div className="service-placeholder">🐾</div>
                  )}
                </div>
                <div className="service-info">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-desc">{service.description}</p>
                  <div className="service-meta">
                    <span className="service-time">⏱️ {service.durationMinutes || service.duration} phút</span>
                    <span className="service-price">{formatPrice(service.price)}</span>
                  </div>
                  <Link to="/grooming" className="service-book-btn">Đặt lịch</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <Link to="/home" className="logo-block">K-LABT</Link>
        <div className="footer-links">
          <div>
            <h4>Shop</h4>
            <Link to="/products">Sản phẩm</Link>
            <Link to="/services">Dịch vụ</Link>
            <Link to="/grooming">Grooming</Link>
          </div>
          <div>
            <h4>Pet Care</h4>
            <Link to="/pet-profile">Pet Profile</Link>
            <Link to="/health-record">Health Record</Link>
          </div>
          <div>
            <h4>Help</h4>
            <a href="#">Contact</a>
            <a href="#">FAQ</a>
          </div>
          <div>
            <h4>Follow Us</h4>
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 K-LABT. Made with ❤️ for your pets</p>
        </div>
      </footer>
    </main>
  )
}

export default Services
