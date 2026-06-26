import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './Products.css'
import SharedNav from '../../components/SharedNav/SharedNav'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const CATEGORIES = [
  { id: 0, name: 'All', icon: null },
  { id: 1, name: 'Food', icon: null },
  { id: 2, name: 'Toys', icon: null },
  { id: 3, name: 'Grooming', icon: null },
  { id: 4, name: 'Health', icon: null },
  { id: 5, name: 'Accessories', icon: null },
]

function Products() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const cat = searchParams.get('cat')
    return cat ? parseInt(cat, 10) : 0
  })
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
      console.log('Products API status:', res.status)
      if (res.ok) {
        const data = await res.json()
        console.log('Products API data:', data)
        setProducts(data)
      } else {
        console.error('Products API error:', res.status)
      }
    } catch (e) {
      console.error('Failed to fetch products:', e)
    }
    setIsLoading(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  }

  const getCategoryName = (id) => {
    const cat = CATEGORIES.find(c => c.id === id)
    return cat?.name || 'Other'
  }

  return (
    <main className="products-page">
      {/* Shared Nav */}
      <SharedNav cartCount={0} />

      {/* Campaign Hero */}
      <section className="products-hero">
        <img
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=80"
          alt="Happy dog"
          className="products-hero__bg"
        />
        <div className="products-hero__overlay" />
        <div className="products-hero__content">
          <p className="products-hero__eyebrow">Pet Care Products</p>
          <h1 className="products-hero__title">Pet Shop</h1>
          <button
            className="products-hero__cta"
            onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })}
          >
            Shop Now
            <span className="products-hero__cta-arrow" aria-hidden="true">&#8594;</span>
          </button>
        </div>
      </section>

      {/* Subnav Bar */}
      <nav className="products-subnav">
        <div className="products-subnav__inner">
          <span className="products-subnav__breadcrumb">
            Home / Products <span>/ All</span>
          </span>
          <div className="products-subnav__right">
            <span className="products-subnav__count">
              {filteredProducts.length} Products
            </span>
            <div className="products-subnav__sort">
              <span className="products-subnav__sort-label">Sort By</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="name">Name A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Category Filter */}
      <div className="products-filter-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`filter-chip ${selectedCategory === cat.id ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="products-search">
        <div className="search-pill">
          <span className="search-pill__icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            id="product-search"
            name="product-search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-pill__input"
          />
          {searchTerm && (
            <button className="search-pill__clear" onClick={() => setSearchTerm('')} aria-label="Clear search">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div id="shop">
        {isLoading ? (
          <div className="products-loading">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="skeleton-card__image" />
                <div className="skeleton-card__body">
                  <div className="skeleton-line skeleton-line--sm" />
                  <div className="skeleton-line skeleton-line--lg" />
                  <div className="skeleton-line skeleton-line--md" />
                  <div className="skeleton-line skeleton-line--price" />
                  <div className="skeleton-line skeleton-line--btn" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="products-empty">
            <p className="products-empty__title">No Results</p>
            <p className="products-empty__sub">Try adjusting your search or filter to find what you're looking for.</p>
            <button className="products-empty__action" onClick={() => { setSearchTerm(''); setSelectedCategory(0) }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid-wrapper">
            <div className="products-grid">
              {filteredProducts.map(product => (
                <article
                  key={product.productId}
                  className="product-card"
                  onClick={() => navigate(`/products/${product.productId}`)}
                >
                  <div className="product-card__image-wrap">
                    {product.thumbnailUrl || product.images?.[0] ? (
                      <img
                        src={product.thumbnailUrl || product.images[0]}
                        alt={product.name}
                        className="product-card__image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-card__placeholder">🐾</div>
                    )}
                    <span className="product-card__badge">{getCategoryName(product.category)}</span>
                  </div>
                  <div className="product-card__body">
                    <span className="product-card__category">{getCategoryName(product.category)}</span>
                    <h3 className="product-card__name">{product.name}</h3>
                    {product.brand && (
                      <span className="product-card__brand">{product.brand}</span>
                    )}
                    <div className="product-card__price-row">
                      <span className="product-card__price">{formatPrice(product.price)}</span>
                    </div>
                    <div
                      className="product-card__cta"
                      onClick={e => { e.stopPropagation(); navigate(`/products/${product.productId}`) }}
                    >
                      View Details
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

    </main>
  )
}

export default Products
