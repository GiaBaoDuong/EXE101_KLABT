import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './ProductDetail.css'
import AppHeader from '../../components/AppHeader/AppHeader'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const CATEGORIES = [
  { id: 1, name: 'Thức ăn' },
  { id: 2, name: 'Đồ chơi' },
  { id: 3, name: 'Vệ sinh' },
  { id: 4, name: 'Y tế' },
  { id: 5, name: 'Phụ kiện' },
]

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchProduct()
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

  const getCategoryName = (id) => {
    const cat = CATEGORIES.find(c => c.id === id)
    return cat?.name || 'Khác'
  }

  const getAllImages = () => {
    const images = []
    if (product?.thumbnailUrl) images.push(product.thumbnailUrl)
    if (product?.images) {
      if (Array.isArray(product.images)) {
        images.push(...product.images)
      }
    }
    return images.length > 0 ? images : [product?.thumbnailUrl]
  }

  const handleAddToCart = () => {
    alert(`Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`)
  }

  const handleBack = () => {
    navigate('/products')
  }

  if (isLoading) {
    return (
      <main className="product-detail-page">
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="product-detail-page">
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
        <div className="empty-container">
          <span className="empty-icon">📦</span>
          <h3>Không tìm thấy sản phẩm</h3>
          <button onClick={handleBack} className="back-btn">Quay lại</button>
        </div>
      </main>
    )
  }

  const images = getAllImages()

  return (
    <main className="product-detail-page">
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

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/home">Trang chủ</Link>
        <span>/</span>
        <Link to="/products">Sản phẩm</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      {/* Product Detail */}
      <div className="product-detail-container">
        {/* Image Gallery */}
        <div className="product-images">
          <div className="main-image">
            <img src={images[selectedImage]} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <span className="product-category">{getCategoryName(product.category)}</span>
          <h1 className="product-name">{product.name}</h1>
          {product.brand && <span className="product-brand">by {product.brand}</span>}
          
          <div className="product-price-detail">{formatPrice(product.price)}</div>
          
          <p className="product-description">{product.description}</p>

          <div className="product-meta">
            {product.stockQuantity > 0 ? (
              <span className="stock in-stock">✓ Còn hàng ({product.stockQuantity})</span>
            ) : (
              <span className="stock out-of-stock">✕ Hết hàng</span>
            )}
          </div>

          <div className="quantity-selector">
            <label>Số lượng:</label>
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          <div className="action-buttons">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              🛒 Thêm vào giỏ hàng
            </button>
            <button className="buy-now-btn" onClick={handleAddToCart}>
              Mua ngay
            </button>
          </div>
        </div>
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

export default ProductDetail
