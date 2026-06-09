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
  const [pendingServiceBlobs, setPendingServiceBlobs] = useState([])

  // Crop modal state
  const [cropModal, setCropModal] = useState({ open: false, file: null, preview: null })
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState(null)
  const dragStartRef = useRef(null)
  const cropStartRef = useRef(null)
  const cropContainerRef = useRef(null)
  const imgRef = useRef(null)
  const [cropTarget, setCropTarget] = useState(null) // 'product' | 'service'

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
        showSuccess(isEdit ? 'Account updated successfully!' : 'Account created successfully!')
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
      showSuccess('Account deleted successfully!')
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
        showSuccess(isEdit ? 'Product updated successfully!' : 'Product created successfully!')
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
      showSuccess('Product deleted successfully!')
      fetchProducts()
    } catch (e) { console.log(e) }
  }

  const handleProductImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setCropModal({ open: true, file, preview: event.target?.result })
      setCropTarget('product')
    }
    reader.readAsDataURL(file)
    if (productFileRef.current) productFileRef.current.value = ''
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
    const target = cropTarget

    if (target === 'service') {
      setServiceForm(prev => ({ ...prev, previewImages: [...prev.previewImages, previewUrl] }))
      setPendingServiceBlobs(prev => [...prev, blob])
    } else {
      setProductForm(prev => ({ ...prev, previewImages: [...prev.previewImages, previewUrl] }))
      const formData = new FormData()
      formData.append('file', blob, 'product.jpg')
      console.log('[Product] Uploading image...')
      fetch(`${API_BASE_URL}/api/uploads/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      }).then(res => res.json()).then(data => {
        console.log('[Product] Upload response:', data)
        setProductForm(prev => ({ ...prev, images: [...prev.images, data.url || data.imageUrl || data] }))
      }).catch(err => console.error('[Product] Upload error:', err))
    }
    setCropModal({ open: false, file: null, preview: null })
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

  const handleServiceImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setCropModal({ open: true, file, preview: event.target?.result })
      setCropTarget('service')
    }
    reader.readAsDataURL(file)
    if (serviceFileRef.current) serviceFileRef.current.value = ''
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
      setPendingServiceBlobs([])
    }
    setShowServiceModal(true)
  }

  const handleSaveService = async (e) => {
    e.preventDefault()
    const isEdit = !!selectedService
    const url = isEdit ? `${API_BASE_URL}/api/admin/services/${selectedService.serviceId}` : `${API_BASE_URL}/api/admin/services`
    const method = isEdit ? 'PUT' : 'POST'

    // Upload pending blobs first, then save
    let uploadedUrls = [...serviceForm.images]
    if (pendingServiceBlobs.length > 0) {
      console.log('[Service] Uploading', pendingServiceBlobs.length, 'pending images...')
      for (const blob of pendingServiceBlobs) {
        const formData = new FormData()
        formData.append('file', blob, 'service.jpg')
        try {
          const res = await fetch(`${API_BASE_URL}/api/uploads/image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getToken()}` },
            body: formData,
          })
          const data = await res.json()
          const imageUrl = data.url || data.imageUrl || data
          console.log('[Service] Uploaded:', imageUrl)
          uploadedUrls.push(imageUrl)
        } catch (err) {
          console.error('[Service] Upload error:', err)
        }
      }
      setPendingServiceBlobs([])
    }

    console.log('[Service] Final images:', uploadedUrls)
    const body = {
      serviceId: selectedService?.serviceId || 0,
      name: serviceForm.name,
      description: serviceForm.description,
      durationMinutes: parseInt(serviceForm.duration) || 0,
      price: parseFloat(serviceForm.price) || 0,
      thumbnailUrl: uploadedUrls[0] || '',
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
        showSuccess(isEdit ? 'Service updated successfully!' : 'Service created successfully!')
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
      showSuccess('Service deleted successfully!')
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
    showSuccess('Pro Membership price updated successfully!')
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
    <>
      {cropModal.open && (
        <div className="crop-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCropCancel()}>
          <div className="crop-modal">
            <div className="crop-modal-header">
              <h3>{cropTarget === 'service' ? 'Crop Service Image' : 'Crop Product Image'}</h3>
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
              <button className="crop-btn crop-btn-ok" onClick={handleCropConfirm}>OK</button>
            </div>
          </div>
        </div>
      )}
      <main className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <Link to="/home" className="back-link">← Back</Link>
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
              <Icons.Users /> <span>Accounts</span>
            </button>
            <button className={`sidebar-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <Icons.Package /> <span>Products</span>
            </button>
            <button className={`sidebar-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
              <Icons.Settings /> <span>Services</span>
            </button>
            <button className={`sidebar-btn ${activeTab === 'promembership' ? 'active' : ''}`} onClick={() => setActiveTab('promembership')}>
              <Icons.Star /> <span>Pro Membership</span>
            </button>
          </nav>
          
          <div className="sidebar-footer">
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              🚪 <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="admin-content">
        {/* ACCOUNTS TAB */}
        {activeTab === 'accounts' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Account Management</h2>
              <button className="add-btn" onClick={() => openAccountModal()}>
                <Icons.Plus /> Add Account
              </button>
            </div>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Actions</th>
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
              {accounts.length === 0 && <div className="empty-state">No accounts found</div>}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Product Management</h2>
              <button className="add-btn" onClick={() => openProductModal()}>
                <Icons.Plus /> Add Product
              </button>
            </div>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{width: '60px'}}>Image</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
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
              {products.length === 0 && <div className="empty-state">No products found</div>}
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Service Management</h2>
              <button className="add-btn" onClick={() => openServiceModal()}>
                <Icons.Plus /> Add Service
              </button>
            </div>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{width: '60px'}}>Image</th>
                    <th>Service Name</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Actions</th>
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
                      <td>{service.durationMinutes ?? service.duration ?? '-'} min</td>
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
              {services.length === 0 && <div className="empty-state">No services found</div>}
            </div>
          </div>
        )}

        {/* PRO MEMBERSHIP TAB */}
        {activeTab === 'promembership' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Pro Membership Settings</h2>
            </div>
            <div className="pro-settings-card">
              <div className="pro-icon-wrapper">
                <span className="pro-icon">⭐</span>
              </div>
              <h3>Pro Membership Plan</h3>
              <p>Update pricing for Pro Membership plans</p>
              <form className="pro-form" onSubmit={handleUpdateProPrice}>
                <div className="pro-price-input">
                  <label>Pro Price (VND)</label>
                  <input
                    type="number"
                    value={proPrice}
                    onChange={(e) => setProPrice(e.target.value)}
                    placeholder="e.g. 199000"
                    required
                  />
                </div>
                <button type="submit" className="update-price-btn">
                  💾 Update Price
                </button>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </main>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedAccount ? 'Update Account' : 'Create New Account'}</h3>
              <button className="close-btn" onClick={() => setShowAccountModal(false)}><Icons.Close /></button>
            </div>
            <form className="modal-form" onSubmit={handleSaveAccount}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={accountForm.fullName} onChange={e => setAccountForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Enter name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={accountForm.email} onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))} placeholder="Enter email" required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={accountForm.phone} onChange={e => setAccountForm(p => ({ ...p, phone: e.target.value }))} placeholder="Enter phone" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={accountForm.role} onChange={e => setAccountForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="Customer">Customer</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              {!selectedAccount && (
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={accountForm.password} onChange={e => setAccountForm(p => ({ ...p, password: e.target.value }))} placeholder="Enter password" required />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAccountModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{selectedAccount ? '💾 Update' : '✨ Create'}</button>
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
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete account <strong>"{selectedAccount?.fullName || selectedAccount?.email}"</strong>?</p>
            <div className="delete-actions">
              <button className="cancel-delete-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="confirm-delete-btn" onClick={handleDeleteAccount}>🗑️ Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="admin-modal product-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedProduct ? 'Update Product' : 'Create New Product'}</h3>
              <button className="close-btn" onClick={() => setShowProductModal(false)}><Icons.Close /></button>
            </div>
            <form className="modal-form" onSubmit={handleSaveProduct}>
              {/* Image Upload */}
              <div className="product-image-upload-section">
                <label className="upload-label">Product Images (multiple allowed)</label>
                <div className="product-images-grid">
                  {productForm.previewImages.map((img, index) => (
                    <div key={index} className="product-image-item">
                      <img src={img} alt={`Image ${index + 1}`} />
                      <button type="button" className="remove-image-btn" onClick={() => removeProductImage(index)}>×</button>
                    </div>
                  ))}
                  <div className="add-image-btn" onClick={() => productFileRef.current?.click()}>
                    <span>+</span>
                    <span>Add Image</span>
                  </div>
                </div>
                <input type="file" ref={productFileRef} onChange={handleProductImageChange} accept="image/*" multiple style={{ display: 'none' }} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Dog Food" required />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input type="text" value={productForm.brand} onChange={e => setProductForm(p => ({ ...p, brand: e.target.value }))} placeholder="e.g. Pedigree" />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Enter product description" rows={3} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (VND) *</label>
                  <input type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 150000" required />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input type="number" value={productForm.stockQuantity} onChange={e => setProductForm(p => ({ ...p, stockQuantity: e.target.value }))} placeholder="e.g. 100" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: parseInt(e.target.value) }))}>
                    <option value={1}>Food</option>
                    <option value={2}>Toys</option>
                    <option value={3}>Grooming</option>
                    <option value={4}>Health</option>
                    <option value={5}>Accessories</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" value={productForm.weight} onChange={e => setProductForm(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 1.5" step="0.1" />
                </div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" name="isActive" id="isActive"
                  checked={productForm.isActive}
                  onChange={e => setProductForm(p => ({ ...p, isActive: e.target.checked }))} />
                <label htmlFor="isActive">Active</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{selectedProduct ? '💾 Update' : '✨ Create'}</button>
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
              <h3>{selectedService ? 'Update Service' : 'Create New Service'}</h3>
              <button className="close-btn" onClick={() => setShowServiceModal(false)}><Icons.Close /></button>
            </div>
            <form className="modal-form" onSubmit={handleSaveService}>
              {/* Image Upload */}
              <div className="product-image-upload-section">
                <label className="upload-label">Service Images (multiple allowed)</label>
                <div className="product-images-grid">
                  {serviceForm.previewImages.map((img, index) => (
                    <div key={index} className="product-image-item">
                      <img src={img} alt={`Image ${index + 1}`} />
                      <button type="button" className="remove-image-btn" onClick={() => removeServiceImage(index)}>×</button>
                    </div>
                  ))}
                  <div className="add-image-btn" onClick={() => serviceFileRef.current?.click()}>
                    <span>+</span>
                    <span>Add Image</span>
                  </div>
                </div>
                <input type="file" ref={serviceFileRef} onChange={handleServiceImageChange} accept="image/*" multiple style={{ display: 'none' }} />
              </div>

              <div className="form-group">
                <label>Service Name *</label>
                <input type="text" value={serviceForm.name} onChange={e => setServiceForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Grooming, Vet Checkup" required />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={serviceForm.description} onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))} placeholder="Enter service description" rows={3} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input type="number" value={serviceForm.duration} onChange={e => setServiceForm(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 60" required />
                </div>
                <div className="form-group">
                  <label>Price (VND) *</label>
                  <input type="number" value={serviceForm.price} onChange={e => setServiceForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 200000" required />
                </div>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" name="isActiveService" id="isActiveService"
                  checked={serviceForm.isActive}
                  onChange={e => setServiceForm(p => ({ ...p, isActive: e.target.checked }))} />
                <label htmlFor="isActiveService">Active</label>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowServiceModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{selectedService ? '💾 Update' : '✨ Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminDashboard
