import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminDashboard.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5166'

// Icons
const Icons = {
  Users: () => <span className="icon">👥</span>,
  Package: () => <span className="icon">📦</span>,
  Star: () => <span className="icon">⭐</span>,
  Settings: () => <span className="icon">⚙️</span>,
  Plus: () => <span>➕</span>,
  Edit: () => <span>✏️</span>,
  Delete: () => <span>🗑️</span>,
  Close: () => <span>×</span>,
  Check: () => <span>✓</span>,
}

function AdminDashboard() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState('accounts')
  
  // Helper to get token
  const getToken = () => token || sessionStorage.getItem('token')

  useEffect(() => {
    if (!token && !sessionStorage.getItem('token')) {
      navigate('/login')
    }
  }, [navigate, token])

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Accounts state
  const [accounts, setAccounts] = useState([])
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [accountForm, setAccountForm] = useState({
    email: '', fullName: '', phone: '', role: 'Customer', password: ''
  })

  // Products state
  const [products, setProducts] = useState([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', stockQuantity: '', category: 1, brand: '', weight: '', images: [], previewImages: [], isActive: true
  })
  const productFileRef = useRef(null)

  // Services state
  const [services, setServices] = useState([])
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', duration: '', price: '', images: [], previewImages: [], isActive: true
  })
  const serviceFileRef = useRef(null)

  // Pro Membership state
  const [proPrice, setProPrice] = useState('')

  useEffect(() => {
    if (activeTab === 'accounts') fetchAccounts()
    else if (activeTab === 'products') fetchProducts()
    else if (activeTab === 'services') fetchServices()
    else if (activeTab === 'promembership') fetchProMembership()
  }, [activeTab])

  // Show success message
  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // ============ ACCOUNTS ============
  const fetchAccounts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/accounts`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) setAccounts(await res.json())
    } catch (e) { console.log(e) }
    setIsLoading(false)
  }

  const openAccountModal = (account = null) => {
    if (account) {
      setSelectedAccount(account)
      setAccountForm({
        email: account.email || '',
        fullName: account.fullName || '',
        phone: account.phone || '',
        role: account.role || 'Customer',
        password: ''
      })
    } else {
      setSelectedAccount(null)
      setAccountForm({ email: '', fullName: '', phone: '', role: 'Customer', password: '' })
    }
    setShowAccountModal(true)
  }

  const handleSaveAccount = async (e) => {
    e.preventDefault()
    const isEdit = !!selectedAccount
    const url = isEdit ? `${API_BASE_URL}/api/admin/accounts/${selectedAccount.accountId || selectedAccount.userId}` : `${API_BASE_URL}/api/admin/accounts`
    const method = isEdit ? 'PUT' : 'POST'
    const body = isEdit ? { email: accountForm.email, fullName: accountForm.fullName, phone: accountForm.phone, role: accountForm.role }
                    : { ...accountForm }
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setShowAccountModal(false)
        showSuccess(isEdit ? 'Cập nhật tài khoản thành công!' : 'Tạo tài khoản thành công!')
        fetchAccounts()
      }
    } catch (e) { console.log(e) }
  }

  const handleDeleteAccount = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/accounts/${selectedAccount.accountId || selectedAccount.userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      setShowDeleteModal(false)
      showSuccess('Xóa tài khoản thành công!')
      fetchAccounts()
    } catch (e) { console.log(e) }
  }

  // ============ PRODUCTS ============
  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) setProducts(await res.json())
    } catch (e) { console.log(e) }
    setIsLoading(false)
  }

  const openProductModal = (product = null) => {
    if (product) {
      setSelectedProduct(product)
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stockQuantity: product.stockQuantity?.toString() || '',
        category: product.category || 1,
        brand: product.brand || '',
        weight: product.weight?.toString() || '',
        images: product.images || [],
        previewImages: product.images || [],
        isActive: product.isActive ?? true
      })
    } else {
      setSelectedProduct(null)
      setProductForm({ name: '', description: '', price: '', stockQuantity: '', category: 1, brand: '', weight: '', images: [], previewImages: [], isActive: true })
    }
    setShowProductModal(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    const isEdit = !!selectedProduct
    const url = isEdit ? `${API_BASE_URL}/api/admin/products/${selectedProduct.productId}` : `${API_BASE_URL}/api/admin/products`
    const method = isEdit ? 'PUT' : 'POST'
    const body = {
      productId: selectedProduct?.productId || 0,
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price) || 0,
      stockQuantity: parseInt(productForm.stockQuantity) || 0,
      category: parseInt(productForm.category) || 1,
      brand: productForm.brand,
      weight: parseFloat(productForm.weight) || 0,
      thumbnailUrl: productForm.images[0] || '',
      isActive: productForm.isActive,
      createdAt: selectedProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setShowProductModal(false)
        showSuccess(isEdit ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm thành công!')
        fetchProducts()
      }
    } catch (e) { console.log(e) }
  }

  const handleDeleteProduct = async (product) => {
    setSelectedProduct(product)
    try {
      await fetch(`${API_BASE_URL}/api/admin/products/${product.productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      showSuccess('Xóa sản phẩm thành công!')
      fetchProducts()
    } catch (e) { console.log(e) }
  }

  const handleProductImageChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Preview local images
    const newPreviews = files.map(file => {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = (event) => resolve(event.target?.result)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(newPreviews).then(previews => {
      setProductForm(prev => ({
        ...prev,
        previewImages: [...prev.previewImages, ...previews]
      }))
    })

    // Upload all images to server
    const uploadedUrls = []
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_BASE_URL}/api/uploads/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          uploadedUrls.push(data.url || data.imageUrl || data)
        }
      } catch (err) {
        console.log('Upload failed for one image')
      }
    }

    // After uploading, add to images array
    if (uploadedUrls.length > 0) {
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
    }
  }

  const removeProductImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      previewImages: prev.previewImages.filter((_, i) => i !== index)
    }))
  }

  // ============ SERVICES ============
  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/services`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      if (res.ok) {
        const data = await res.json()
        console.log('Services data:', data)
        if (data.length > 0) {
          console.log('Service keys:', Object.keys(data[0]))
          console.log('Duration value:', data[0].duration, data[0].durationMinutes, data[0].time)
        }
        setServices(data)
      }
    } catch (e) { console.log(e) }
    setIsLoading(false)
  }

  const handleServiceImageChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const newPreviews = files.map(file => {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = (event) => resolve(event.target?.result)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(newPreviews).then(previews => {
      setServiceForm(prev => ({
        ...prev,
        previewImages: [...prev.previewImages, ...previews]
      }))
    })

    const uploadedUrls = []
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_BASE_URL}/api/uploads/image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken()}` },
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          uploadedUrls.push(data.url || data.imageUrl || data)
        }
      } catch (err) {
        console.log('Upload failed for one image')
      }
    }

    if (uploadedUrls.length > 0) {
      setServiceForm(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
    }
  }

  const removeServiceImage = (index) => {
    setServiceForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      previewImages: prev.previewImages.filter((_, i) => i !== index)
    }))
  }

  const openServiceModal = (service = null) => {
    if (service) {
      setSelectedService(service)
      setServiceForm({
        name: service.name || '',
        description: service.description || '',
        duration: service.durationMinutes?.toString() || service.duration?.toString().replace(/[^0-9]/g, '') || '',
        price: service.price?.toString() || '',
        images: service.images || [],
        previewImages: service.images || [],
        isActive: service.isActive ?? true
      })
    } else {
      setSelectedService(null)
      setServiceForm({ name: '', description: '', duration: '', price: '', images: [], previewImages: [], isActive: true })
    }
    setShowServiceModal(true)
  }

  const handleSaveService = async (e) => {
    e.preventDefault()
    const isEdit = !!selectedService
    const url = isEdit ? `${API_BASE_URL}/api/admin/services/${selectedService.serviceId}` : `${API_BASE_URL}/api/admin/services`
    const method = isEdit ? 'PUT' : 'POST'
    const body = {
      serviceId: selectedService?.serviceId || 0,
      name: serviceForm.name,
      description: serviceForm.description,
      durationMinutes: parseInt(serviceForm.duration) || 0,
      price: parseFloat(serviceForm.price) || 0,
      thumbnailUrl: serviceForm.images[0] || '',
      isActive: serviceForm.isActive,
      createdAt: selectedService?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setShowServiceModal(false)
        showSuccess(isEdit ? 'Cập nhật dịch vụ thành công!' : 'Tạo dịch vụ thành công!')
        fetchServices()
      }
    } catch (e) { console.log(e) }
  }

  const handleDeleteService = async (service) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/services/${service.serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      showSuccess('Xóa dịch vụ thành công!')
      fetchServices()
    } catch (e) { console.log(e) }
  }

  // ============ PRO MEMBERSHIP ============
  const fetchProMembership = async () => {
    // In real app, fetch current price
    setProPrice('99.99')
  }

  const handleUpdateProPrice = async (e) => {
    e.preventDefault()
    showSuccess('Cập nhật giá Pro Membership thành công!')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('justLoggedIn')
    navigate('/login')
  }

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)
  }

  const getInitials = (name) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <main className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <Link to="/home" className="back-link">← Quay lại</Link>
        </div>
        <h1>Admin Dashboard</h1>
        <div className="admin-header-right">
          {/* Spacer */}
        </div>
      </header>

      {successMessage && (
        <div className="admin-success-banner">
          <Icons.Check /> {successMessage}
        </div>
      )}

      {/* Main Layout with Sidebar */}
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            <button className={`sidebar-btn ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <Icons.Users /> <span>Tài khoản</span>
            </button>
            <button className={`sidebar-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <Icons.Package /> <span>Sản phẩm</span>
            </button>
            <button className={`sidebar-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
              <Icons.Settings /> <span>Dịch vụ</span>
            </button>
            <button className={`sidebar-btn ${activeTab === 'promembership' ? 'active' : ''}`} onClick={() => setActiveTab('promembership')}>
              <Icons.Star /> <span>Pro Membership</span>
            </button>
          </nav>
          
          <div className="sidebar-footer">
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              🚪 <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="admin-content">
        {/* ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Quản lý Tài khoản</h2>
              <button className="add-btn" onClick={() => openAccountModal()}>
                <Icons.Plus /> Thêm tài khoản
              </button>
            </div>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(account => (
                    <tr key={account.userId || account.accountId}>
                      <td>{account.userId || account.accountId}</td>
                      <td>{account.fullName || account.username}</td>
                      <td>{account.email || account.username}</td>
                      <td>{account.phone || '-'}</td>
                      <td>
                        <span className={`role-badge role-${account.role}`}>
                          {account.role === 1 ? 'Admin' : account.role === 2 ? 'Staff' : account.role === 3 ? 'Doctor' : 'Customer'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="edit-btn" onClick={() => openAccountModal(account)}><Icons.Edit /></button>
                          <button className="delete-btn" onClick={() => { setSelectedAccount(account); setShowDeleteModal(true); }}><Icons.Delete /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {accounts.length === 0 && <div className="empty-state">Chưa có tài khoản nào</div>}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Quản lý Sản phẩm</h2>
              <button className="add-btn" onClick={() => openProductModal()}>
                <Icons.Plus /> Thêm sản phẩm
              </button>
            </div>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{width: '60px'}}>Hình</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.productId}>
                      <td>
                        {(product.thumbnailUrl || product.images?.[0]) ? (
                          <img src={product.thumbnailUrl || product.images[0]} alt={product.name} className="product-thumb" />
                        ) : (
                          <div className="product-thumb-placeholder">📦</div>
                        )}
                      </td>
                      <td className="product-name-cell">
                        <span className="product-name">{product.name}</span>
                        <span className="product-brand">{product.brand || '-'}</span>
                      </td>
                      <td className="price-cell">{formatPrice(product.price)}</td>
                      <td>{product.stockQuantity}</td>
                      <td>
                        <div className="action-btns">
                          <button className="edit-btn" onClick={() => openProductModal(product)}><Icons.Edit /></button>
                          <button className="delete-btn" onClick={() => handleDeleteProduct(product)}><Icons.Delete /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <div className="empty-state">Chưa có sản phẩm nào</div>}
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Quản lý Dịch vụ</h2>
              <button className="add-btn" onClick={() => openServiceModal()}>
                <Icons.Plus /> Thêm dịch vụ
              </button>
            </div>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{width: '60px'}}>Hình</th>
                    <th>Tên dịch vụ</th>
                    <th>Thời gian</th>
                    <th>Giá</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(service => (
                    <tr key={service.serviceId}>
                      <td>
                        {(service.thumbnailUrl || service.images?.[0]) ? (
                          <img src={service.thumbnailUrl || service.images[0]} alt={service.name} className="product-thumb" />
                        ) : (
                          <div className="product-thumb-placeholder">⚙️</div>
                        )}
                      </td>
                      <td className="product-name-cell">
                        <span className="product-name">{service.name}</span>
                      </td>
                      <td>{service.durationMinutes ?? service.duration ?? '-'} phút</td>
                      <td className="price-cell">{formatPrice(service.price)}</td>
                      <td>
                        <div className="action-btns">
                          <button className="edit-btn" onClick={() => openServiceModal(service)}><Icons.Edit /></button>
                          <button className="delete-btn" onClick={() => handleDeleteService(service)}><Icons.Delete /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {services.length === 0 && <div className="empty-state">Chưa có dịch vụ nào</div>}
            </div>
          </div>
        )}

        {/* PRO MEMBERSHIP TAB */}
        {activeTab === 'promembership' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Cài đặt Pro Membership</h2>
            </div>
            <div className="pro-settings-card">
              <div className="pro-icon-wrapper">
                <span className="pro-icon">⭐</span>
              </div>
              <h3>Gói Pro Membership</h3>
              <p>Cập nhật giá cho các gói Pro Membership</p>
              <form className="pro-form" onSubmit={handleUpdateProPrice}>
                <div className="pro-price-input">
                  <label>Giá Pro (VND)</label>
                  <input
                    type="number"
                    value={proPrice}
                    onChange={(e) => setProPrice(e.target.value)}
                    placeholder="VD: 199000"
                    required
                  />
                </div>
                <button type="submit" className="update-price-btn">
                  💾 Cập nhật giá
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedAccount ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}</h3>
              <button className="close-btn" onClick={() => setShowAccountModal(false)}><Icons.Close /></button>
            </div>
            <form className="modal-form" onSubmit={handleSaveAccount}>
              <div className="form-group">
                <label>Họ tên</label>
                <input type="text" value={accountForm.fullName} onChange={e => setAccountForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Nhập họ tên" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} placeholder="Nhập email" required />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="tel" value={accountForm.phone} onChange={e => setAccountForm(p => ({ ...p, phone: e.target.value }))} placeholder="Nhập số điện thoại" />
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <select value={accountForm.role} onChange={e => setAccountForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="Customer">Customer</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              {!selectedAccount && (
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input type="password" value={accountForm.password} onChange={e => setAccountForm(p => ({ ...p, password: e.target.value }))} placeholder="Nhập mật khẩu" required />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAccountModal(false)}>Hủy</button>
                <button type="submit" className="submit-btn">{selectedAccount ? '💾 Cập nhật' : '✨ Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-icon-wrapper">
              <span className="delete-icon">🗑️</span>
            </div>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa tài khoản <strong>"{selectedAccount?.fullName || selectedAccount?.email}"</strong>?</p>
            <div className="delete-actions">
              <button className="cancel-delete-btn" onClick={() => setShowDeleteModal(false)}>Hủy bỏ</button>
              <button className="confirm-delete-btn" onClick={handleDeleteAccount}>🗑️ Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="admin-modal product-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedProduct ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}</h3>
              <button className="close-btn" onClick={() => setShowProductModal(false)}><Icons.Close /></button>
            </div>
            <form className="modal-form" onSubmit={handleSaveProduct}>
              {/* Image Upload */}
              <div className="product-image-upload-section">
                <label className="upload-label">Hình ảnh sản phẩm (có thể chọn nhiều)</label>
                <div className="product-images-grid">
                  {productForm.previewImages.map((img, index) => (
                    <div key={index} className="product-image-item">
                      <img src={img} alt={`Image ${index + 1}`} />
                      <button type="button" className="remove-image-btn" onClick={() => removeProductImage(index)}>×</button>
                    </div>
                  ))}
                  <div className="add-image-btn" onClick={() => productFileRef.current?.click()}>
                    <span>+</span>
                    <span>Thêm ảnh</span>
                  </div>
                </div>
                <input type="file" ref={productFileRef} onChange={handleProductImageChange} accept="image/*" multiple style={{ display: 'none' }} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tên sản phẩm *</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: Thức ăn cho chó" required />
                </div>
                <div className="form-group">
                  <label>Thương hiệu</label>
                  <input type="text" value={productForm.brand} onChange={e => setProductForm(p => ({ ...p, brand: e.target.value }))} placeholder="VD: Pedigree" />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Nhập mô tả sản phẩm" rows={3} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá (VND) *</label>
                  <input type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="VD: 150000" required />
                </div>
                <div className="form-group">
                  <label>Số lượng tồn *</label>
                  <input type="number" value={productForm.stockQuantity} onChange={e => setProductForm(p => ({ ...p, stockQuantity: e.target.value }))} placeholder="VD: 100" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Danh mục</label>
                  <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: parseInt(e.target.value) }))}>
                    <option value={1}>Thức ăn</option>
                    <option value={2}>Đồ chơi</option>
                    <option value={3}>Vệ sinh</option>
                    <option value={4}>Y tế</option>
                    <option value={5}>Phụ kiện</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cân nặng (kg)</label>
                  <input type="number" value={productForm.weight} onChange={e => setProductForm(p => ({ ...p, weight: e.target.value }))} placeholder="VD: 1.5" step="0.1" />
                </div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" name="isActive" id="isActive"
                  checked={productForm.isActive}
                  onChange={e => setProductForm(p => ({ ...p, isActive: e.target.checked }))} />
                <label htmlFor="isActive">Đang bán (Active)</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowProductModal(false)}>Hủy</button>
                <button type="submit" className="submit-btn">{selectedProduct ? '💾 Cập nhật' : '✨ Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedService ? 'Cập nhật dịch vụ' : 'Tạo dịch vụ mới'}</h3>
              <button className="close-btn" onClick={() => setShowServiceModal(false)}><Icons.Close /></button>
            </div>
            <form className="modal-form" onSubmit={handleSaveService}>
              {/* Image Upload */}
              <div className="product-image-upload-section">
                <label className="upload-label">Hình ảnh dịch vụ (có thể chọn nhiều)</label>
                <div className="product-images-grid">
                  {serviceForm.previewImages.map((img, index) => (
                    <div key={index} className="product-image-item">
                      <img src={img} alt={`Image ${index + 1}`} />
                      <button type="button" className="remove-image-btn" onClick={() => removeServiceImage(index)}>×</button>
                    </div>
                  ))}
                  <div className="add-image-btn" onClick={() => serviceFileRef.current?.click()}>
                    <span>+</span>
                    <span>Thêm ảnh</span>
                  </div>
                </div>
                <input type="file" ref={serviceFileRef} onChange={handleServiceImageChange} accept="image/*" multiple style={{ display: 'none' }} />
              </div>

              <div className="form-group">
                <label>Tên dịch vụ *</label>
                <input type="text" value={serviceForm.name} onChange={e => setServiceForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: Grooming, Vet Checkup" required />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea value={serviceForm.description} onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))} placeholder="Nhập mô tả dịch vụ" rows={3} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian (phút) *</label>
                  <input type="number" value={serviceForm.duration} onChange={e => setServiceForm(p => ({ ...p, duration: e.target.value }))} placeholder="VD: 60" required />
                </div>
                <div className="form-group">
                  <label>Giá (VND) *</label>
                  <input type="number" value={serviceForm.price} onChange={e => setServiceForm(p => ({ ...p, price: e.target.value }))} placeholder="VD: 200000" required />
                </div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" name="isActiveService" id="isActiveService"
                  checked={serviceForm.isActive}
                  onChange={e => setServiceForm(p => ({ ...p, isActive: e.target.checked }))} />
                <label htmlFor="isActiveService">Đang hoạt động (Active)</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowServiceModal(false)}>Hủy</button>
                <button type="submit" className="submit-btn">{selectedService ? '💾 Cập nhật' : '✨ Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminDashboard
