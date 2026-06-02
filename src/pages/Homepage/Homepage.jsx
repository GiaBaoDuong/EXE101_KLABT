import heroPlaceholder from '../../assets/hero.png';
import petHeroImage from '../../assets/petHomepage1.jpg';
import petHeroImage2 from '../../assets/petHomepage2.jpg';
import petHeroImage3 from '../../assets/petHomepage3.jpg';
import petHeroImage4 from '../../assets/petHomepage4.jpg';
import petHeroImage5 from '../../assets/petHomepage5.jpg';
import petHomepage6 from '../../assets/petHomepage6.jpg';
import petHomepage7 from '../../assets/petHomepage7.jpg';
import petHomepage9 from '../../assets/petHomepage9.jpg';
import { Link, useNavigate } from 'react-router-dom';
import '../Homepage/Homepage.css'
import AppHeader from '../../components/AppHeader/AppHeader'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="img-slot">
        {product.thumbnailUrl || product.images?.[0] ? (
          <img src={product.thumbnailUrl || product.images[0]} alt={product.name} />
        ) : (
          <img src={heroPlaceholder} alt={product.name} />
        )}
      </div>
      <h4>{product.name}</h4>
    </article>
  )
}

function Homepage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [showWelcome, setShowWelcome] = useState(false)
  const [justLoggedIn, setJustLoggedIn] = useState(false)
  const [products, setProducts] = useState([])

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('justLoggedIn')
    if (loggedIn === 'true' && user?.fullName) {
      setJustLoggedIn(true)
      setShowWelcome(true)
      sessionStorage.removeItem('justLoggedIn')
      setTimeout(() => {
        setShowWelcome(false)
      }, 5000)
    }
    fetchProducts()
  }, [user])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Product`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (e) {
      console.log('Failed to fetch products')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const topPickProducts = products.slice(0, 8)

  return (
    <main className="homepage">
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

      {showWelcome && (
        <div className="welcome-banner">
          <span>🎉 Chào mừng {user?.fullName} đã quay trở lại!</span>
        </div>
      )}

      <section className="hero-section">
        <div className="hero-copy">
          <h1>20% Off Flash Sale</h1>
          <p>Save on essentials for walks to playtime and everything in between.</p>
          <button>Shop Sale</button>
        </div>
        <div className="hero-image">
          <img src={petHeroImage} alt="Hero placeholder" />
        </div>
      </section>

      <section className="promo-strip">20% Off Sitewide Ends Soon!</section>

      <section className="category-grid">
        <div className="category-card">
          <img src={petHeroImage2} alt="Walk category" />
          <span>Walk</span>
        </div>
        <div className="category-card">
          <img src={petHeroImage3} alt="Carry category" />
          <span>Carry</span>
        </div>
        <div className="category-card">
          <img src={petHeroImage4} alt="Play category" />
          <span>Play</span>
        </div>
        <div className="category-card">
          <img src={petHeroImage5} alt="Live category" />
          <span>Live</span>
        </div>
      </section>

      <section className="social-row">
        <h2>Make Life with Your Dog Look as Good as It Feels</h2>
        <div className="social-cards">
          {Array.from({ length: 5 }, (_, idx) => (
            <div className="social-card" key={`social-${idx + 1}`}>
              <img src={heroPlaceholder} alt={`Social post ${idx + 1}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="product-section">
        <div className="section-header">
          <h3>Top Pick</h3>
          <Link to="/products" className="view-all-link">Xem tất cả →</Link>
        </div>
        <div className="product-grid four-col">
          {topPickProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </section>

      <section className="split-banner">
        <div className="copy-box pink">
          <h3>NEW! Sản phẩm mới</h3>
          <p>Khám phá các sản phẩm mới nhất cho thú cưng của bạn</p>
          <Link to="/products"><button>Khám phá ngay</button></Link>
        </div>
        <div className="img-slot">
          <img src={petHomepage6} alt="New products" />
        </div>
      </section>

      <section className="split-banner">
        <div className="copy-box yellow">
          <h3>Dịch vụ chăm sóc</h3>
          <p>Đặt lịch grooming cho thú cưng của bạn ngay hôm nay</p>
          <Link to="/grooming"><button>Đặt lịch ngay</button></Link>
        </div>
        <div className="img-slot">
          <img src={petHomepage7} alt="Services" />
        </div>
      </section>

      <section className="give-back">
        <div className="img-slot">
          <img src={petHomepage9} alt="Pet care" />
        </div>
        <div className="copy-box lime">
          <h3>Chăm sóc thú cưng</h3>
          <p>
            Chúng tôi luôn đồng hành cùng bạn trong việc chăm sóc và bảo vệ thú cưng yêu quý.
          </p>
          <Link to="/pet-profile"><button>Tìm hiểu thêm</button></Link>
        </div>
      </section>

      <footer className="footer">
        <Link to="/home" className="logo-block">
          K-LABT
        </Link>
        <div className="footer-links">
          <div>
            <h4>Shop</h4>
            <a href="#">Walk</a>
            <a href="#">Carry</a>
            <a href="#">Play</a>
            <a href="#">Shop All</a>
          </div>
          <div>
            <h4>Info</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Reviews</a>
            <a href="#">Wholesale</a>
          </div>
          <div>
            <h4>Help</h4>
            <a href="#">Contact</a>
            <a href="#">FAQ</a>
            <a href="#">Shipping & Returns</a>
            <a href="#">Account</a>
          </div>
          <div>
            <h4>Join the Pack!</h4>
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Homepage
