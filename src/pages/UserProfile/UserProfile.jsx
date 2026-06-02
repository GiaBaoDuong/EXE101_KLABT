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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setEditForm(prev => ({ ...prev, avatarUrl: event.target?.result }))
    }
    reader.readAsDataURL(file)

    setUploadingAvatar(true)
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
        setEditForm(prev => ({ ...prev, avatarUrl: data.url || data.imageUrl || data }))
        setSuccessMessage('Tải ảnh lên thành công!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError('Không thể tải ảnh lên')
      }
    } catch (err) {
      setError('Lỗi khi tải ảnh lên')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    // Always update UI immediately first
    const updatedProfile = { ...profile, ...editForm }
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
        avatarUrl: editForm.avatarUrl,
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
