import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SharedNav from '../../components/SharedNav/SharedNav'
import './PetHealthRecord.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconPaw = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C10.7 2 10 3.3 10 5.5C10 7.7 11 9 12 9C13 9 14 7.7 14 5.5C14 3.3 13.3 2 12 2Z" />
    <path d="M4 8C2.5 8 1 9.5 1 11.5C1 13.5 2.5 15 4 15C5.5 15 7 13.5 7 11.5C7 9.5 5.5 8 4 8Z" />
    <path d="M20 8C18.5 8 17 9.5 17 11.5C17 13.5 18.5 15 20 15C21.5 15 23 13.5 23 11.5C23 9.5 21.5 8 20 8Z" />
    <path d="M4 15C2.5 15 1 16.5 1 18.5C1 20.5 2.5 22 4 22C5.5 22 7 20.5 7 18.5C7 16.5 5.5 15 4 15Z" />
    <path d="M20 15C18.5 15 17 16.5 17 18.5C17 20.5 18.5 22 20 22C21.5 22 23 20.5 23 18.5C23 16.5 21.5 15 20 15Z" />
    <path d="M12 17C9 17 7 20 7 23H17C17 20 15 17 12 17Z" />
  </svg>
)
const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const IconSyringe = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2l4 4" /><path d="M17 7L8.24 15.76A2 2 0 0 0 9.41 18H7a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2.41a2 2 0 0 0 1.17-3.35L17 8.5" />
  </svg>
)
const IconStethoscope = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
    <circle cx="20" cy="10" r="2" />
  </svg>
)
const IconApple = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const IconClipboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
)
const IconWeight = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3" /><path d="M6.5 8a2 2 0 0 0-1.9 1.4L2 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2l-2.6-8.6A2 2 0 0 0 17.5 8H18" />
  </svg>
)
const IconHeart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

function PetHealthRecord() {
  const { user, token } = useAuth()
  const [pets, setPets] = useState([])
  const [selectedPet, setSelectedPet] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPetList, setShowPetList] = useState(false)

  useEffect(() => {
    if (user?.userId) {
      fetchPets()
    } else {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPetList && !e.target.closest('.phr-selector') && !e.target.closest('.phr-pet-list')) {
        setShowPetList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPetList])

  const fetchPets = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pet/user/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (res.ok) {
        const data = await res.json()
        setPets(data)
        if (data.length > 0 && !selectedPet) {
          setSelectedPet(data[0])
        }
      }
    } catch (e) {
      console.error('Failed to fetch pets', e)
    }
    setIsLoading(false)
  }

  const getInitials = (name) => {
    if (!name) return 'P'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-'
    const birth = new Date(birthDate)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()
    if (years > 0) return `${years} yr${years > 1 ? 's' : ''}`
    if (months > 0) return `${months} mo${months > 1 ? 's' : ''}`
    return 'Under 1 mo'
  }

  const handleSelectPet = (pet) => {
    setSelectedPet(pet)
    setShowPetList(false)
  }

  if (isLoading) {
    return (
      <main className="pet-health-record-page">
        <SharedNav cartCount={0} />
        <div className="phr-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="pet-health-record-page">
      <SharedNav cartCount={0} />

      {/* Hero */}
      <section className="phr-hero">
        <div className="phr-hero__inner">
          <div className="phr-hero__left">
            <div className="phr-hero__eyebrow">
              <span className="phr-hero__eyebrow-dot" />
              Pet Health Record
            </div>
            <h1 className="phr-hero__title">
              {selectedPet ? selectedPet.name : 'Health Records'}
            </h1>
            {selectedPet ? (
              <div className="phr-hero__meta">
                <span>{selectedPet.species}</span>
                <span className="phr-hero__meta-sep">·</span>
                <span>{selectedPet.breed || '—'}</span>
              </div>
            ) : (
              <div className="phr-hero__meta">Select a pet to view health records</div>
            )}
          </div>

          <div className="phr-hero__avatar-wrap">
            <div className="phr-hero__avatar-white-ring">
              <div className="phr-hero__avatar-ring">
                <div className="phr-hero__avatar-inner">
                  {selectedPet?.avatarUrl ? (
                    <img src={selectedPet.avatarUrl} alt="" className="phr-hero__avatar" />
                  ) : (
                    <div className="phr-hero__avatar-placeholder"><IconPaw /></div>
                  )}
                </div>
              </div>
            </div>
            {selectedPet && (
              <div className="phr-hero__verified"><IconCheck /></div>
            )}
          </div>
        </div>
      </section>

      {/* Pet Selector */}
      {pets.length > 0 && (
        <div className="phr-selector-wrap">
          <span className="phr-selector-label">Pets</span>
          <div className="phr-selector">
            <button className="phr-selector-btn" onClick={() => setShowPetList(!showPetList)}>
              {selectedPet?.avatarUrl ? (
                <img src={selectedPet.avatarUrl} alt="" className="phr-selector-avatar" />
              ) : (
                <div className="phr-selector-avatar-placeholder">{getInitials(selectedPet?.name)}</div>
              )}
              <div className="phr-selector-info">
                <span className="phr-selector-name">{selectedPet?.name || 'Select Pet'}</span>
                <span className="phr-selector-species">{selectedPet?.species || ''}</span>
              </div>
              <span className="phr-selector-arrow"><IconChevronDown /></span>
            </button>
            {showPetList && (
              <div className="phr-pet-list">
                {pets.map((pet) => (
                  <div key={pet.petId} className={`phr-pet-list-item ${selectedPet?.petId === pet.petId ? 'active' : ''}`}
                    onClick={() => handleSelectPet(pet)}>
                    {pet.avatarUrl ? (
                      <img src={pet.avatarUrl} alt="" className="phr-pet-list-avatar" />
                    ) : (
                      <div className="phr-pet-list-avatar-placeholder">{getInitials(pet.name)}</div>
                    )}
                    <div className="phr-pet-list-info">
                      <span className="phr-pet-list-name">{pet.name}</span>
                      <span className="phr-pet-list-species">{pet.species}</span>
                    </div>
                    {selectedPet?.petId === pet.petId && <span className="phr-pet-list-check"><IconCheck /></span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Health Summary Cards */}
      {selectedPet ? (
        <>
          {/* Key Health Info */}
          <section className="phr-card-section">
            <div className="phr-card">
              <div className="phr-card__body">
                <h2 className="phr-card__title">Health Summary</h2>
                <p className="phr-card__species">{selectedPet.name} · {selectedPet.species}{selectedPet.breed ? ` · ${selectedPet.breed}` : ''}</p>

                <div className="phr-info-grid">
                  <div className="phr-info-cell">
                    <span className="phr-info-label">Age</span>
                    <span className="phr-info-value">{calculateAge(selectedPet.birthDate)}</span>
                  </div>
                  <div className="phr-info-cell">
                    <span className="phr-info-label">Weight</span>
                    <span className="phr-info-value">{selectedPet.currentWeight ? `${selectedPet.currentWeight} kg` : '-'}</span>
                  </div>
                  <div className="phr-info-cell">
                    <span className="phr-info-label">Gender</span>
                    <span className="phr-info-value">
                      {selectedPet.gender === 0 ? 'Male' : selectedPet.gender === 1 ? 'Female' : '-'}
                    </span>
                  </div>
                  <div className="phr-info-cell">
                    <span className="phr-info-label">Color</span>
                    <span className="phr-info-value">{selectedPet.color || '-'}</span>
                  </div>
                  <div className="phr-info-cell">
                    <span className="phr-info-label">Neutered</span>
                    <span className="phr-info-value">{selectedPet.isNeutered ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="phr-info-cell">
                    <span className="phr-info-label">Health Status</span>
                    <span className="phr-info-value">{selectedPet.healthStatus || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <div className="phr-quick-actions">
            <button className="phr-quick-action">
              <div className="phr-quick-action__icon"><IconSyringe /></div>
              <span className="phr-quick-action__label">Vaccines</span>
            </button>
            <button className="phr-quick-action">
              <div className="phr-quick-action__icon"><IconStethoscope /></div>
              <span className="phr-quick-action__label">Vet Visits</span>
            </button>
            <button className="phr-quick-action">
              <div className="phr-quick-action__icon"><IconApple /></div>
              <span className="phr-quick-action__label">Nutrition</span>
            </button>
            <button className="phr-quick-action">
              <div className="phr-quick-action__icon"><IconClipboard /></div>
              <span className="phr-quick-action__label">Health Logs</span>
            </button>
          </div>

          {/* Health Metrics */}
          <section className="phr-card-section">
            <div className="phr-card phr-card--metrics">
              <div className="phr-card__body">
                <h2 className="phr-card__title">Health Metrics</h2>
                <div className="phr-metrics-grid">
                  <div className="phr-metric-item">
                    <div className="phr-metric-item__icon"><IconHeart /></div>
                    <div className="phr-metric-item__body">
                      <span className="phr-metric-item__label">Health Status</span>
                      <span className="phr-metric-item__value">{selectedPet.healthStatus || 'Not recorded'}</span>
                    </div>
                  </div>
                  <div className="phr-metric-item">
                    <div className="phr-metric-item__icon"><IconWeight /></div>
                    <div className="phr-metric-item__body">
                      <span className="phr-metric-item__label">Current Weight</span>
                      <span className="phr-metric-item__value">{selectedPet.currentWeight ? `${selectedPet.currentWeight} kg` : 'Not recorded'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Medical Notes */}
          <section className="phr-card-section">
            <div className="phr-card">
              <div className="phr-card__body">
                <h2 className="phr-card__title">Medical Notes</h2>
                <div className="phr-notes-empty">
                  <IconClipboard />
                  <p>No medical notes yet</p>
                  <span>Vaccination records, vet visit notes, and health logs will appear here.</span>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="phr-empty-section">
          <div className="phr-empty">
            <div className="phr-empty__icon"><IconPaw /></div>
            <h2 className="phr-empty__title">No pets yet</h2>
            <p className="phr-empty__sub">Add a pet from the Pet Profile page to start tracking health records!</p>
            <Link to="/pet-profile" className="phr-btn-primary">
              <IconPlus /> Go to Pet Profile
            </Link>
          </div>
        </section>
      )}

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <Link to="/pet-profile" className="nav-tab">Pet Profile</Link>
        <Link to="/health-record" className="nav-tab active">Pet Health Record</Link>
        <Link to="/grooming" className="nav-tab">Grooming Booking</Link>
      </div>
    </main>
  )
}

export default PetHealthRecord
