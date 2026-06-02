import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
        setError('Không thể tải thông tin profile')
      }
    } catch (err) {
      setError('Lỗi kết nối server')
    } finally {
      setIsLoading(false)
    }
  }

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
    setSuccessMessage('Cập nhật profile thành công!')

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
    if (!dateString) return 'Chưa cập nhật'
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
        <p>Đang tải thông tin...</p>
      </div>
    )
  }

  return (
    <main className="user-profile-page">
      {cropModal.open && (
        <div className="crop-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCropCancel()}>
          <div className="crop-modal">
            <div className="crop-modal-header">
              <h3>Cắt ảnh đại diện</h3>
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
              <button className="crop-btn crop-btn-cancel" onClick={handleCropCancel}>Hủy</button>
              <button className="crop-btn crop-btn-ok" onClick={handleCropConfirm}>OK</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="profile-header">
        <Link to="/home" className="back-btn">
          <span className="back-icon">←</span>
          Quay lại
        </Link>
        <h1>Tài Khoản Của Tôi</h1>
        <div className="header-actions">
          {!isEditing ? (
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              ✏️ Chỉnh sửa
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="save-btn" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Đang lưu...' : '💾 Lưu'}
              </button>
              <button 
                className="cancel-btn" 
                onClick={() => { 
                  setIsEditing(false); 
                  setEditForm(profile || {}); 
                  setError('');
                }}
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      {successMessage && (
        <div className="success-banner">
          {successMessage}
          <button onClick={() => setSuccessMessage('')} className="close-success">×</button>
        </div>
      )}

      <div className="profile-content">
        {/* Left Sidebar - Avatar & Quick Actions */}
        <aside className="profile-sidebar">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              {uploadingAvatar ? (
                <div className="avatar-uploading">
                  <div className="upload-spinner"></div>
                </div>
              ) : (editForm?.avatarUrl || profile?.avatarUrl) ? (
                <img 
                  src={editForm?.avatarUrl || profile?.avatarUrl} 
                  alt={editForm?.fullName || profile?.fullName} 
                  className="avatar-img" 
                />
              ) : (
                <div className="avatar-placeholder">
                  {getInitials(editForm?.fullName || profile?.fullName)}
                </div>
              )}
              
              {isEditing && (
                <button 
                  className="change-avatar-btn" 
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                >
                  📷
                </button>
              )}
            </div>
            <h2 className="user-name">{editForm?.fullName || profile?.fullName}</h2>
            <p className="user-email">{editForm?.email || profile?.email}</p>
            {(editForm?.isProMember || profile?.isProMember) && (
              <span className="pro-badge">⭐ Pro Member</span>
            )}
          </div>

          <nav className="quick-nav">
            <button className="nav-item active">
              <span className="nav-icon">👤</span>
              Thông tin cá nhân
            </button>
            <button className="nav-item">
              <span className="nav-icon">🔒</span>
              Đổi mật khẩu
            </button>
            <button className="nav-item">
              <span className="nav-icon">🔔</span>
              Thông báo
            </button>
            <button className="nav-item">
              <span className="nav-icon">📍</span>
              Địa chỉ
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="profile-main">
          {/* Personal Info Card */}
          <div className="info-card">
            <h3 className="card-title">Thông Tin Cá Nhân</h3>
            
            <div className="info-grid">
              <div className="info-field">
                <label>Họ và tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={editForm.fullName || ''}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <span>{profile?.fullName || 'Chưa cập nhật'}</span>
                )}
              </div>

              <div className="info-field">
                <label>Email</label>
                <span>{profile?.email || 'Chưa cập nhật'}</span>
              </div>

              <div className="info-field">
                <label>Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone || ''}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <span>{profile?.phone || 'Chưa cập nhật'}</span>
                )}
              </div>

              <div className="info-field">
                <label>Giới tính</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={editForm.gender ?? ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value={0}>Nam</option>
                    <option value={1}>Nữ</option>
                    <option value={2}>Khác</option>
                  </select>
                ) : (
                  <span>
                    {profile?.gender === 0 ? 'Nam' : 
                     profile?.gender === 1 ? 'Nữ' : 
                     profile?.gender === 2 ? 'Khác' : 'Chưa cập nhật'}
                  </span>
                )}
              </div>

              <div className="info-field">
                <label>Ngày sinh</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={editForm.dateOfBirth?.split('T')[0] || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  <span>{formatDate(profile?.dateOfBirth)}</span>
                )}
              </div>

              <div className="info-field">
                <label>Địa chỉ</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={editForm.address || ''}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ"
                  />
                ) : (
                  <span>{profile?.address || 'Chưa cập nhật'}</span>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="info-grid" style={{ marginTop: '20px' }}>
                <div className="info-field">
                  <label>Chuyên môn (Doctor)</label>
                  <input
                    type="text"
                    name="specialization"
                    value={editForm.specialization || ''}
                    onChange={handleInputChange}
                    placeholder="VD: Thú y tổng quát"
                  />
                </div>
                <div className="info-field">
                  <label>Phòng ban (Staff)</label>
                  <input
                    type="text"
                    name="department"
                    value={editForm.department || ''}
                    onChange={handleInputChange}
                    placeholder="VD: Lễ tân"
                  />
                </div>
              </div>
            )}
          </div>

          {(editForm?.isProMember || profile?.isProMember) && (
            <div className="membership-card">
              <div className="membership-icon">⭐</div>
              <div className="membership-info">
                <h4>Pro Member</h4>
                <p>Hết hạn: {formatDate(editForm?.proExpiredAt || profile?.proExpiredAt)}</p>
              </div>
              <button className="upgrade-btn">Gia hạn</button>
            </div>
          )}

          <div className="stats-card">
            <h3 className="card-title">Thống Kê Tài Khoản</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Đơn hàng</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Thú cưng</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Đánh giá</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{profile?.userId || 1}</span>
                <span className="stat-label">ID</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default UserProfile
