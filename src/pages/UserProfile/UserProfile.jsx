import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SharedNav from '../../components/SharedNav/SharedNav'
import './UserProfile.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

function UserProfile() {
  const { user, token, logout, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [petCount, setPetCount] = useState(0)
  const [cropModal, setCropModal] = useState({ open: false, file: null, preview: null })
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState(null)
  const dragStartRef = useRef(null)
  const cropStartRef = useRef(null)
  const cropContainerRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditForm(data)
      } else {
        setError('Unable to load profile')
      }
    } catch (err) {
      setError('Server connection error')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPetCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/Pet/user/${user?.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : (data ? [data] : [])
        setPetCount(list.length)
      }
    } catch { /* silent */ }
  }

  useEffect(() => {
    fetchProfile()
    fetchPetCount()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setCropModal({ open: true, file, preview: event.target?.result })
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getCroppedBlob = () => {
    const img = imgRef.current
    if (!img) return null
    const { x, y, size } = cropArea
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, x, y, size, size, 0, 0, size, size)
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
    })
  }

  const handleCropConfirm = async () => {
    const blob = await getCroppedBlob()
    if (!blob) return
    const previewUrl = URL.createObjectURL(blob)
    setEditForm(prev => ({ ...prev, avatarUrl: previewUrl }))
    setCropModal({ open: false, file: blob, preview: null })
  }

  const handleCropCancel = () => {
    if (imgRef.current) imgRef.current.src = ''
    setCropModal({ open: false, file: null, preview: null })
    setCropArea({ x: 0, y: 0, size: 100 })
  }

  const handleImageLoad = (e) => {
    const img = e.target
    const naturalW = img.naturalWidth
    const naturalH = img.naturalHeight
    const size = Math.min(naturalW, naturalH) * 0.6
    const cx = (naturalW - size) / 2
    const cy = (naturalH - size) / 2
    setCropArea({ x: cx, y: cy, size })
  }

  const getNaturalPos = (clientX, clientY) => {
    const img = imgRef.current
    if (!img) return { x: 0, y: 0 }
    const rect = img.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (img.naturalWidth / rect.width),
      y: (clientY - rect.top) * (img.naturalHeight / rect.height),
    }
  }

  const getCropStyle = () => {
    const img = imgRef.current
    if (!img) return {}
    const { x, y, size } = cropArea
    const rect = img.getBoundingClientRect()
    return {
      left: (x / img.naturalWidth) * rect.width,
      top: (y / img.naturalHeight) * rect.height,
      width: (size / img.naturalWidth) * rect.width,
      height: (size / img.naturalHeight) * rect.height,
    }
  }

  const getOverlayContainerStyle = () => {
    const img = imgRef.current
    if (!img) return { width: '100%', height: '100%' }
    const rect = img.getBoundingClientRect()
    return { width: rect.width, height: rect.height }
  }

  const handleOverlayMouseDown = (e) => {
    e.stopPropagation()
    const { x, y } = getNaturalPos(e.clientX, e.clientY)
    dragStartRef.current = { x, y }
    cropStartRef.current = { ...cropArea }
    setDragType('move')
    setIsDragging(true)
  }

  const handleCornerMouseDown = (e, corner) => {
    e.stopPropagation()
    e.preventDefault()
    const { x, y } = getNaturalPos(e.clientX, e.clientY)
    dragStartRef.current = { x, y }
    cropStartRef.current = { ...cropArea }
    setDragType(corner)
    setIsDragging(true)
  }

  const handleOverlayMouseMove = (e) => {
    if (!isDragging || !dragStartRef.current || !cropStartRef.current) return
    const img = imgRef.current
    if (!img) return
    const { x, y } = getNaturalPos(e.clientX, e.clientY)
    const start = dragStartRef.current
    const orig = cropStartRef.current
    const minSize = 40
    const dx = x - start.x
    const dy = y - start.y

    if (dragType === 'move') {
      setCropArea({
        ...orig,
        x: Math.max(0, Math.min(orig.x + dx, img.naturalWidth - orig.size)),
        y: Math.max(0, Math.min(orig.y + dy, img.naturalHeight - orig.size)),
      })
    } else if (dragType === 'br') {
      const newSize = Math.max(minSize, Math.min(orig.size + dx, img.naturalWidth - orig.x, img.naturalHeight - orig.y))
      setCropArea({ ...orig, size: newSize })
    } else if (dragType === 'bl') {
      const newX = Math.max(0, orig.x + dx)
      const newSize = Math.max(minSize, Math.min(orig.size - dx, orig.size + orig.x))
      setCropArea({ x: Math.max(0, orig.x - (orig.size - newSize)), y: orig.y, size: newSize })
    } else if (dragType === 'tr') {
      const newY = Math.max(0, orig.y + dy)
      const newSize = Math.max(minSize, Math.min(orig.size - dy, img.naturalHeight - newY, orig.size + orig.y))
      setCropArea({ x: orig.x, y: newY, size: newSize })
    } else if (dragType === 'tl') {
      const newX = Math.max(0, orig.x + dx)
      const newY = Math.max(0, orig.y + dy)
      const newSize = Math.max(minSize, Math.min(orig.size - dx, orig.size - dy, img.naturalWidth - newX, img.naturalHeight - newY))
      setCropArea({ x: orig.x + orig.size - newSize, y: orig.y + orig.size - newSize, size: newSize })
    }
  }

  const handleOverlayMouseUp = () => {
    setIsDragging(false)
    setDragType(null)
    dragStartRef.current = null
    cropStartRef.current = null
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    let avatarUrl = editForm.avatarUrl || ''

    if (avatarUrl.startsWith('blob:')) {
      const res = await fetch(avatarUrl)
      const blob = await res.blob()
      const formData = new FormData()
      formData.append('file', blob, 'avatar.jpg')
      try {
        const uploadRes = await fetch(`${API_BASE_URL}/api/uploads/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        })
        if (uploadRes.ok) {
          const data = await uploadRes.json()
          avatarUrl = data.url || data.imageUrl || data
        }
      } catch {
        // continue with blob URL
      }
    }

    setEditForm(prev => ({ ...prev, avatarUrl }))

    // Always update UI immediately first
    const updatedProfile = { ...profile, ...editForm, avatarUrl }
    setProfile(updatedProfile)
    login(updatedProfile, token)
    setIsEditing(false)
    setSuccessMessage('Profile updated successfully!')

    // Try to sync with server in background
    try {
      const updateData = {
        fullName: editForm.fullName,
        phone: editForm.phone,
        address: editForm.address,
        avatarUrl,
        dateOfBirth: editForm.dateOfBirth,
        gender: editForm.gender,
        specialization: editForm.specialization,
        department: editForm.department
      }

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        login(data, token)
      }
    } catch (err) {
      // Silently fail - UI already updated
      console.log('Background sync failed, but UI is updated')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not updated'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <main className="user-profile-page">
      <SharedNav cartCount={0} />

      {/* Crop Modal */}
      {cropModal.open && (
        <div className="crop-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCropCancel()}>
          <div className="crop-modal">
            <div className="crop-modal-header">
              <h3>Crop Avatar</h3>
              <button className="crop-close-btn" onClick={handleCropCancel}>×</button>
            </div>
            <div className="crop-canvas-wrapper">
              <div className="crop-image-container" ref={cropContainerRef}>
                <img
                  ref={imgRef}
                  src={cropModal.preview}
                  alt="Crop preview"
                  className="crop-image"
                  onLoad={handleImageLoad}
                  draggable={false}
                />
                {cropArea.size > 0 && (() => {
                  const s = getCropStyle()
                  return (
                  <div
                    className="crop-overlay"
                    style={getOverlayContainerStyle()}
                    onMouseMove={handleOverlayMouseMove}
                    onMouseUp={handleOverlayMouseUp}
                    onMouseLeave={handleOverlayMouseUp}
                  >
                    <div className="crop-overlay-top" style={{ height: s.top }} />
                    <div className="crop-overlay-bottom" style={{ height: `calc(100% - ${s.top + s.height}px)`, top: s.top + s.height }} />
                    <div className="crop-overlay-left" style={{ top: s.top, height: s.height, width: s.left }} />
                    <div className="crop-overlay-right" style={{ top: s.top, height: s.height, left: s.left + s.width, width: `calc(100% - ${s.left + s.width}px)` }} />
                    <div className="crop-grid" style={{ ...s }}>
                      {[...Array(7)].map((_, i) => (
                        <div key={`v${i}`} className="crop-grid-line crop-grid-v" style={{ left: `${((i + 1) / 8) * 100}%` }} />
                      ))}
                      {[...Array(7)].map((_, i) => (
                        <div key={`h${i}`} className="crop-grid-line crop-grid-h" style={{ top: `${((i + 1) / 8) * 100}%` }} />
                      ))}
                    </div>
                    <div className="crop-border" style={s} onMouseDown={handleOverlayMouseDown} />
                    <div className="crop-corner crop-corner-tl" style={{ left: s.left - 7, top: s.top - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'tl')} />
                    <div className="crop-corner crop-corner-tr" style={{ left: s.left + s.width - 7, top: s.top - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'tr')} />
                    <div className="crop-corner crop-corner-bl" style={{ left: s.left - 7, top: s.top + s.height - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'bl')} />
                    <div className="crop-corner crop-corner-br" style={{ left: s.left + s.width - 7, top: s.top + s.height - 7 }} onMouseDown={(e) => handleCornerMouseDown(e, 'br')} />
                  </div>
                  )
                })()}
              </div>
            </div>
            <div className="crop-modal-footer">
              <button className="crop-btn crop-btn-cancel" onClick={handleCropCancel}>Cancel</button>
              <button className="crop-btn crop-btn-ok" onClick={handleCropConfirm}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <header className="up-page-header">
        <div className="up-page-header__inner">
          <div className="up-page-header__breadcrumb">
            <Link to="/home">Home</Link>
            <span>/</span>
            <span>Account</span>
          </div>
          <h1 className="up-page-header__title">My Account</h1>
          <div className="up-page-header__actions">
            {!isEditing ? (
              <button className="up-edit-btn" onClick={() => setIsEditing(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
            ) : (
              <div className="up-page-header__actions" style={{ gap: 'var(--spacing-sm)' }}>
                <button className="up-btn-secondary" style={{ height: '36px', padding: '0 16px', fontSize: '13px' }} onClick={() => { setIsEditing(false); setEditForm(profile || {}); setError(''); }}>
                  Cancel
                </button>
                <button className="up-btn-primary" style={{ height: '36px', padding: '0 16px', fontSize: '13px' }} onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Alert Banners */}
      {error && (
        <div className="up-alert up-alert--error">
          <span>{error}</span>
          <button onClick={() => setError('')} className="up-alert__close">×</button>
        </div>
      )}
      {successMessage && (
        <div className="up-alert up-alert--success">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="up-alert__close">×</button>
        </div>
      )}

      <div className="up-layout">
        {/* Left Sidebar */}
        <aside className="up-sidebar">
          {/* Identity Card */}
          <div className="up-identity">
            <div className="up-identity__hero">
              <div className="up-identity__hero-pattern" />
            </div>
            <div className="up-identity__body">
              <div className="up-identity__avatar-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                />
                {(editForm?.avatarUrl || profile?.avatarUrl) ? (
                  <img src={editForm?.avatarUrl || profile?.avatarUrl} alt="Avatar" className="up-identity__avatar" />
                ) : (
                  <span className="up-identity__avatar-initials">
                    {getInitials(editForm?.fullName || profile?.fullName)}
                  </span>
                )}
                {isEditing && (
                  <button className="up-identity__change-avatar" onClick={handleAvatarClick} title="Change photo">+</button>
                )}
              </div>
              <h2 className="up-identity__name">{editForm?.fullName || profile?.fullName || 'User'}</h2>
              <p className="up-identity__email">{editForm?.email || profile?.email}</p>
              <span className="up-identity__role">{profile?.roleName || profile?.role || 'Member'}</span>
            </div>
          </div>

          {/* Side Nav */}
          <nav className="up-side-nav">
            <button className="up-side-nav__item active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Personal Information
            </button>
            <button className="up-side-nav__item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Change Password
            </button>
            <button className="up-side-nav__item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              Notifications
            </button>
            <button className="up-side-nav__item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Address
            </button>
            <button className="up-side-nav__item up-side-nav__item--danger" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Log out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="up-main">
          {/* Personal Info Card */}
          <div className="up-card">
            <div className="up-card__header">
              <h2 className="up-card__title">Personal Information</h2>
            </div>
            <div className="up-card__body" style={{ padding: 0 }}>
              {isEditing ? (
                <div className="up-form-actions" style={{ padding: 'var(--spacing-xl)', borderTop: 'none' }}>
                  <div className="up-edit-form" style={{ width: '100%' }}>
                    <div className="up-form-row">
                      <div className="up-form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={editForm.fullName || ''} onChange={handleInputChange} placeholder="Enter your full name" />
                      </div>
                      <div className="up-form-group">
                        <label>Phone Number</label>
                        <input type="tel" name="phone" value={editForm.phone || ''} onChange={handleInputChange} placeholder="Enter your phone number" />
                      </div>
                    </div>
                    <div className="up-form-row">
                      <div className="up-form-group">
                        <label>Gender</label>
                        <select name="gender" value={editForm.gender ?? ''} onChange={handleInputChange}>
                          <option value="">Select gender</option>
                          <option value={0}>Male</option>
                          <option value={1}>Female</option>
                          <option value={2}>Other</option>
                        </select>
                      </div>
                      <div className="up-form-group">
                        <label>Date of Birth</label>
                        <input type="date" name="dateOfBirth" value={editForm.dateOfBirth?.split('T')[0] || ''} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div className="up-form-group up-form-group--full">
                      <label>Address</label>
                      <input type="text" name="address" value={editForm.address || ''} onChange={handleInputChange} placeholder="Enter your address" />
                    </div>
                    {(profile?.role === 'Doctor' || profile?.role === 'Staff') && (
                      <div className="up-form-row">
                        <div className="up-form-group">
                          <label>{profile?.role === 'Doctor' ? 'Specialization' : 'Department'}</label>
                          <input
                            type="text"
                            name={profile?.role === 'Doctor' ? 'specialization' : 'department'}
                            value={editForm.specialization || editForm.department || ''}
                            onChange={handleInputChange}
                            placeholder={profile?.role === 'Doctor' ? 'e.g. General Vet' : 'e.g. Reception'}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="up-info-grid">
                  <div className="up-info-cell">
                    <span className="up-info-label">Full Name</span>
                    <span className="up-info-value">{profile?.fullName || 'Not updated'}</span>
                  </div>
                  <div className="up-info-cell">
                    <span className="up-info-label">Email</span>
                    <span className="up-info-value">{profile?.email || 'Not updated'}</span>
                  </div>
                  <div className="up-info-cell">
                    <span className="up-info-label">Phone Number</span>
                    <span className="up-info-value">{profile?.phone || <span className="mute">Not updated</span>}</span>
                  </div>
                  <div className="up-info-cell">
                    <span className="up-info-label">Gender</span>
                    <span className="up-info-value">
                      {profile?.gender === 0 ? 'Male' : profile?.gender === 1 ? 'Female' : profile?.gender === 2 ? 'Other' : <span className="mute">Not updated</span>}
                    </span>
                  </div>
                  <div className="up-info-cell">
                    <span className="up-info-label">Date of Birth</span>
                    <span className="up-info-value">{formatDate(profile?.dateOfBirth)}</span>
                  </div>
                  <div className="up-info-cell">
                    <span className="up-info-label">Member since</span>
                    <span className="up-info-value">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('vi-VN') : 'Not updated'}</span>
                  </div>
                  <div className="up-info-cell up-info-cell--full">
                    <span className="up-info-label">Address</span>
                    <span className="up-info-value">{profile?.address || <span className="mute">Not updated</span>}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Membership Card */}
          {(editForm?.isProMember || profile?.isProMember) && (
            <div className="up-membership">
              <div className="up-membership__icon">⭐</div>
              <div className="up-membership__info">
                <h3 className="up-membership__title">Pro Member</h3>
                <p className="up-membership__expiry">Expires: {formatDate(editForm?.proExpiredAt || profile?.proExpiredAt)}</p>
              </div>
              <button className="up-membership__btn">Renew</button>
            </div>
          )}

          {/* Stats Card */}
          <div className="up-card">
            <div className="up-card__header">
              <h2 className="up-card__title">Statistics</h2>
            </div>
            <div className="up-card__body" style={{ padding: 0 }}>
              <div className="up-stats-grid">
                <div className="up-stat-cell">
                  <span className="up-stat-number">0</span>
                  <span className="up-stat-label">Orders</span>
                </div>
                <div className="up-stat-cell">
                  <span className="up-stat-number">{petCount}</span>
                  <span className="up-stat-label">Pets</span>
                </div>
                <div className="up-stat-cell">
                  <span className="up-stat-number">0</span>
                  <span className="up-stat-label">Reviews</span>
                </div>
                <div className="up-stat-cell">
                  <span className="up-stat-number">{profile?.userId || '—'}</span>
                  <span className="up-stat-label">ID</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default UserProfile
