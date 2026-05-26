import petHeroImage from '../../assets/petHomepage1.jpg';
import petHeroImage2 from '../../assets/petHomepage2.jpg';
import petHeroImage3 from '../../assets/petHomepage3.jpg';
import { Link, useNavigate } from 'react-router-dom';
import '../PetGrooming/PetGrooming.css'
import AppHeader from '../../components/AppHeader/AppHeader'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react';

const services = [
  {
    name: 'Bath & Brush',
    description: 'Gentle cleansing and brushing for a healthy coat',
    icon: '🛁',
  },
  {
    name: 'Haircut',
    description: 'Professional styling tailored to your pets breed',
    icon: '✂️',
  },
  {
    name: 'Nail Trim',
    description: 'Careful nail trimming for comfortable paws',
    icon: '💅',
  },
];

const testimonials = [
  {
    name: 'Sarah M.',
    text: 'My golden retriever looks amazing every time! The team is so patient and caring.',
    rating: 5,
  },
  {
    name: 'John D.',
    text: 'Best grooming service in town. My Shih Tzu always comes back looking like a star.',
    rating: 5,
  },
  {
    name: 'Emily R.',
    text: 'They truly understand how to handle nervous pets. Highly recommend!',
    rating: 5,
  },
];

function PetGrooming() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    petBreed: '',
    petAge: '',
    petWeight: '',
    service: '',
    specialRequests: '',
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !formData.petName || !formData.service) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }
    alert(`Đặt lịch thành công!\nDịch vụ: ${formData.service}\nNgày: ${selectedDate}\nGiờ: ${selectedTime}\nThú cưng: ${formData.petName}`)
  }

  return (
    <main className="pet-grooming">
      <AppHeader
        leftText="About"
        nav={[
          { label: 'Pet Profile', to: '/pet-profile' },
          { label: 'Pet Health Record', href: '#' },
          { label: 'Pet Life Manager', href: '#' },
          { label: 'Grooming Booking', to: '/grooming' },
          { label: 'Tele-vet', href: '#' },
          { label: 'Pet Sitter', href: '#' },
        ]}
        cartCount={0}
      />

      {/* Hero Banner Section */}
      <section className="grooming-hero">
        <div className="hero-image-wrapper">
          <img src={petHeroImage} alt="Happy groomed dog" className="hero-dog-image" />
        </div>
        <div className="hero-content">
          <p className="hero-subtitle">Premium grooming service</p>
          <h1 className="hero-title">Paw & Pamper</h1>
          <button 
            className="hero-btn"
            onClick={() => document.getElementById('booking').scrollIntoView({ behavior: 'smooth' })}
          >
            Book Now
          </button>
        </div>
      </section>

      {/* Feature Icons Section */}
      <section className="feature-icons">
        <div className="feature-icon-item">
          <div className="feature-circle">
            <span className="feature-emoji">🛁</span>
          </div>
          <p>Our Service</p>
        </div>
        <div className="feature-icon-item">
          <div className="feature-circle">
            <span className="feature-emoji">⏰</span>
          </div>
          <p>Time</p>
        </div>
        <div className="feature-icon-item">
          <div className="feature-circle">
            <span className="feature-emoji">💰</span>
          </div>
          <p>Price</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-header">
          <div className="services-title-row">
            <h2>Professional Services</h2>
            <span className="price-tag">$150</span>
          </div>
        </div>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="booking-section">
        <h2 className="booking-title">Book a Grooming Session</h2>
        
        <form onSubmit={handleSubmit} className="booking-form">
          {/* Pet Info Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Pet Name</label>
              <input
                type="text"
                name="petName"
                value={formData.petName}
                onChange={handleInputChange}
                placeholder="Enter pet name"
                required
              />
            </div>
            <div className="form-group">
              <label>Pet Type</label>
              <select
                name="petType"
                value={formData.petType}
                onChange={handleInputChange}
              >
                <option value="">Select type</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Breed</label>
              <input
                type="text"
                name="petBreed"
                value={formData.petBreed}
                onChange={handleInputChange}
                placeholder="Enter breed"
              />
            </div>
          </div>

          {/* Age & Weight Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input
                type="text"
                name="petAge"
                value={formData.petAge}
                onChange={handleInputChange}
                placeholder="e.g., 2 years"
              />
            </div>
            <div className="form-group">
              <label>Weight</label>
              <input
                type="text"
                name="petWeight"
                value={formData.petWeight}
                onChange={handleInputChange}
                placeholder="e.g., 10 kg"
              />
            </div>
            <div className="form-group">
              <label>Select Service</label>
              <select
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                required
              >
                <option value="">Select service</option>
                <option value="Bath & Brush">Bath & Brush - $45</option>
                <option value="Haircut">Haircut - $55</option>
                <option value="Nail Trim">Nail Trim - $25</option>
                <option value="Full Grooming">Full Grooming - $150</option>
              </select>
            </div>
          </div>

          {/* Schedule Row */}
          <div className="form-row schedule-row">
            <div className="form-group">
              <label>Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>Select Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Special Requests</label>
              <input
                type="text"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Any special instructions..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="confirm-btn">
            Book Appointment
          </button>
        </form>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Pet Parents Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((item, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">{'★'.repeat(item.rating)}</div>
              <p className="testimonial-text">"{item.text}"</p>
              <p className="testimonial-author">- {item.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <Link to="/pet-profile" className="nav-tab">
          Pet Profile
        </Link>
        <Link to="/health-record" className="nav-tab">
          Pet Health Record
        </Link>
        <Link to="/grooming" className="nav-tab active">
          Grooming Booking
        </Link>
      </div>

      {/* Footer */}
      <footer className="footer">
        <Link to="/" className="logo-block">
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

export default PetGrooming
