import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Products.css'
import AppHeader from '../../components/AppHeader/AppHeader'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const CATEGORIES = [
  { id: 0, name: 'Tất cả', icon: '🏪' },
  { id: 1, name: 'Thức ăn', icon: '🍖' },
  { id: 2, name: 'Đồ chơi', icon: '🎾' },
  { id: 3, name: 'Vệ sinh', icon: '🛁' },
  { id: 4, name: 'Y tế', icon: '💊' },
  { id: 5, name: 'Phụ kiện', icon: '🎀' },
]

function Products() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    let filtered = [...products]

    if (selectedCategory !== 0) {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0)
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0)
      return (a.name || '').localeCompare(b.name || '')
    })

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchTerm, sortBy])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/Product`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (e) {
      console.log('Failed to fetch products')
    }
    setIsLoading(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  }

  const getCategoryName = (id) => {
    const cat = CATEGORIES.find(c => c.id === id)
    return cat?.name || 'Khác'
  }

  return (
    <main className="products-page">
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
      <section className="products-hero">
        <div className="hero-image-wrapper">
          <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600" alt="Happy dog" className="hero-dog-image" />
        </div>
        <div className="hero-content">
          <p className="hero-subtitle">Pet Care Products</p>
          <h1 className="hero-title">Pet Shop</h1>
          <button
            className="hero-btn"
            onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}
          >
            Mua sắm ngay
          </button>
        </div>
      </section>

      {/* Feature Icons */}
      <section className="feature-icons">
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            className={`feature-icon-item ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <div className="feature-circle">
              <span className="feature-emoji">{cat.icon}</span>
            </div>
            <p>{cat.name}</p>
          </div>
        ))}
      </section>

      {/* Main Container */}
      <div className="products-container" id="shop">
        <div className="products-toolbar">
          {/* Search */}
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
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
              Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
            </span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="name">Tên A-Z</option>
              <option value="price-low">Giá thấp → cao</option>
              <option value="price-high">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-container">
            <span className="empty-icon">📦</span>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Thử thay đổi từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <article key={product.productId} className="service-card" onClick={() => navigate(`/products/${product.productId}`)}>
                <div className="service-image">
                  {product.thumbnailUrl || product.images?.[0] ? (
                    <img src={product.thumbnailUrl || product.images[0]} alt={product.name} />
                  ) : (
                    <div className="service-placeholder">📦</div>
                  )}
                </div>
                <div className="service-info">
                  <h3 className="service-name">{product.name}</h3>
                  <div className="service-meta">
                    <span className="service-time">{getCategoryName(product.category)}</span>
                    <span className="service-price">{formatPrice(product.price)}</span>
                  </div>
                  <div
                    className="service-book-btn"
                    onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.productId}`) }}
                  >
                    Mua ngay
                  </div>
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

export default Products
