import heroPlaceholder from '../../assets/hero.png';
import petHeroImage from '../../assets/petHomepage1.jpg';
import petHeroImage2 from '../../assets/petHomepage2.jpg';
import petHeroImage3 from '../../assets/petHomepage3.jpg';
import petHeroImage4 from '../../assets/petHomepage4.jpg';
import petHeroImage5 from '../../assets/petHomepage5.jpg';
import petHomepage6 from '../../assets/petHomepage6.jpg';
import petHomepage7 from '../../assets/petHomepage7.jpg';
import petHomepage9 from '../../assets/petHomepage9.jpg';
import { Link } from 'react-router-dom';
import '../Homepage/Homepage.css'

const topPickProducts = Array.from({ length: 8 }, (_, index) => ({
  id: `top-${index + 1}`,
  name: `Top Pick ${index + 1}`,
  price: '$39.00',
}))

const mostLovedProducts = Array.from({ length: 4 }, (_, index) => ({
  id: `love-${index + 1}`,
  name: `Most Loved ${index + 1}`,
  price: '$29.00',
}))

const allDayPlayProducts = Array.from({ length: 4 }, (_, index) => ({
  id: `play-${index + 1}`,
  name: `All Day Play ${index + 1}`,
  price: '$19.00',
}))

function ProductCard({ item }) {
  return (
    <article className="product-card">
      <div className="img-slot">
        <img src={heroPlaceholder} alt={item.name} />
      </div>
      <h4>{item.name}</h4>
      <p>{item.price}</p>
    </article>
  )
}

function Homepage() {
  return (
    <main className="homepage">
      <header className="top-header">
        <div className="brand">K-LAB</div>
        <nav>
          <Link to="/pet-profile">Pet Profile</Link>
          <a href="#">Pet Health Record</a>
          <a href="#">Pet Life Manager</a>
          <a href="#">Grooming Booking</a>
          <a href="#">Tele-vet</a>
          <a href="#">Pet Sitter</a>
        </nav>
      </header>

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
        <h3>topt pick</h3>
        <div className="product-grid four-col">
          {topPickProducts.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="split-banner">
        <div className="copy-box pink">
          <h3>NEW! Lighter, Brighter & Only at Walmart</h3>
          <p>Placeholder text, replace with your final marketing message.</p>
          <button>Explore Collection</button>
        </div>
        <div className="img-slot">
          <img src={petHomepage6} alt="Walmart campaign placeholder" />
        </div>
      </section>

      <section className="product-section">
        <h3>Most Loved Kits</h3>
        <div className="product-grid four-col">
          {mostLovedProducts.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="split-banner">
        <div className="copy-box yellow">
          <h3>Shop Wild One IRL</h3>
          <p>Get your favorite products at a store near you.</p>
          <button>Find Your Store</button>
        </div>
        <div className="img-slot">
          <img src={petHomepage7} alt="Store section placeholder" />
        </div>
      </section>

      <section className="product-section">
        <h3>All Day Play</h3>
        <div className="product-grid four-col">
          {allDayPlayProducts.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="give-back">
        <div className="img-slot">
          <img src={petHomepage9} alt="Give back art placeholder" />
        </div>
        <div className="copy-box lime">
          <h3>Give Back</h3>
          <p>
            We support organizations that help dogs find forever families.
            Replace this with your final content.
          </p>
          <button>Learn More</button>
        </div>
      </section>

      <footer className="footer">
        <div className="logo-block">K-LAB</div>
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
