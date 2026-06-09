import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SharedNav from '../../components/SharedNav/SharedNav'
import ImageCropper from '../../components/ImageCropper/ImageCropper'
import './PetProfile.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'


function PetProfile() {
  const { user, token } = useAuth()
  const fileInputRef = useRef(null)

  const [pets, setPets] = useState([])
  const [selectedPet, setSelectedPet] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPetList, setShowPetList] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [cropModal, setCropModal] = useState({ open: false, file: null, preview: null })

  const [editForm, setEditForm] = useState({
    name: '',
    species: '',
    breed: '',
    gender: 0,
    birthDate: '',
    color: '',
    currentWeight: '',
    healthStatus: '',
    avatarUrl: '',
    isNeutered: false
  })

  const [createForm, setCreateForm] = useState({
    name: '',
    species: '',
    breed: '',
    gender: 0,
    birthDate: '',
    color: '',
    currentWeight: '',
    healthStatus: '',
    avatarUrl: '',
    isNeutered: false
  })

  useEffect(() => {
    if (user?.userId) {
      fetchPets()
    } else {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPetList && !event.target.closest('.pp-selector') && !event.target.closest('.pp-pet-list')) {
        setShowPetList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPetList])

  const fetchPets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Pet/user/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const petList = Array.isArray(data) ? data : (data ? [data] : [])
        setPets(petList)
        if (petList.length > 0) {
          if (!selectedPet || !petList.find(p => p.petId === selectedPet.petId)) {
            setSelectedPet(petList[0])
          }
        } else {
          setSelectedPet(null)
        }
      }
    } catch (err) {
      console.log('Error fetching pets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setCropModal({ open: true, file, preview: event.target?.result })
    }
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = (blob) => {
    const previewUrl = URL.createObjectURL(blob)
    const setter = showEditModal ? setEditForm : setCreateForm
    setter(prev => ({ ...prev, avatarUrl: previewUrl }))
    setCropModal({ open: false, file: blob, preview: null })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCropCancel = () => {
    setCropModal({ open: false, file: null, preview: null })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFormChange = (e, setter) => {
    const { name, value, type, checked } = e.target
    setter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCreatePet = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let avatarUrl = createForm.avatarUrl

      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        const res = await fetch(avatarUrl)
        const blob = await res.blob()
        const formData = new FormData()
        formData.append('file', blob, 'avatar.jpg')
        const uploadRes = await fetch(`${API_BASE_URL}/api/uploads/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        })
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          avatarUrl = data.url || data.imageUrl || data
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/Pet`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm,
          avatarUrl,
          currentWeight: parseFloat(createForm.currentWeight) || 0
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPets(prev => [...prev, data])
        if (!selectedPet) {
          setSelectedPet(data)
        }
        setSuccessMessage('Pet created successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      console.log('Background sync failed')
    }

    setCreateForm({
      name: '', species: '', breed: '', gender: 0, birthDate: '',
      color: '', currentWeight: '', healthStatus: '', avatarUrl: '', isNeutered: false
    })
    setShowCreateModal(false)
    setIsSaving(false)
  }

  const handleEditPet = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let avatarUrl = editForm.avatarUrl

      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        const res = await fetch(avatarUrl)
        const blob = await res.blob()
        const formData = new FormData()
        formData.append('file', blob, 'avatar.jpg')
        const uploadRes = await fetch(`${API_BASE_URL}/api/uploads/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        })
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          avatarUrl = data.url || data.imageUrl || data
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/Pet/${selectedPet.petId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          avatarUrl,
          currentWeight: parseFloat(editForm.currentWeight) || 0
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedPet(data)
        setPets(prev => prev.map(p => p.petId === selectedPet.petId ? data : p))
        setSuccessMessage('Pet updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      console.log('Background sync failed')
    }
    setShowEditModal(false)
    setIsSaving(false)
  }

  const handleDeletePet = async () => {
    const petToDelete = selectedPet
    setShowDeleteModal(false)

    // Update UI immediately
    const remainingPets = pets.filter(p => p.petId !== petToDelete.petId)
    setPets(remainingPets)
    setSelectedPet(remainingPets.length > 0 ? remainingPets[0] : null)
        setSuccessMessage('Pet deleted successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)

    try {
      await fetch(`${API_BASE_URL}/api/Pet/${petToDelete.petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (err) {
      console.log('Background sync failed')
    }
  }

  const openEditModal = () => {
    setEditForm({
      name: selectedPet?.name || '',
      species: selectedPet?.species || '',
      breed: selectedPet?.breed || '',
      gender: selectedPet?.gender ?? 0,
      birthDate: selectedPet?.birthDate?.split('T')[0] || '',
      color: selectedPet?.color || '',
      currentWeight: selectedPet?.currentWeight?.toString() || '',
      healthStatus: selectedPet?.healthStatus || '',
      avatarUrl: selectedPet?.avatarUrl || '',
      isNeutered: selectedPet?.isNeutered || false
    })
    setShowEditModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-'
    const birth = new Date(birthDate)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()
    if (years > 0) return `${years} year${years > 1 ? 's' : ''}`
    else if (months > 0) return `${months} month${months > 1 ? 's' : ''}`
    return 'Under 1 month'
  }

  const getInitials = (name) => {
    if (!name) return 'P'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleSelectPet = (pet) => {
    setSelectedPet(pet)
    setShowPetList(false)
  }

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
  const IconPencil = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
  const IconTrash = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
  const IconCamera = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
  const IconChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
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
  const IconUser = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
  const IconCalendar = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
  const IconScale = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" /><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
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
  const IconPlus = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )

  if (isLoading) {
    return (
      <div className="pet-profile-page">
        <SharedNav cartCount={0} />
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="pet-profile-page">
      <SharedNav cartCount={0} />

      {successMessage && (
        <div className="success-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {successMessage}
          <button onClick={() => setSuccessMessage('')} className="close-success">
            <IconX />
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="pp-hero">
        <div className="pp-hero__inner">
          <div className="pp-hero__left">
            <div className="pp-hero__eyebrow">
              <span className="pp-hero__eyebrow-dot" />
              Pet Profile
            </div>
            <h1 className="pp-hero__title">
              {selectedPet ? selectedPet.name : 'Pet Profiles'}
            </h1>
            {selectedPet ? (
              <div className="pp-hero__meta">
                <span>{selectedPet.species}</span>
                <span className="pp-hero__meta-sep">·</span>
                <span>{selectedPet.breed || '—'}</span>
              </div>
            ) : (
              <div className="pp-hero__meta">
                Manage your pet information
              </div>
            )}
          </div>

          <div className="pp-hero__avatar-wrap">
            <div className="pp-hero__avatar-white-ring">
              <div className="pp-hero__avatar-ring">
                <div className="pp-hero__avatar-inner">
                  {selectedPet?.avatarUrl ? (
                    <img src={selectedPet.avatarUrl} alt="" className="pp-hero__avatar" />
                  ) : (
                    <div className="pp-hero__avatar-placeholder"><IconPaw /></div>
                  )}
                </div>
              </div>
            </div>
            {selectedPet && (
              <div className="pp-hero__verified"><IconCheck /></div>
            )}
          </div>
        </div>
      </section>

      {/* Add pet CTA bar */}
      <div className="pp-hero__add-cta">
        <span className="pp-hero__add-cta-text">
          {pets.length === 0
            ? 'No pets yet'
            : `${pets.length} pet${pets.length > 1 ? 's' : ''}`}
        </span>
        <button className="pp-hero__add-btn" onClick={() => setShowCreateModal(true)}>
          <IconPlus /> Add Pet
        </button>
      </div>

      {/* Pet Selector */}
      {pets.length > 0 && (
        <div className="pp-selector-wrap">
          <span className="pp-selector-label">Pets</span>
          <div className="pp-selector">
            <button className="pp-selector-btn" onClick={() => setShowPetList(!showPetList)}>
              {selectedPet?.avatarUrl ? (
                <img src={selectedPet.avatarUrl} alt="" className="pp-selector-avatar" />
              ) : (
                <div className="pp-selector-avatar-placeholder">{getInitials(selectedPet?.name)}</div>
              )}
              <div className="pp-selector-info">
                <span className="pp-selector-name">{selectedPet?.name || 'Select Pet'}</span>
                <span className="pp-selector-species">{selectedPet?.species || ''}</span>
              </div>
              <span className="pp-selector-arrow"><IconChevronDown /></span>
            </button>
            {showPetList && (
              <div className="pp-pet-list">
                {pets.map((pet) => (
                  <div key={pet.petId} className={`pp-pet-list-item ${selectedPet?.petId === pet.petId ? 'active' : ''}`}
                    onClick={() => handleSelectPet(pet)}>
                    {pet.avatarUrl ? (
                      <img src={pet.avatarUrl} alt="" className="pp-pet-list-avatar" />
                    ) : (
                      <div className="pp-pet-list-avatar-placeholder">{getInitials(pet.name)}</div>
                    )}
                    <div className="pp-pet-list-info">
                      <span className="pp-pet-list-name">{pet.name}</span>
                      <span className="pp-pet-list-species">{pet.species}</span>
                    </div>
                    {selectedPet?.petId === pet.petId && <span className="pp-pet-list-check"><IconCheck /></span>}
                  </div>
                ))}
                <button className="pp-add-pet-btn" onClick={() => { setShowPetList(false); setShowCreateModal(true); }}>
                  <IconPlus /> Add New Pet
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pet Card */}
      {selectedPet ? (
        <>
          <section className="pp-card-section">
            <div className="pp-card">
              <div className="pp-card__image-wrap">
                {selectedPet.avatarUrl ? (
                  <img src={selectedPet.avatarUrl} alt={selectedPet.name} className="pp-card__image" />
                ) : (
                  <div className="pp-card__placeholder">
                    <span className="pp-card__placeholder-icon"><IconPaw /></span>
                    <span className="pp-card__placeholder-initials">{getInitials(selectedPet.name)}</span>
                  </div>
                )}
                <div className="pp-card__verified">
                  <IconCheck />
                </div>
              </div>
              <div className="pp-card__body">
                <div className="pp-card__head">
                  <div>
                    <h2 className="pp-card__title">{selectedPet.name}</h2>
                    <p className="pp-card__species">{selectedPet.species}{selectedPet.breed ? ` · ${selectedPet.breed}` : ''}</p>
                  </div>
                  <button className="pp-section-edit-btn" onClick={openEditModal}>
                    <IconPencil /> Edit
                  </button>
                </div>

                <div className="pp-info-grid">
                  <div className="pp-info-cell">
                    <span className="pp-info-label">Age</span>
                    <span className="pp-info-value">{calculateAge(selectedPet.birthDate)}</span>
                  </div>
                  <div className="pp-info-cell">
                    <span className="pp-info-label">Gender</span>
                    <span className="pp-info-value">
                      {selectedPet.gender === 0 ? 'Male' : selectedPet.gender === 1 ? 'Female' : '-'}
                    </span>
                  </div>
                  <div className="pp-info-cell">
                    <span className="pp-info-label">Weight</span>
                    <span className="pp-info-value">{selectedPet.currentWeight ? `${selectedPet.currentWeight} kg` : '-'}</span>
                  </div>
                  <div className="pp-info-cell">
                    <span className="pp-info-label">Color</span>
                    <span className="pp-info-value">{selectedPet.color || '-'}</span>
                  </div>
                  <div className="pp-info-cell">
                    <span className="pp-info-label">Neutered</span>
                    <span className="pp-info-value">{selectedPet.isNeutered ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="pp-info-cell">
                    <span className="pp-info-label">Health</span>
                    <span className="pp-info-value">{selectedPet.healthStatus || '-'}</span>
                  </div>
                </div>

                <div className="pp-card__actions">
                  <button className="pp-btn-primary" onClick={() => {}}>View Details</button>
                  <button className="pp-btn-danger" onClick={() => setShowDeleteModal(true)}>
                    <IconTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <div className="pp-quick-actions">
            <button className="pp-quick-action">
              <div className="pp-quick-action__icon"><IconSyringe /></div>
              <span className="pp-quick-action__label">Vaccines</span>
            </button>
            <button className="pp-quick-action">
              <div className="pp-quick-action__icon"><IconStethoscope /></div>
              <span className="pp-quick-action__label">Vet Visits</span>
            </button>
            <button className="pp-quick-action">
              <div className="pp-quick-action__icon"><IconApple /></div>
              <span className="pp-quick-action__label">Nutrition</span>
            </button>
            <button className="pp-quick-action">
              <div className="pp-quick-action__icon"><IconClipboard /></div>
              <span className="pp-quick-action__label">Health Logs</span>
            </button>
          </div>
        </>
      ) : (
        <section className="pp-empty-section">
          <div className="pp-empty">
            <div className="pp-empty__icon"><IconPaw /></div>
            <h2 className="pp-empty__title">No pets yet</h2>
            <p className="pp-empty__sub">Add your first pet to start managing their health and care!</p>
            <button className="pp-btn-primary" onClick={() => setShowCreateModal(true)}>
              <IconPlus /> Add Pet
            </button>
          </div>
        </section>
      )}

      <div className="bottom-nav">
        <Link to="/pet-profile" className="nav-tab active">Pet Profile</Link>
        <Link to="/health-record" className="nav-tab">Pet Health Record</Link>
        <Link to="/grooming" className="nav-tab">Grooming Booking</Link>
      </div>

      {/* Create/Edit Pet Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
          <div className="pet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <IconPaw />
                <h2>{showEditModal ? 'Update Pet' : 'Add New Pet'}</h2>
              </div>
              <button className="close-modal" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
                <IconX />
              </button>
            </div>

            <form onSubmit={showEditModal ? handleEditPet : handleCreatePet} className="pet-form">
              <div className="avatar-upload-section">
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
                <div className="avatar-preview" onClick={() => fileInputRef.current?.click()}>
                  {(showEditModal ? editForm.avatarUrl : createForm.avatarUrl) ? (
                    <img src={showEditModal ? editForm.avatarUrl : createForm.avatarUrl} alt="" />
                  ) : (
                    <div className="avatar-placeholder">
                      <IconCamera />
                      <span>Upload</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pet Name *</label>
                  <input type="text" name="name" value={showEditModal ? editForm.name : createForm.name}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}
                    placeholder="e.g. Buddy" required />
                </div>
                <div className="form-group">
                  <label>Species *</label>
                  <select name="species" value={showEditModal ? editForm.species : createForm.species}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)} required>
                    <option value="">Select species</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Fish">Fish</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Breed</label>
                  <input type="text" name="breed" value={showEditModal ? editForm.breed : createForm.breed}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}
                    placeholder="e.g. Golden Retriever" />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={showEditModal ? editForm.gender : createForm.gender}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}>
                    <option value={0}>Male</option>
                    <option value={1}>Female</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Birth Date</label>
                  <input type="date" name="birthDate" value={showEditModal ? editForm.birthDate : createForm.birthDate}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)} />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input type="text" name="color" value={showEditModal ? editForm.color : createForm.color}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}
                    placeholder="e.g. Golden" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" name="currentWeight" value={showEditModal ? editForm.currentWeight : createForm.currentWeight}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}
                    placeholder="e.g. 10" step="0.1" />
                </div>
                <div className="form-group">
                  <label>Health Status</label>
                  <input type="text" name="healthStatus" value={showEditModal ? editForm.healthStatus : createForm.healthStatus}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}
                    placeholder="e.g. Healthy" />
                </div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" name="isNeutered" id="isNeutered"
                  checked={showEditModal ? editForm.isNeutered : createForm.isNeutered}
                  onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)} />
                <label htmlFor="isNeutered">Neutered / Spayed</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSaving}>
                  {isSaving ? 'Saving...' : (showEditModal ? 'Update' : 'Add Pet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-wrap">
              <IconTrash />
            </div>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete <strong>"{selectedPet?.name}"</strong>?</p>
            <p className="delete-warning">This action cannot be undone.</p>
            <div className="delete-actions">
              <button className="cancel-delete-btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleDeletePet}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {cropModal.open && (
        <ImageCropper
          preview={cropModal.preview}
          title="Crop Avatar"
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </main>
  )
}

export default PetProfile
