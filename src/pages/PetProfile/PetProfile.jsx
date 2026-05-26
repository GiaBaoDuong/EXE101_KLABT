import petAvatar from '../../assets/petHomepage1.jpg';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/AppHeader/AppHeader'
import { useState } from 'react'
import './PetProfile.css'

const meetingNotes = [
  {
    date: 'Oct 12, 2023',
    type: 'Checkup',
    summary: 'Healthy weight, diet plan adjusted for winter.',
    action: 'Details'
  },
  {
    date: 'Aug 05, 2023',
    type: 'Emergency',
    summary: 'Minor paw injury treated with topical antibiotic.',
    action: 'Details'
  },
  {
    date: 'May 21, 2023',
    type: 'Routine',
    summary: 'Standard bloodwork clear. Heartworm preventative refilled.',
    action: 'Details'
  },
];

const vaccines = [
  { name: 'Rabies 1-Year', status: 'Active', clinic: 'South Hill Veterinary Clinic' },
  { name: 'DHPP', status: 'Active', clinic: 'South Hill Veterinary Clinic' },
];

function PetProfile() {
  const [countdown, setCountdown] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  return (
    <main className="pet-profile-page">
      <AppHeader
        leftText="About"
        nav={[
          { label: 'Pet Profile', to: '/pet-profile' },
          { label: 'Pet Health Record', to: '/health-record' },
          { label: 'Grooming Booking', to: '/grooming' },
        ]}
        promoText="20% discount on healthcare and medical services is about to expire!"
        cartCount={0}
      />

      {/* Discount Banner with Countdown */}
      <section className="discount-banner">
        <div className="banner-content">
          <span className="banner-icon">🎉</span>
          <span className="banner-text">20% discount on healthcare and medical services is about to expire!</span>
        </div>
        <div className="countdown">
          <div className="countdown-item">
            <span className="countdown-number">{countdown.days}</span>
            <span className="countdown-label">Days</span>
          </div>
          <span className="countdown-sep">:</span>
          <div className="countdown-item">
            <span className="countdown-number">{countdown.hours.toString().padStart(2, '0')}</span>
            <span className="countdown-label">Hours</span>
          </div>
          <span className="countdown-sep">:</span>
          <div className="countdown-item">
            <span className="countdown-number">{countdown.minutes.toString().padStart(2, '0')}</span>
            <span className="countdown-label">Min</span>
          </div>
          <span className="countdown-sep">:</span>
          <div className="countdown-item">
            <span className="countdown-number">{countdown.seconds.toString().padStart(2, '0')}</span>
            <span className="countdown-label">Sec</span>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <h1>Welcome back, Sarah</h1>
        <p>You have <strong>3 tasks</strong> to complete for your pets today</p>
      </section>

      {/* Digital Pet ID Card */}
      <section className="id-card-section">
        <div className="section-header">
          <h2>Digital Pet ID Card</h2>
          <button className="manage-pets-btn">Manage all pets</button>
        </div>
        
        <div className="id-card">
          <div className="id-card-left">
            <div className="pet-basic-info">
              <div className="info-row">
                <span className="info-label">Name</span>
                <span className="info-value">Buddy</span>
              </div>
              <div className="info-row">
                <span className="info-label">Breed</span>
                <span className="info-value">Golden Retriever</span>
              </div>
              <div className="info-row">
                <span className="info-label">Age</span>
                <span className="info-value">3 years old • Male</span>
              </div>
              <div className="info-row">
                <span className="info-label">Weight</span>
                <span className="info-value">32 kg</span>
              </div>
              <div className="info-row">
                <span className="info-label">ID Number</span>
                <span className="info-value">365 112 345 678</span>
              </div>
              <div className="info-row">
                <span className="info-label">Weight</span>
                <span className="info-value">32.5 kg</span>
              </div>
            </div>
            
            <div className="id-card-buttons">
              <button className="more-info-btn">More Information</button>
              <button className="update-info-btn">Update Info</button>
            </div>
          </div>
          
          <div className="id-card-right">
            <div className="pet-image-wrapper">
              <img src={petAvatar} alt="Buddy" className="pet-photo" />
              <div className="verified-badge">
                <span className="check-icon">✓</span>
                VERIFIED PET
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Icons */}
      <section className="quick-actions">
        <button className="action-icon">
          <span className="action-emoji">💉</span>
          <span className="action-label">Vaccines</span>
        </button>
        <button className="action-icon">
          <span className="action-emoji">🏥</span>
          <span className="action-label">Vet Visits</span>
        </button>
        <button className="action-icon">
          <span className="action-emoji">🥗</span>
          <span className="action-label">Nutrition</span>
        </button>
        <button className="action-icon">
          <span className="action-emoji">📋</span>
          <span className="action-label">Logs</span>
        </button>
      </section>

      {/* Meeting Notes Table */}
      <section className="meeting-notes-section">
        <div className="section-header">
          <h2>Auto-generated Meeting Notes</h2>
          <a href="#" className="view-all-link">View All</a>
        </div>
        
        <div className="table-wrapper">
          <table className="meeting-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>TYPE</th>
                <th>SUMMARY</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {meetingNotes.map((note, index) => (
                <tr key={index}>
                  <td>{note.date}</td>
                  <td>
                    <span className={`type-badge ${note.type.toLowerCase()}`}>{note.type}</span>
                  </td>
                  <td className="summary-cell">{note.summary}</td>
                  <td>
                    <button className="details-btn">{note.action}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Vaccination History */}
      <section className="vaccination-section">
        <div className="section-header">
          <h2>Vaccination History</h2>
        </div>
        
        <div className="vaccine-cards">
          {vaccines.map((vaccine, index) => (
            <div key={index} className="vaccine-card">
              <div className="vaccine-icon">💉</div>
              <div className="vaccine-info">
                <h4>{vaccine.name}</h4>
                <p className="vaccine-status">{vaccine.status}</p>
                <p className="vaccine-clinic">{vaccine.clinic}</p>
              </div>
              <div className="vaccine-status-badge">
                <span className="status-dot"></span>
                {vaccine.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Navigation Tabs */}
      <div className="bottom-nav">
        <Link to="/pet-profile" className="nav-tab active">
          Pet Profile
        </Link>
        <Link to="/health-record" className="nav-tab">
          Pet Health Record
        </Link>
        <Link to="/grooming" className="nav-tab">
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

export default PetProfile
