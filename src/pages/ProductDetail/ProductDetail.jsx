import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './ProductDetail.css'
import SharedNav from '../../components/SharedNav/SharedNav'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const CATEGORIES = [
  { id: 1, name: 'Food' },
  { id: 2, name: 'Toys' },
  { id: 3, name: 'Grooming' },
  { id: 4, name: 'Health' },
  { id: 5, name: 'Accessories' },
]

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 2.5l3 3.5-3 3.5" />
  </svg>
)

const HeartIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="13" />
  </svg>
)

const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    fetchProduct()
    window.scrollTo(0, 0)
  }, [id])

  const fetchProduct = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/Product/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
      }
    } catch (e) {
      console.log('Failed to fetch product')
    }
    setIsLoading(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  }

  const getCategoryName = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId)
    return cat?.name || 'Other'
  }

  const getAllImages = () => {
    const images = []
    if (product?.thumbnailUrl) images.push(product.thumbnailUrl)
    if (product?.images) {
      if (Array.isArray(product.images)) {
        images.push(...product.images)
      }
    }
    return images.length > 0 ? images : [null]
  }

  const handleAddToCart = () => {
    alert(`Added ${quantity} × "${product.name}" to your bag.`)
  }

  const handleBuyNow = () => {
    navigate('/purchases')
  }

  if (isLoading) {
    return (
      <main className="pdp-page">
        <SharedNav cartCount={0} />
        <div className="pdp-loading">
          <div className="pdp-skeleton__image" />
          <div className="pdp-skeleton__info">
            <div className="skeleton-line" style={{ height: 12, width: '30%' }} />
            <div className="skeleton-line" style={{ height: 36, width: '90%' }} />
            <div className="skeleton-line" style={{ height: 14, width: '40%' }} />
            <div className="skeleton-line" style={{ height: 32, width: '50%' }} />
            <div className="skeleton-line" style={{ height: 80, width: '100%' }} />
            <div className="skeleton-line" style={{ height: 52, width: '100%', borderRadius: 9999 }} />
            <div className="skeleton-line" style={{ height: 52, width: '100%', borderRadius: 9999 }} />
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="pdp-page">
        <SharedNav cartCount={0} />
        <div className="pdp-empty">
          <p className="pdp-empty__code">404</p>
          <h2 className="pdp-empty__title">Product Not Found</h2>
          <p className="pdp-empty__sub">This product may have been removed or the link is incorrect.</p>
          <Link
            to="/products"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--color-ink)', color: 'var(--color-canvas)',
              border: 'none', borderRadius: 'var(--rounded-full)',
              padding: '14px 28px', fontFamily: 'var(--font-body-medium)',
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
            }}
          >
            Shop All Products
          </Link>
        </div>
      </main>
    )
  }

  const images = getAllImages()
  const inStock = (product.stockQuantity || 0) > 0

  return (
    <main className="pdp-page">
      <SharedNav cartCount={0} />

      {/* Breadcrumb */}
      <div className="pdp-breadcrumb">
        <Link to="/home" className="pdp-breadcrumb__item">Home</Link>
        <span className="pdp-breadcrumb__separator">/</span>
        <Link to="/products" className="pdp-breadcrumb__item">Products</Link>
        <span className="pdp-breadcrumb__separator">/</span>
        <span className="pdp-breadcrumb__item pdp-breadcrumb__item--current">
          {product.name}
        </span>
      </div>

      {/* PDP Layout */}
      <div className="pdp-layout">
        {/* Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-gallery__main">
            {images[selectedImage] ? (
              <img src={images[selectedImage]} alt={product.name} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-soft-cloud)', fontSize: 48 }}>
                🐾
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="pdp-gallery__thumbs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`pdp-gallery__thumb ${selectedImage === idx ? 'is-active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  {img && <img src={img} alt={`Thumbnail ${idx + 1}`} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pdp-info">
          <p className="pdp-info__eyebrow">{getCategoryName(product.category)}</p>

          <h1 className="pdp-info__name">{product.name}</h1>

          {product.brand && (
            <p className="pdp-info__brand">{product.brand}</p>
          )}

          <div className="pdp-info__price-row">
            <span className="pdp-info__price">{formatPrice(product.price)}</span>
            <span className="pdp-info__price-label">VND</span>
          </div>

          <div className="pdp-disclosure-group">
            <div className="pdp-disclosure-row">
              <span className="pdp-disclosure-row__label">Availability</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="pdp-stock">
                  <div className={`pdp-stock__dot ${inStock ? 'pdp-stock__dot--in' : 'pdp-stock__dot--out'}`} />
                  <span className={`pdp-stock__text ${inStock ? 'pdp-stock__text--in' : 'pdp-stock__text--out'}`}>
                    {inStock ? `In Stock (${product.stockQuantity})` : 'Out of Stock'}
                  </span>
                </div>
                <span className="pdp-disclosure-row__chevron"><ChevronRight /></span>
              </div>
            </div>

            <div className="pdp-disclosure-row">
              <span className="pdp-disclosure-row__label">Shipping</span>
              <span className="pdp-disclosure-row__value">Free over 500K VND</span>
              <span className="pdp-disclosure-row__chevron"><ChevronRight /></span>
            </div>

            <div className="pdp-disclosure-row">
              <span className="pdp-disclosure-row__label">Returns</span>
              <span className="pdp-disclosure-row__value">30-day free returns</span>
              <span className="pdp-disclosure-row__chevron"><ChevronRight /></span>
            </div>
          </div>

          <div className="pdp-quantity">
            <span className="pdp-quantity__label">Quantity</span>
            <div className="pdp-quantity__controls">
              <button
                className="pdp-quantity__btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor">
                  <rect width="12" height="2" />
                </svg>
              </button>
              <input
                type="number"
                className="pdp-quantity__input"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                aria-label="Quantity"
              />
              <button
                className="pdp-quantity__btn"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 1v10M1 6h10" />
                </svg>
              </button>
            </div>
          </div>

          <div className="pdp-ctas">
            <button
              className="pdp-cta-primary"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <BagIcon />
              Add to Bag
            </button>
            <button
              className="pdp-cta-secondary"
              onClick={handleBuyNow}
              disabled={!inStock}
            >
              Buy Now
            </button>
          </div>

          <div className="pdp-info__actions-row">
            <button
              className="pdp-action-link"
              onClick={() => setWishlisted(w => !w)}
              aria-label="Add to wishlist"
            >
              <HeartIcon filled={wishlisted} />
              {wishlisted ? 'Wishlisted' : 'Wishlist'}
            </button>
            <button className="pdp-action-link" aria-label="Share">
              <ShareIcon />
              Share
            </button>
          </div>

          {product.description && (
            <div className="pdp-description">
              <h3 className="pdp-description__title">About This Product</h3>
              <p className="pdp-description__body">{product.description}</p>
            </div>
          )}
        </div>
      </div>

    </main>
  )
}

export default ProductDetail
