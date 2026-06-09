import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../Homepage/Homepage.css'
import SharedNav from '../../components/SharedNav/SharedNav'
import { useAuth } from '../../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const heroPlaceholder = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80'
const petHeroImage = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80'
const petHeroImage2 = 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&q=80'
const petHeroImage3 = 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80'
const petHeroImage4 = 'https://images.unsplash.com/photo-1535930891776-0c2dfb7daeda?w=600&q=80'
const petHeroImage5 = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80'
const petHomepage6 = 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=800&q=80'
const petHomepage7 = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80'
const petHomepage9 = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80'

const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6h7M6 2.5l3.5 3.5L6 9.5" />
  </svg>
)

const PawIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5.5 1c-.83 0-1.5.67-1.5 1.5S5.67 14 6.5 14 8 13.33 8 12.5 7.33 11 6.5 11zM4 7c-.83 0-1.5.67-1.5 1.5S3.17 10 4 10s1.5-.67 1.5-1.5S4.83 7 4 7zm8 0c-.83 0-1.5.67-1.5 1.5S11.17 10 12 10s1.5-.67 1.5-1.5S12.83 7 12 7zm5.5 1c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S18.33 8 17.5 8zM10 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

function useScrollReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          // Propagate is-visible to direct child cards for stagger animations
          const cards = el.querySelectorAll(
            '.home-cat-card, .home-product-card, .home-social__card, .home-member-item'
          )
          cards.forEach(card => card.classList.add('is-visible'))
          observer.unobserve(el)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px', ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

function ProductCard({ product }) {
  return (
    <article className="home-product-card">
      <div className="home-product-card__image-wrap">
        {product.thumbnailUrl || product.images?.[0] ? (
          <img src={product.thumbnailUrl || product.images[0]} alt={product.name} className="home-product-card__image" />
        ) : (
          <img src={heroPlaceholder} alt={product.name} className="home-product-card__image" />
        )}
      </div>
      <div className="home-product-card__body">
        <h3 className="home-product-card__name">{product.name}</h3>
        <span className="home-product-card__price">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price || 0)}
        </span>
      </div>
    </article>
  )
}

function Homepage() {
  const { user } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])

  // Scroll reveal refs
  const categoriesHeaderRef = useScrollReveal()
  const catGridRef = useScrollReveal()
  const socialHeaderRef = useScrollReveal()
  const socialGridRef = useScrollReveal()
  const productsHeaderRef = useScrollReveal()
  const productsGridRef = useScrollReveal()
  const splitBanner1Ref = useScrollReveal()
  const splitBanner2Ref = useScrollReveal()
  const splitBanner3Ref = useScrollReveal()
  const memberBandRef = useScrollReveal()

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('justLoggedIn')
    if (loggedIn === 'true' && user?.fullName) {
      setShowWelcome(true)
      sessionStorage.removeItem('justLoggedIn')
      setTimeout(() => {
        setIsLeaving(true)
        setTimeout(() => setShowWelcome(false), 400)
      }, 5000)
    }
    fetchProducts()
    fetchServices()
  }, [user])

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Product`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (e) { /* silent */ }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Service`)
      if (res.ok) {
        const data = await res.json()
        setServices(Array.isArray(data) ? data : [])
      }
    } catch (e) { /* silent */ }
  }

  const topPickProducts = products.slice(0, 4)
  const featuredServices = services.slice(0, 4)

  return (
    <main className="homepage">
      <SharedNav cartCount={0} />

      {showWelcome && (
        <div className={`home-welcome${isLeaving ? ' is-leaving' : ''}`}>
          <div className="home-welcome__inner">
            <div className="home-welcome__icon">
              <PawIcon />
            </div>
            <div className="home-welcome__text">
              <span className="home-welcome__greeting">Welcome back</span>
              <span className="home-welcome__name">{user?.fullName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Hero */}
      <section className="home-hero">
        <div className="home-hero__image-wrap">
          <img src={petHeroImage} alt="Happy dog" />
        </div>
        <div className="home-hero__overlay" />
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Flash Sale — Limited Time</p>
          <h1 className="home-hero__title">20% Off<br />Everything</h1>
          <p className="home-hero__sub">
            Save on essentials for walks to playtime and everything in between. No code needed.
          </p>
          <div className="home-hero__cta-group">
            <Link to="/products" className="home-hero__cta-primary">
              Shop Sale <ArrowRight />
            </Link>
            <Link to="/products" className="home-hero__cta-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Bar */}
      <div className="home-promo-bar">
        <span className="home-promo-bar-inner">● 20% Off Sitewide — Ends Sunday &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ● 20% Off Sitewide — Ends Sunday</span>
      </div>

      {/* Category Grid */}
      <section className="home-categories">
        <div className="home-categories__header reveal-header" ref={categoriesHeaderRef}>
          <h2 className="home-categories__title">Shop by Category</h2>
          <Link to="/products" className="home-categories__link">
            View All <ArrowRight />
          </Link>
        </div>
        <div className="home-categories__grid reveal" ref={catGridRef}>
          <Link to="/products?cat=walk" className="home-cat-card">
            <img src={petHeroImage2} alt="Walk" className="home-cat-card__image" />
            <div className="home-cat-card__overlay" />
            <span className="home-cat-card__label">Walk</span>
          </Link>
          <Link to="/products?cat=carry" className="home-cat-card">
            <img src={petHeroImage3} alt="Carry" className="home-cat-card__image" />
            <div className="home-cat-card__overlay" />
            <span className="home-cat-card__label">Carry</span>
          </Link>
          <Link to="/products?cat=play" className="home-cat-card">
            <img src={petHeroImage4} alt="Play" className="home-cat-card__image" />
            <div className="home-cat-card__overlay" />
            <span className="home-cat-card__label">Play</span>
          </Link>
          <Link to="/products?cat=live" className="home-cat-card">
            <img src={petHeroImage5} alt="Live" className="home-cat-card__image" />
            <div className="home-cat-card__overlay" />
            <span className="home-cat-card__label">Live</span>
          </Link>
        </div>
      </section>

      {/* Social Row — Featured Services */}
      <section className="home-social">
        <div className="home-social__header reveal-header" ref={socialHeaderRef}>
          <h2 className="home-social__title">Make Life with Your Pet Look as Good as It Feels</h2>
        </div>
        <div className="home-social__grid reveal" ref={socialGridRef}>
          {featuredServices.length === 0 && Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="home-social__card">
              <div className="home-social__card-img-wrap">
                <img src={heroPlaceholder} alt={`Service ${idx + 1}`} />
              </div>
              <div className="home-social__card-body">
                <span className="home-social__card-name">Professional Service {idx + 1}</span>
                <span className="home-social__card-price">Contact for price</span>
              </div>
            </div>
          ))}
          {featuredServices.map(service => (
            <Link key={service.serviceId} to="/grooming" className="home-social__card">
              <div className="home-social__card-img-wrap">
                <img src={service.imageUrl || service.thumbnailUrl || heroPlaceholder} alt={service.name} />
              </div>
              <div className="home-social__card-body">
                <span className="home-social__card-name">{service.name}</span>
                <span className="home-social__card-price">
                  {service.price
                    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)
                    : 'Contact'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Section */}
      <section className="home-products">
        <div className="home-products__header reveal-header" ref={productsHeaderRef}>
          <h2 className="home-products__title">Top Picks</h2>
          <Link to="/products" className="home-products__link">
            Shop All <ArrowRight />
          </Link>
        </div>
        <div className="home-products__grid reveal" ref={productsGridRef}>
          {topPickProducts.map(product => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      </section>

      {/* Split Banner — New Products */}
      <section className="home-split-banner reveal" ref={splitBanner1Ref}>
        <div className="home-split-banner__image">
          <img src={petHomepage6} alt="New products" />
        </div>
        <div className="home-split-banner__content home-split-banner--pink">
          <p className="home-split-banner__eyebrow home-split-banner__eyebrow--dark">New Arrivals</p>
          <h2 className="home-split-banner__title home-split-banner__title--dark">New Products</h2>
          <p className="home-split-banner__sub">Discover the latest products for your beloved pet. Quality you can trust.</p>
          <Link to="/products" className="home-split-banner__cta">Explore Now <ArrowRight /></Link>
        </div>
      </section>

      {/* Split Banner — Grooming */}
      <section className="home-split-banner home-split-banner--reversed reveal" ref={splitBanner2Ref}>
        <div className="home-split-banner__image">
          <img src={petHomepage7} alt="Grooming services" />
        </div>
        <div className="home-split-banner__content home-split-banner--ink">
          <p className="home-split-banner__eyebrow home-split-banner__eyebrow--light">Services</p>
          <h2 className="home-split-banner__title home-split-banner__title--light">Pet Grooming</h2>
          <p className="home-split-banner__sub home-split-banner__sub--light">Book a professional grooming session for your pet today. Happy pet, happy life.</p>
          <Link to="/grooming" className="home-split-banner__cta">Book Now <ArrowRight /></Link>
        </div>
      </section>

      {/* Split Banner — Pet Care */}
      <section className="home-split-banner reveal" ref={splitBanner3Ref}>
        <div className="home-split-banner__image">
          <img src={petHomepage9} alt="Pet care" />
        </div>
        <div className="home-split-banner__content home-split-banner--yellow">
          <p className="home-split-banner__eyebrow home-split-banner__eyebrow--dark">Pet Care</p>
          <h2 className="home-split-banner__title home-split-banner__title--dark">We Care</h2>
          <p className="home-split-banner__sub">We're always by your side caring for and protecting your beloved pets.</p>
          <Link to="/pet-profile" className="home-split-banner__cta">Learn More <ArrowRight /></Link>
        </div>
      </section>

      {/* Member Benefit Band */}
      <div className="home-member-band reveal" ref={memberBandRef}>
        <div className="home-member-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          <span className="home-member-item__text">Free Shipping Over 500K</span>
        </div>
        <div className="home-member-divider" />
        <div className="home-member-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="home-member-item__text">In-Store Pickup</span>
        </div>
        <div className="home-member-divider" />
        <div className="home-member-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <span className="home-member-item__text">30-Day Free Returns</span>
        </div>
        <div className="home-member-divider" />
        <div className="home-member-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span className="home-member-item__text">24/7 Support</span>
        </div>
      </div>

    </main>
  )
}

export default Homepage
