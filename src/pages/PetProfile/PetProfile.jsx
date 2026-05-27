import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AppHeader from '../../components/AppHeader/AppHeader'
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
      if (showPetList && !event.target.closest('.pet-selector') && !event.target.closest('.pet-list-dropdown')) {
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

  const handleAvatarChange = async (e, setter) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setter(prev => ({ ...prev, avatarUrl: event.target?.result }))
    }
    reader.readAsDataURL(file)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/api/uploads/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setter(prev => ({ ...prev, avatarUrl: data.url || data.imageUrl || data }))
      }
    } catch (err) {
      console.log('Upload failed')
    }
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

    const newPet = {
      ...createForm,
      currentWeight: parseFloat(createForm.currentWeight) || 0,
      userId: user.userId
    }
    
    setPets(prev => [...prev, newPet])
    setShowCreateModal(false)
    setSuccessMessage('Tạo pet thành công!')
    setTimeout(() => setSuccessMessage(''), 3000)

    try {
      const response = await fetch(`${API_BASE_URL}/api/Pet`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm,
          currentWeight: parseFloat(createForm.currentWeight) || 0
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPets(prev => prev.map(pet => pet.name === createForm.name ? data : pet))
        if (!selectedPet) {
          setSelectedPet(data)
        }
      }
    } catch (err) {
      console.log('Background sync failed')
    }

    setCreateForm({
      name: '', species: '', breed: '', gender: 0, birthDate: '',
      color: '', currentWeight: '', healthStatus: '', avatarUrl: '', isNeutered: false
    })
    setIsSaving(false)
  }

  const handleEditPet = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    const updatedPet = { ...selectedPet, ...editForm, currentWeight: parseFloat(editForm.currentWeight) || 0 }
    setSelectedPet(updatedPet)
    setPets(prev => prev.map(p => p.petId === selectedPet.petId ? updatedPet : p))
    setShowEditModal(false)
    setSuccessMessage('Cập nhật pet thành công!')
    setTimeout(() => setSuccessMessage(''), 3000)

    try {
      const response = await fetch(`${API_BASE_URL}/api/Pet/${selectedPet.petId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          currentWeight: parseFloat(editForm.currentWeight) || 0
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedPet(data)
        setPets(prev => prev.map(p => p.petId === selectedPet.petId ? data : p))
      }
    } catch (err) {
      console.log('Background sync failed')
    }
    setIsSaving(false)
  }

  const handleDeletePet = async () => {
    const petToDelete = selectedPet
    setShowDeleteModal(false)
    
    // Update UI immediately
    const remainingPets = pets.filter(p => p.petId !== petToDelete.petId)
    setPets(remainingPets)
    setSelectedPet(remainingPets.length > 0 ? remainingPets[0] : null)
    setSuccessMessage('Xóa pet thành công!')
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
    if (years > 0) return `${years} tuổi`
    else if (months > 0) return `${months} tháng`
    return 'Dưới 1 tháng'
  }

  const getInitials = (name) => {
    if (!name) return 'P'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleSelectPet = (pet) => {
    setSelectedPet(pet)
    setShowPetList(false)
  }

  if (isLoading) {
    return (
      <div className="pet-profile-page">
        <AppHeader leftText="About" nav={[
          { label: 'Pet Profile', to: '/pet-profile' },
          { label: 'Pet Health Record', to: '/health-record' },
          { label: 'Grooming Booking', to: '/grooming' },
        ]} promoText="20% discount on healthcare and medical services is about to expire!" cartCount={0} />
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="pet-profile-page">
      <AppHeader leftText="About" nav={[
        { label: 'Pet Profile', to: '/pet-profile' },
        { label: 'Pet Health Record', to: '/health-record' },
        { label: 'Grooming Booking', to: '/grooming' },
      ]} promoText="20% discount on healthcare and medical services is about to expire!" cartCount={0} />

      {successMessage && (
        <div className="success-banner">
          🎉 {successMessage}
          <button onClick={() => setSuccessMessage('')} className="close-success">×</button>
        </div>
      )}

      <section className="welcome-section">
        <h1>Pet Profile</h1>
        <p>Quản lý thông tin thú cưng của bạn</p>
      </section>

      {pets.length > 0 && (
        <section className="pet-selector-section">
          <div className="pet-selector">
            <button className="pet-selector-btn" onClick={() => setShowPetList(!showPetList)}>
              <div className="selected-pet-preview">
                {selectedPet?.avatarUrl ? (
                  <img src={selectedPet.avatarUrl} alt={selectedPet.name} className="selector-avatar" />
                ) : (
                  <div className="selector-avatar-placeholder">{getInitials(selectedPet?.name)}</div>
                )}
              </div>
              <div className="selector-info">
                <span className="selector-name">{selectedPet?.name || 'Chọn thú cưng'}</span>
                <span className="selector-species">{selectedPet?.species || ''}</span>
              </div>
              <span className="selector-arrow">{showPetList ? '▲' : '▼'}</span>
            </button>

            {showPetList && (
              <div className="pet-list-dropdown">
                {pets.map((pet) => (
                  <div key={pet.petId || pet.name} className={`pet-list-item ${selectedPet?.petId === pet.petId ? 'active' : ''}`}
                    onClick={() => handleSelectPet(pet)}>
                    <div className="pet-list-avatar">
                      {pet.avatarUrl ? <img src={pet.avatarUrl} alt={pet.name} /> :
                        <div className="pet-list-placeholder">{getInitials(pet.name)}</div>}
                    </div>
                    <div className="pet-list-info">
                      <span className="pet-list-name">{pet.name}</span>
                      <span className="pet-list-species">{pet.species}</span>
                    </div>
                    {selectedPet?.petId === pet.petId && <span className="pet-list-check">✓</span>}
                  </div>
                ))}
                <button className="add-new-pet-btn" onClick={() => { setShowPetList(false); setShowCreateModal(true); }}>
                  <span>+</span> Thêm thú cưng mới
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {selectedPet ? (
        <section className="id-card-section">
          <div className="section-header">
            <h2>Digital Pet ID Card</h2>
            <button className="add-pet-corner-btn" onClick={() => setShowCreateModal(true)}>
              <span>+</span>
            </button>
          </div>
          
          <div className="id-card">
            <div className="id-card-left">
              <div className="pet-basic-info">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{selectedPet.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Species</span>
                  <span className="info-value">{selectedPet.species}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Breed</span>
                  <span className="info-value">{selectedPet.breed || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Age</span>
                  <span className="info-value">{calculateAge(selectedPet.birthDate)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Gender</span>
                  <span className="info-value">
                    {selectedPet.gender === 0 ? 'Male ♂️' : selectedPet.gender === 1 ? 'Female ♀️' : '-'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Weight</span>
                  <span className="info-value">{selectedPet.currentWeight || '-'} kg</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Color</span>
                  <span className="info-value">{selectedPet.color || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Neutered</span>
                  <span className="info-value">{selectedPet.isNeutered ? 'Yes ✓' : 'No'}</span>
                </div>
              </div>
              
              <div className="id-card-buttons">
                <button className="action-btn more-info-btn" onClick={() => {}}>
                  📋 More Info
                </button>
                <button className="action-btn update-btn" onClick={openEditModal}>
                  ✏️ Update
                </button>
                <button className="action-btn delete-btn" onClick={() => setShowDeleteModal(true)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
            
            <div className="id-card-right">
              <div className="pet-image-wrapper">
                {selectedPet.avatarUrl ? (
                  <img src={selectedPet.avatarUrl} alt={selectedPet.name} className="pet-photo" />
                ) : (
                  <div className="pet-photo-placeholder">
                    <span className="placeholder-icon">🐾</span>
                    <span className="placeholder-text">{getInitials(selectedPet.name)}</span>
                  </div>
                )}
                <div className="verified-circle"><span>✓</span></div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="no-pet-section">
          <div className="no-pet-content">
            <div className="no-pet-icon">🐾</div>
            <h2>Chưa có thú cưng nào</h2>
            <p>Hãy thêm thú cưng đầu tiên của bạn để bắt đầu theo dõi sức khỏe và chăm sóc!</p>
            <button className="create-pet-btn" onClick={() => setShowCreateModal(true)}>
              <span>🐕</span> Tạo pet mới
            </button>
          </div>
        </section>
      )}

      {selectedPet && (
        <section className="quick-actions">
          <button className="action-icon"><span className="action-emoji">💉</span><span className="action-label">Vaccines</span></button>
          <button className="action-icon"><span className="action-emoji">🏥</span><span className="action-label">Vet Visits</span></button>
          <button className="action-icon"><span className="action-emoji">🥗</span><span className="action-label">Nutrition</span></button>
          <button className="action-icon"><span className="action-emoji">📋</span><span className="action-label">Logs</span></button>
        </section>
      )}

      <div className="bottom-nav">
        <Link to="/pet-profile" className="nav-tab active">Pet Profile</Link>
        <Link to="/health-record" className="nav-tab">Pet Health Record</Link>
        <Link to="/grooming" className="nav-tab">Grooming Booking</Link>
      </div>

      <footer className="footer">
        <Link to="/" className="logo-block">K-LABT</Link>
        <div className="footer-links">
          <div><h4>Shop</h4><a href="#">Walk</a><a href="#">Carry</a><a href="#">Play</a><a href="#">Shop All</a></div>
          <div><h4>Info</h4><a href="#">About</a><a href="#">Blog</a><a href="#">Reviews</a></div>
          <div><h4>Help</h4><a href="#">Contact</a><a href="#">FAQ</a><a href="#">Account</a></div>
          <div><h4>Join the Pack!</h4><a href="#">Facebook</a><a href="#">Instagram</a></div>
        </div>
      </footer>

      {/* Create/Edit Pet Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
          <div className="pet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{showEditModal ? '✏️' : '🐾'}</span>
                <h2>{showEditModal ? 'Cập nhật Pet' : 'Tạo Pet Mới'}</h2>
              </div>
              <button className="close-modal" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>×</button>
            </div>
            
            <form onSubmit={showEditModal ? handleEditPet : handleCreatePet} className="pet-form">
              <div className="avatar-upload-section">
                <input type="file" ref={fileInputRef} onChange={(e) => handleAvatarChange(e, showEditModal ? setEditForm : setCreateForm)} accept="image/*" style={{ display: 'none' }} />
                <div className="avatar-preview" onClick={() => fileInputRef.current?.click()}>
                  {(showEditModal ? editForm.avatarUrl : createForm.avatarUrl) ? (
                    <img src={showEditModal ? editForm.avatarUrl : createForm.avatarUrl} alt="Pet" />
                  ) : (
                    <div className="avatar-placeholder">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">Upload</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tên pet *</label>
                  <input type="text" name="name" value={showEditModal ? editForm.name : createForm.name}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}
                    placeholder="VD: Buddy" required />
                </div>
                <div className="form-group">
                  <label>Loài *</label>
                  <select name="species" value={showEditModal ? editForm.species : createForm.species}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)} required>
                    <option value="">Chọn loài</option>
                    <option value="Dog">🐕 Chó</option>
                    <option value="Cat">🐱 Mèo</option>
                    <option value="Bird">🐦 Chim</option>
                    <option value="Fish">🐟 Cá</option>
                    <option value="Rabbit">🐰 Thỏ</option>
                    <option value="Other">🐾 Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giống</label>
                  <input type="text" name="breed" value={showEditModal ? editForm.breed : createForm.breed}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}
                    placeholder="VD: Golden Retriever" />
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <select name="gender" value={showEditModal ? editForm.gender : createForm.gender}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}>
                    <option value={0}>♂️ Male</option>
                    <option value={1}>♀️ Female</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input type="date" name="birthDate" value={showEditModal ? editForm.birthDate : createForm.birthDate}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)} />
                </div>
                <div className="form-group">
                  <label>Màu sắc</label>
                  <input type="text" name="color" value={showEditModal ? editForm.color : createForm.color}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}
                    placeholder="VD: Golden" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cân nặng (kg)</label>
                  <input type="number" name="currentWeight" value={showEditModal ? editForm.currentWeight : createForm.currentWeight}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}
                    placeholder="VD: 10" step="0.1" />
                </div>
                <div className="form-group">
                  <label>Tình trạng sức khỏe</label>
                  <input type="text" name="healthStatus" value={showEditModal ? editForm.healthStatus : createForm.healthStatus}
                    onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)}
                    placeholder="VD: Khỏe mạnh" />
                </div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" name="isNeutered" id="isNeutered"
                  checked={showEditModal ? editForm.isNeutered : createForm.isNeutered}
                  onChange={(e) => handleFormChange(e, showEditModal ? setEditForm : setCreateForm)} />
                <label htmlFor="isNeutered">Đã triệt sản</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>
                  Hủy
                </button>
                <button type="submit" className="submit-btn" disabled={isSaving}>
                  {isSaving ? '⏳ Đang xử lý...' : showEditModal ? '💾 Cập nhật' : '✨ Tạo Pet'}
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
            <div className="delete-icon-wrapper">
              <span className="delete-icon">🗑️</span>
            </div>
            <h3>Xác nhận xóa pet</h3>
            <p>Bạn có chắc chắn muốn xóa pet <strong>"{selectedPet?.name}"</strong> không?</p>
            <p className="delete-warning">Hành động này không thể hoàn tác.</p>
            <div className="delete-actions">
              <button className="cancel-delete-btn" onClick={() => setShowDeleteModal(false)}>
                Hủy bỏ
              </button>
              <button className="confirm-delete-btn" onClick={handleDeletePet}>
                🗑️ Xóa pet
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default PetProfile
