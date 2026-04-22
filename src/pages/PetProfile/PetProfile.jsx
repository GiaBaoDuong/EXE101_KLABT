import { Link } from 'react-router-dom'
import topImage from '../../assets/petHomepage1.jpg'
import bottomImage from '../../assets/petHomepage6.jpg'
import './PetProfile.css'

function PetProfile() {
  return (
    <main className="pet-profile-page">
      <header className="pet-header">
        <div className="pet-header-top">
          <span>About</span>
          <h1>K-LABT</h1>
          <span>Search | User</span>
        </div>
        <nav className="pet-header-nav">
          <Link to="/pet-profile" className="active">
            Pet Profile
          </Link>
          <a href="#">Tele-vet</a>
          <a href="#">Grooming Booking</a>
        </nav>
        <div className="discount-bar">
          20% discount on healthcare and medical services is about to expire!
        </div>
      </header>

      <section className="hero-dashboard">
        <h2>Welcome back, Sarah</h2>
        <p>You have 3 tasks to complete for your pets today</p>

        <div className="dashboard-grid">
          <aside className="profile-panel card">
            <img src={topImage} alt="Buddy" className="avatar" />
            <h3>Buddy</h3>
            <p className="muted">Golden Retriever · 3 Years</p>
            <button type="button">Edit Profile</button>

            <div className="tag-list">
              <span>Sound of Thunder</span>
              <span>Loves Swimming</span>
              <span>Food Routine</span>
              <span>Park Explorer</span>
            </div>
          </aside>

          <div className="card personality-card">
            <h3>Personality Matrix</h3>
            <p className="muted">One look into Buddy&apos;s behavior pattern</p>

            <div className="metric">
              <div className="metric-top">
                <span>Energy Level</span>
                <strong>88%</strong>
              </div>
              <div className="bar orange">
                <div style={{ width: '88%' }} />
              </div>
            </div>

            <div className="metric">
              <div className="metric-top">
                <span>Adaptability</span>
                <strong>72%</strong>
              </div>
              <div className="bar blue">
                <div style={{ width: '72%' }} />
              </div>
            </div>

            <div className="metric">
              <div className="metric-top">
                <span>Trainability</span>
                <strong>95%</strong>
              </div>
              <div className="bar green">
                <div style={{ width: '95%' }} />
              </div>
            </div>
          </div>

          <div className="card appointment-card">
            <div>
              <h4>Dec 14th, 2023</h4>
              <p>at 2:30 PM</p>
            </div>
            <small>Next vet visit reminder and health session at Downtown Pet Vet</small>
            <button type="button">Manage Appointment</button>
          </div>

          <div className="card summary-row">
            <div className="circle-meter">
              <div>
                <strong>80%</strong>
                <span>happy score</span>
              </div>
            </div>
            <div className="activity-box">
              <h4>Activity Summary</h4>
              <p>Morning walk - done</p>
              <p>Training session - pending</p>
              <p>Socializing - 60 min</p>
            </div>
          </div>
        </div>
      </section>

      <section className="journey-section">
        <h3>Pet Life Journey</h3>
        <p className="muted">A complete record of memories and medical history for Buddy</p>

        <article className="journey-item">
          <div className="journey-text">
            <h4>Annual Vaccination</h4>
            <p>June 10, 2023 - South Hill Veterinary Clinic</p>
          </div>
          <span className="chip">MEDICAL</span>
        </article>

        <article className="journey-item">
          <div className="journey-text">
            <h4>Beach Day Outing</h4>
            <p>Sep 18, 2023 - Santa Monica Pier - 3 photos added</p>
          </div>
          <span className="chip orange">MEMORY</span>
        </article>

        <div className="journey-images">
          <img src={bottomImage} alt="Journey memory 1" />
          <img src={topImage} alt="Journey memory 2" />
          <img src={bottomImage} alt="Journey memory 3" />
        </div>
      </section>

      <section className="notes-section">
        <h3>Summary of Medical Notes</h3>
        <div className="notes-grid">
          <article className="note-card">
            <small>LAST EXAM</small>
            <strong>October 12, 2023</strong>
            <p>Perfectly healthy weight at 28.6kg</p>
          </article>
          <article className="note-card">
            <small>MEDICATION</small>
            <strong>Heartworm Preventive</strong>
            <p>Administered on the 1st of every month</p>
          </article>
          <article className="note-card">
            <small>ALLERGIES</small>
            <strong>Chicken (Mild)</strong>
            <p>Avoid poultry-based kibble</p>
          </article>
          <article className="note-card">
            <small>UPCOMING</small>
            <strong>Grooming Session</strong>
            <p>Scheduled for November 5th</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default PetProfile
